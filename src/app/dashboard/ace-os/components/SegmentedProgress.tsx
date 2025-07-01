
'use client';

import { cn } from "@/lib/utils";

type ProgressSegment = {
    value: number;
    color: string; // e.g., 'bg-blue-500'
    label: string;
    count: number;
};

type SegmentedProgressProps = {
    segments: ProgressSegment[];
};

export function SegmentedProgress({ segments }: SegmentedProgressProps) {
    const totalCards = segments.reduce((sum, seg) => sum + seg.count, 0);

    return (
        <div className="space-y-3">
            <div className="flex h-3 w-full overflow-hidden rounded-full bg-secondary">
                {segments.map((segment, index) => {
                    if (segment.count === 0) {
                        return null;
                    }
                    const percentage = totalCards > 0 ? (segment.count / totalCards) * 100 : 0;
                    return (
                        <div
                            key={index}
                            className={cn("transition-all duration-500", segment.color)}
                            style={{ width: `${percentage}%` }}
                            title={`${segment.label}: ${segment.count} cards`}
                        />
                    );
                })}
            </div>
            <div className="flex justify-between text-xs text-muted-foreground flex-wrap gap-2">
                 {segments.map((segment, index) => (
                    <div key={index} className="flex items-center gap-2">
                        <span className={cn("h-2.5 w-2.5 rounded-full", segment.color)} />
                        <span>{segment.label} ({segment.count})</span>
                    </div>
                 ))}
            </div>
        </div>
    );
}
