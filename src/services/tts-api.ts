import { apiRequest } from './api';

export const ttsApi = {
  createAudio: (chapterId: string, voice = 'an') => apiRequest<{ audioUrl: string }>('/tts', {
    method: 'POST',
    body: JSON.stringify({ chapter_id: chapterId, voice }),
  }),
};
