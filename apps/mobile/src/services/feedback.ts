import { API_BASE_URL, buildApiUrl } from '../utils/env';

export interface FeedbackPayload {
  highlightId: string;
  wasHelpful: boolean;
  context?: string;
}

export async function submitFeedback(payload: FeedbackPayload): Promise<boolean> {
  if (!API_BASE_URL) {
    return true;
  }

  try {
    const response = await fetch(buildApiUrl('/api/feedback'), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      console.warn('Feedback submission failed', response.status, await safeReadJson(response));
      return false;
    }

    return true;
  } catch (error) {
    console.error('Feedback submission error', error);
    return false;
  }
}

async function safeReadJson(response: Response) {
  try {
    return await response.json();
  } catch (error) {
    return null;
  }
}
