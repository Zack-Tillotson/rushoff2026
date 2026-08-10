// Generic family avatars — represents *who the family is*, distinct from what they
// caught, so there's no confusion with the catch mechanic. See pokemon-roster.md.
// Custom per-family photo avatars are a deferred follow-up (see requirements.md).

export interface Avatar {
  id: string;
  emoji: string;
  label: string;
}

export const AVATARS: Avatar[] = [
  { id: "runner-1", emoji: "🏃", label: "Runner" },
  { id: "runner-2", emoji: "🏃‍♀️", label: "Runner" },
  { id: "fox", emoji: "🦊", label: "Fox" },
  { id: "bear", emoji: "🐻", label: "Bear" },
  { id: "rabbit", emoji: "🐰", label: "Rabbit" },
  { id: "star", emoji: "⭐", label: "Star" },
  { id: "flame", emoji: "🔥", label: "Flame" },
  { id: "bolt", emoji: "⚡", label: "Bolt" },
];

export function getAvatar(id: string): Avatar | undefined {
  return AVATARS.find((a) => a.id === id);
}
