import { setupServer } from './msw-bridge';
import { handlers } from './handlers';

export const server = setupServer(...handlers);

if (process.env.NODE_ENV === 'test') {
  // During Jest the server is managed in setup file.
} else if (__DEV__) {
  server.listen();
  console.info('[msw] Mock service worker running (native)');
}
