import { prisma } from "../lib/prisma";

export type Team = "FILIPE" | "MELINA";

export const pollService = {
  async results() {
    const [filipe, melina, votes] = await Promise.all([
      prisma.vote.count({ where: { team: "FILIPE" } }),
      prisma.vote.count({ where: { team: "MELINA" } }),
      prisma.vote.findMany({
        orderBy: { createdAt: "desc" },
        select: { name: true, team: true },
      }),
    ]);

    return { filipe, melina, total: filipe + melina, votes };
  },

  async create(name: string, team: Team) {
    return prisma.vote.create({ data: { name, team } });
  },
};
