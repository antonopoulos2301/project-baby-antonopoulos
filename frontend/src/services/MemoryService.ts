import type { Memory } from "../types/Memory";

const API_URL = import.meta.env.VITE_API_URL ?? "";

export const memoryService = {
  async findAll(): Promise<Memory[]> {
    const response = await fetch(`${API_URL}/api/memories`);

    if (!response.ok) {
      throw new Error("Não foi possível carregar as memórias.");
    }

    const memories: Memory[] = await response.json();

    return memories;
  },
};
