import React from "react";
import { cn } from "../lib/utils";

interface SkeletonProps {
  className?: string;
}

export function Skeleton({ className }: SkeletonProps) {
  return (
    <div
      className={cn(
        "bg-accent/50 rounded animate-pulse",
        className
      )}
    />
  );
}

export function MessageSkeleton() {
  return (
    <div className="flex gap-3 animate-fade-in">
      {/* Avatar */}
      <Skeleton className="w-8 h-8 rounded-lg shrink-0" />
      
      {/* Content */}
      <div className="flex-1 space-y-2">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-4 w-1/2" />
        <Skeleton className="h-4 w-2/3" />
      </div>
    </div>
  );
}

export function CodeBlockSkeleton() {
  return (
    <div className="rounded-lg border border-border overflow-hidden animate-fade-in">
      <div className="bg-[#1e1e1e] px-4 py-2">
        <Skeleton className="h-4 w-20" />
      </div>
      <div className="bg-[#0d0d0d] p-4 space-y-2">
        <Skeleton className="h-3 w-full" />
        <Skeleton className="h-3 w-4/5" />
        <Skeleton className="h-3 w-3/4" />
        <Skeleton className="h-3 w-1/2" />
      </div>
    </div>
  );
}