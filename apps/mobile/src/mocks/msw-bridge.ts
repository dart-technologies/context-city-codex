/*
 * Lightweight fetch interception utilities inspired by MSW.
 * This module avoids depending on Node-specific APIs so it works in React Native
 * bundles. It also exposes the same `http`, `HttpResponse`, `passthrough`, and
 * `setupServer` helpers we rely on in tests and dev builds.
 */

const PASSTHROUGH = Symbol('msw-bridge-passthrough');

type Method = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE' | 'ALL';

type RestRequestLike = {
  params: Record<string, string>;
  method: Method;
  url: string;
  headers: Headers;
  text: () => Promise<string>;
  json: () => Promise<any>;
};

type MockResponseInit = ResponseInit & { body?: BodyInit | null };

type ResolverResult = Response | MockResponseInit | typeof PASSTHROUGH | void;

type Resolver = (request: RestRequestLike) => ResolverResult | Promise<ResolverResult>;

type Handler = {
  method: Method;
  matcher: string;
  resolver: Resolver;
};

function createHandlerFactory(method: Method) {
  return (matcher: string, resolver: Resolver): Handler => ({ method, matcher, resolver });
}

export const http = {
  get: createHandlerFactory('GET'),
  post: createHandlerFactory('POST'),
  put: createHandlerFactory('PUT'),
  patch: createHandlerFactory('PATCH'),
  delete: createHandlerFactory('DELETE'),
  all: createHandlerFactory('ALL'),
};

export const HttpResponse = {
  json(body: unknown, init: ResponseInit = {}) {
    return new Response(JSON.stringify(body), {
      status: init.status ?? 200,
      headers: {
        'Content-Type': 'application/json',
        ...(init.headers || {}),
      },
    });
  },
};

export const passthrough = (): typeof PASSTHROUGH => PASSTHROUGH;

function matchPath(pattern: string, url: URL) {
  const patternSegments = pattern.replace(/^\//, '').split('/');
  const targetSegments = url.pathname.replace(/^\//, '').split('/');
  if (patternSegments.length !== targetSegments.length) {
    return null;
  }
  const params: Record<string, string> = {};
  for (let index = 0; index < patternSegments.length; index += 1) {
    const expected = patternSegments[index];
    const actual = targetSegments[index];
    if (expected.startsWith(':')) {
      params[expected.slice(1)] = decodeURIComponent(actual);
      continue;
    }
    if (expected !== actual) {
      return null;
    }
  }
  return params;
}

export function setupServer(...initialHandlers: Handler[]) {
  let handlers = [...initialHandlers];
  let originalFetch: typeof global.fetch | undefined;

  const resolve = async (input: RequestInfo | URL, init?: RequestInit) => {
    const request = typeof input === 'string' || input instanceof URL ? new Request(input, init) : input;
    const targetUrl = request.url.startsWith('http://') || request.url.startsWith('https://')
      ? request.url
      : `http://msw.local${request.url.startsWith('/') ? '' : '/'}${request.url}`;
    const url = new URL(targetUrl);
    const method = (request.method || 'GET').toUpperCase() as Method;

    for (const handler of handlers) {
      if (handler.method !== 'ALL' && handler.method !== method) {
        continue;
      }
      const params = matchPath(handler.matcher, url);
      if (!params) {
        continue;
      }

      const result = await handler.resolver({
        params,
        method,
        url: request.url,
        headers: request.headers,
        text: () => request.text(),
        json: () => request.json(),
      });

      if (!result || result === PASSTHROUGH) {
        return undefined;
      }

      if (result instanceof Response) {
        return result;
      }

      const { body, ...init } = result as MockResponseInit;
      return new Response(body, init);
    }

    return undefined;
  };

  return {
    listen() {
      if (originalFetch) return;
      originalFetch = global.fetch?.bind(global) ?? fetch;
      global.fetch = async (input: RequestInfo | URL, init?: RequestInit) => {
        const mocked = await resolve(input, init);
        if (mocked) {
          return mocked;
        }
        return originalFetch!(input, init);
      };
    },
    close() {
      if (originalFetch) {
        global.fetch = originalFetch;
        originalFetch = undefined;
      }
    },
    resetHandlers(nextHandlers?: Handler[]) {
      handlers = nextHandlers ? [...nextHandlers] : [...initialHandlers];
    },
    use(...additionalHandlers: Handler[]) {
      handlers.push(...additionalHandlers);
    },
  };
}
