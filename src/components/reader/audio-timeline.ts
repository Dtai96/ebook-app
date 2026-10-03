import type { AudioSegment } from '@/services/tts-api';

export function segmentDuration(segment: AudioSegment): number {
  if (segment.duration !== null && Number.isFinite(segment.duration) && segment.duration > 0) {
    return segment.duration;
  }

  return Math.max(1, segment.text.trim().split(/\s+/).length / 2.5);
}

export function chapterPosition(durations: number[], index: number, position: number): number {
  const before = durations.slice(0, index).reduce((sum, duration) => sum + duration, 0);
  const current = durations[index] ?? 0;

  return before + Math.min(Number.isFinite(position) ? Math.max(0, position) : 0, current);
}

export function seekTarget(durations: number[], seconds: number): { index: number; offset: number } | null {
  if (!durations.length || !Number.isFinite(seconds)) return null;

  const total = durations.reduce((sum, duration) => sum + duration, 0);
  if (!Number.isFinite(total) || total <= 0) return null;

  let remaining = Math.max(0, Math.min(total, seconds));
  let index = 0;
  while (index < durations.length - 1 && remaining >= durations[index]) {
    remaining -= durations[index];
    index += 1;
  }

  return { index, offset: Math.max(0, Math.min(remaining, durations[index])) };
}

export function timelineFraction(locationX: number | undefined, width: number): number | null {
  if (!Number.isFinite(locationX) || !Number.isFinite(width) || width <= 0) return null;

  return Math.max(0, Math.min(1, locationX! / width));
}
