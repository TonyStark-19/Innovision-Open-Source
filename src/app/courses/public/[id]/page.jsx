"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Clock, BookOpen, Globe, Loader2 } from "lucide-react";
import { calculateEstimatedTime } from "@/lib/time-utils";

export default function PublicCoursePage() {
  const params = useParams();
  const router = useRouter();
  const courseId = params.id;
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (courseId) {
      fetchPublicCourse();
    }
  }, [courseId]);

  const fetchPublicCourse = async () => {
    try {
      const response = await fetch(`/api/courses/public/${courseId}`);
      const data = await response.json();

      if (data.success) {
        setCourse(data.course);
      } else {
        setError(data.error || "Course not found");
      }
    } catch (error) {
      console.error("Error fetching course:", error);
      setError("Failed to load course");
    } finally {
      setLoading(false);
    }
  };

  const getDifficultyLabel = (diff) => {
    switch (diff) {
      case "fast":
        return "Fast-paced";
      case "balanced":
        return "Balanced";
      case "inDepth":
        return "In-depth";
      default:
        return "Balanced";
    }
  };

  const getDifficultyColor = (diff) => {
    switch (diff) {
      case "fast":
        return "bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/20";
      case "balanced":
        return "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20";
      case "inDepth":
        return "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20";
      default:
        return "bg-gray-500/10 text-gray-600 dark:text-gray-400 border-gray-500/20";
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">Loading course...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-6 min-h-screen flex items-center justify-center">
        <Card className="max-w-md w-full">
          <CardContent className="p-6 text-center">
            <Globe className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
            <h2 className="text-2xl font-bold mb-2">Course Not Available</h2>
            <p className="text-muted-foreground mb-6">{error}</p>
            <Button onClick={() => router.push("/")}>Go to Homepage</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const estimatedTime = calculateEstimatedTime(course.chapterCount, course.difficulty);

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <Card className="mb-6">
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <CardTitle className="text-3xl mb-2">{course.courseTitle}</CardTitle>
              <CardDescription className="text-base">
                {course.courseDescription}
              </CardDescription>
            </div>
            <Globe className="h-8 w-8 text-muted-foreground" />
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-4">
            <div className="flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-muted-foreground" />
              <span className="text-sm">
                {course.chapterCount} {course.chapterCount === 1 ? "Chapter" : "Chapters"}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-muted-foreground" />
              <span className="text-sm">{estimatedTime}</span>
            </div>
            <span
              className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${getDifficultyColor(
                course.difficulty
              )}`}
            >
              {getDifficultyLabel(course.difficulty)}
            </span>
          </div>

          <div className="pt-4 border-t">
            <p className="text-sm text-muted-foreground mb-4">
              This is a public course shared on InnoVision. Sign up to create your own courses!
            </p>
            <div className="flex gap-2">
              <Button onClick={() => router.push("/login")}>
                Sign Up to Create Courses
              </Button>
              <Button variant="outline" onClick={() => router.push("/")}>
                Explore InnoVision
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Chapters List */}
      <Card>
        <CardHeader>
          <CardTitle>Course Content</CardTitle>
          <CardDescription>
            {course.chapterCount} chapters in this course
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {course.chapters.map((chapter, index) => (
              <div
                key={index}
                className="flex items-start gap-3 p-3 border rounded-lg hover:bg-accent/50 transition-colors"
              >
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary font-semibold text-sm shrink-0">
                  {index + 1}
                </div>
                <div className="flex-1">
                  <h4 className="font-medium">
                    {chapter.chapterTitle || chapter.title || `Chapter ${index + 1}`}
                  </h4>
                  {(chapter.chapterDescription || chapter.description) && (
                    <p className="text-sm text-muted-foreground mt-1">
                      {chapter.chapterDescription || chapter.description}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
