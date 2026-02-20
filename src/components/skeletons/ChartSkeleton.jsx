import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function ChartSkeleton({ title, description }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title || <Skeleton className="h-6 w-32" />}</CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent>
        {/* Chart bars skeleton */}
        <div className="flex items-end justify-between gap-2 h-64">
          {[...Array(12)].map((_, idx) => (
            <Skeleton
              key={idx}
              className="flex-1"
              style={{
                height: `${Math.random() * 60 + 40}%`,
              }}
            />
          ))}
        </div>
        {/* X-axis labels */}
        <div className="flex justify-between mt-2">
          {[...Array(6)].map((_, idx) => (
            <Skeleton key={idx} className="h-3 w-8" />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
