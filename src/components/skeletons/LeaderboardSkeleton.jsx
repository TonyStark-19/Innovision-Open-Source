import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Trophy } from "lucide-react";

export default function LeaderboardSkeleton() {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Trophy className="h-5 w-5 text-yellow-500" />
          Leaderboard
        </CardTitle>
        <CardDescription className="text-xs">Compete with other learners</CardDescription>
      </CardHeader>
      <CardContent>
        {/* Tabs skeleton */}
        <div className="flex gap-2 mb-4">
          <Skeleton className="h-9 flex-1" />
          <Skeleton className="h-9 flex-1" />
          <Skeleton className="h-9 flex-1" />
        </div>

        {/* Leaderboard items skeleton */}
        <div className="space-y-2">
          {[...Array(5)].map((_, idx) => (
            <div
              key={idx}
              className="flex items-center gap-3 p-3 rounded-lg border border-border"
            >
              {/* Rank */}
              <Skeleton className="w-10 h-10 rounded-full" />

              {/* Avatar */}
              <Skeleton className="w-10 h-10 rounded-full" />

              {/* User info */}
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-3 w-24" />
              </div>

              {/* XP */}
              <div className="text-right space-y-1">
                <Skeleton className="h-5 w-16 ml-auto" />
                <Skeleton className="h-3 w-8 ml-auto" />
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
