export interface MemoryReaction {
  emoji: string;
  count: number;
}

export interface MemoryComment {
  id: number;
  name: string;
  text: string;
  createdAt: string;
}

export interface Memory {
  id: number;
  title: string;
  description: string | null;
  happenedAt: string;
  imageUrl: string | null;
  type: string;
  reactions?: MemoryReaction[];
  comments?: MemoryComment[];
}
