"use client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, BookOpen, Sparkles, Search, X, Filter } from "lucide-react";
import CourseCard from "@/components/Home/CourseCard";
import Link from "next/link";
import { useState, useEffect } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { PageBackground, GridPattern, PageHeader, ScrollReveal, HoverCard } from "@/components/ui/PageWrapper";
import ChatBot from "@/components/chat/ChatBot";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function page() {
    const [error, setError] = useState(null);
    const [roadmaps, setRoadmaps] = useState([]);
    const [loading, setLoading] = useState(true);
    
    // Filter states
    const [searchQuery, setSearchQuery] = useState("");
    const [difficultyFilter, setDifficultyFilter] = useState("all");
    const [sortBy, setSortBy] = useState("newest");

    // Load filter preferences from localStorage
    useEffect(() => {
        const savedFilters = localStorage.getItem("courseFilters");
        if (savedFilters) {
            const { search, difficulty, sort } = JSON.parse(savedFilters);
            setSearchQuery(search || "");
            setDifficultyFilter(difficulty || "all");
            setSortBy(sort || "newest");
        }
    }, []);

    // Save filter preferences to localStorage
    useEffect(() => {
        localStorage.setItem(
            "courseFilters",
            JSON.stringify({
                search: searchQuery,
                difficulty: difficultyFilter,
                sort: sortBy,
            })
        );
    }, [searchQuery, difficultyFilter, sortBy]);

    async function fetchRoadmaps() {
        setLoading(true);
        setError(null);

        try {
            const response = await fetch("/api/roadmap/all");

            if (!response.ok) {
                throw new Error("Failed to fetch roadmaps");
            }

            const data = await response.json();
            setRoadmaps(data?.docs || []);
        } catch (err) {
            console.error("Roadmap fetch error:", err);
            setError("Unable to load your courses.");
            setRoadmaps([]);
        } finally {
            setLoading(false);
        }
    }
    useEffect(() => {
        fetchRoadmaps();
    }, []);

    const completedCourses = roadmaps.filter(r => r.process === "completed");

    // Filter and sort courses
    const filteredCourses = completedCourses
        .filter((course) => {
            // Search filter
            const matchesSearch = course.courseTitle
                .toLowerCase()
                .includes(searchQuery.toLowerCase());

            // Difficulty filter
            const matchesDifficulty =
                difficultyFilter === "all" || course.difficulty === difficultyFilter;

            return matchesSearch && matchesDifficulty;
        })
        .sort((a, b) => {
            // Sort logic
            if (sortBy === "newest") {
                return new Date(b.createdAt) - new Date(a.createdAt);
            } else if (sortBy === "oldest") {
                return new Date(a.createdAt) - new Date(b.createdAt);
            } else if (sortBy === "title") {
                return a.courseTitle.localeCompare(b.courseTitle);
            }
            return 0;
        });

    // Clear all filters
    const clearFilters = () => {
        setSearchQuery("");
        setDifficultyFilter("all");
        setSortBy("newest");
    };

    // Check if any filters are active
    const hasActiveFilters = searchQuery !== "" || difficultyFilter !== "all" || sortBy !== "newest";

    return (
        <div className="min-h-screen bg-background relative">
            <PageBackground variant="courses" />
            <GridPattern opacity={0.02} />

            <div className="max-w-6xl flex flex-col gap-4 items-center p-4 mb-16 mx-auto relative z-10">
                <PageHeader
                    title="Your Courses"
                    description="Manage and continue your learning journey"
                    icon={BookOpen}
                    iconColor="text-blue-500"
                    badge={<><Sparkles className="h-3.5 w-3.5" /> My Learning</>}
                />

                {/* Search and Filter Section */}
                {!loading && !error && completedCourses.length > 0 && (
                    <div className="w-full max-w-4xl space-y-4">
                        {/* Search Bar */}
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                                type="text"
                                placeholder="Search courses by title..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-10 pr-10 h-11 bg-card/50 backdrop-blur-sm border-border/50 focus:border-blue-500/50"
                            />
                            {searchQuery && (
                                <button
                                    onClick={() => setSearchQuery("")}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                                >
                                    <X className="h-4 w-4" />
                                </button>
                            )}
                        </div>

                        {/* Filters Row */}
                        <div className="flex flex-wrap items-center gap-3">
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <Filter className="h-4 w-4" />
                                <span className="font-medium">Filters:</span>
                            </div>

                            {/* Difficulty Filter */}
                            <Select value={difficultyFilter} onValueChange={setDifficultyFilter}>
                                <SelectTrigger className="w-[160px] h-9 bg-card/50 backdrop-blur-sm border-border/50">
                                    <SelectValue placeholder="Difficulty" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Difficulties</SelectItem>
                                    <SelectItem value="fast">Fast-paced</SelectItem>
                                    <SelectItem value="balanced">Balanced</SelectItem>
                                    <SelectItem value="in-depth">In-depth</SelectItem>
                                </SelectContent>
                            </Select>

                            {/* Sort By */}
                            <Select value={sortBy} onValueChange={setSortBy}>
                                <SelectTrigger className="w-[160px] h-9 bg-card/50 backdrop-blur-sm border-border/50">
                                    <SelectValue placeholder="Sort by" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="newest">Newest First</SelectItem>
                                    <SelectItem value="oldest">Oldest First</SelectItem>
                                    <SelectItem value="title">Title (A-Z)</SelectItem>
                                </SelectContent>
                            </Select>

                            {/* Clear Filters Button */}
                            {hasActiveFilters && (
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={clearFilters}
                                    className="h-9 text-muted-foreground hover:text-foreground"
                                >
                                    <X className="h-4 w-4 mr-1" />
                                    Clear Filters
                                </Button>
                            )}

                            {/* Course Count */}
                            <div className="ml-auto text-sm text-muted-foreground">
                                Showing {filteredCourses.length} of {completedCourses.length} courses
                            </div>
                        </div>
                    </div>
                )}

                <div className="flex gap-6 justify-center flex-wrap w-full">
                    {loading ? (
                        Array(6)
                            .fill(0)
                            .map((_, i) => (
                                <Skeleton
                                    key={i}
                                    className="w-[320px] h-[240px] rounded-xl"
                                />
                            ))
                    ) : error ? (
                        <div className="w-full text-center py-16 text-muted-foreground">
                            <div className="flex flex-col items-center">
                                <BookOpen className="h-12 w-12 mb-4 opacity-50" />
                                <p className="text-lg font-semibold">
                                    We couldn't load your courses
                                </p>
                                <p className="text-sm mt-2">
                                    Please try again or refresh the page.
                                </p>
                                <button
                                    onClick={fetchRoadmaps}
                                    className="mt-4 px-4 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700 transition"
                                >
                                    Retry
                                </button>
                            </div>
                        </div>
                    ) : completedCourses.length === 0 ? (
                        <div className="w-full text-center py-16 text-muted-foreground">
                            <div className="flex flex-col items-center">
                                <BookOpen className="h-12 w-12 mb-4 opacity-50" />
                                <p className="text-lg font-medium">
                                    You don't have any courses yet
                                </p>
                                <p className="text-sm mt-2">
                                    Start by generating your first roadmap
                                </p>
                                <Link href="/generate" className="mt-4">
                                    <Button>Create Course</Button>
                                </Link>
                            </div>
                        </div>
                    ) : filteredCourses.length === 0 ? (
                        <div className="w-full text-center py-16 text-muted-foreground">
                            <div className="flex flex-col items-center">
                                <Search className="h-12 w-12 mb-4 opacity-50" />
                                <p className="text-lg font-medium">
                                    No courses found
                                </p>
                                <p className="text-sm mt-2">
                                    Try adjusting your search or filters
                                </p>
                                <Button
                                    variant="outline"
                                    onClick={clearFilters}
                                    className="mt-4"
                                >
                                    Clear Filters
                                </Button>
                            </div>
                        </div>
                    ) : (
                        <>
                            {/* Course Cards */}
                            {filteredCourses.map((roadmap, index) => (
                                <ScrollReveal key={roadmap.id} delay={index * 50}>
                                    <HoverCard>
                                        <CourseCard
                                            course={roadmap}
                                            onDelete={fetchRoadmaps}
                                        />
                                    </HoverCard>
                                </ScrollReveal>
                            ))}

                            {/* Create New Course Card */}
                            <ScrollReveal delay={filteredCourses.length * 50}>
                                <HoverCard>
                                    <Card className="w-[320px] h-[240px] relative flex items-center justify-center border-2 border-dashed border-border/50 bg-card/30 backdrop-blur-sm hover:border-blue-500/50 transition-colors">
                                        <div className="flex flex-col items-center text-muted-foreground">
                                            <div className="w-16 h-16 rounded-full bg-blue-500/10 flex items-center justify-center mb-3">
                                                <Plus strokeWidth={1.5} className="w-8 h-8 text-blue-500" />
                                            </div>
                                            <p className="text-lg text-center font-medium">
                                                Create New Course
                                            </p>
                                        </div>
                                        <Link href={`/generate`} scroll={false}>
                                            <span className="absolute inset-0"></span>
                                        </Link>
                                    </Card>
                                </HoverCard>
                            </ScrollReveal>
                        </>
                    )}
                </div>
            </div>
            <ChatBot />
        </div>
    );
}
