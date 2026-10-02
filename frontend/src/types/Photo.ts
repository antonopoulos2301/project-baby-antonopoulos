import type { MemoryReaction, MemoryComment } from "./Memory";

export interface Photo {
  id: number;
  title: string | null;
  imageUrl: string;
  createdAt: string;
  reactions?: MemoryReaction[];
  comments?: MemoryComment[];
}
