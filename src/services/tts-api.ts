import { apiRequest } from './api';

export type AudioSegment = { index: number; text: string; audio_url: string | null; duration: number | null; word_starts: number[] | null; timing_quality: 'phoneme' | 'estimated' };
export type AudioState = { data: {
  status: 'queued' | 'processing' | 'ready' | 'failed' | 'paused';
  ready_count: number;
  total_count: number;
  segments: AudioSegment[];
} };

export const ttsApi = {
  createAudio: (chapterId: string, index = 0) => apiRequest<AudioState>(`/chapters/${encodeURIComponent(chapterId)}/audio`, { method: 'POST', body: JSON.stringify({ index }) }),
  status: (chapterId: string) => apiRequest<AudioState>(`/chapters/${encodeURIComponent(chapterId)}/audio`),
};
