import { MemoryCard } from "./MemoryCard";

import type { Memory } from "../types/Memory";

interface TimelineProps {
    memories: Memory[];
}

export function Timeline({
    memories,
}: TimelineProps) {
    return (
        <div className="relative">
            <div className="absolute bottom-0 left-[11px] top-0 w-px bg-beige sm:left-1/2 sm:-translate-x-1/2" />

            <div className="space-y-10 sm:space-y-16">
                {memories.map((memory, index) => (
                    <MemoryCard
                        key={memory.id}
                        memory={memory}
                        index={index}
                    />
                ))}
            </div>
        </div>
    );
}