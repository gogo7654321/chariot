"use client"
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { Badge } from "@/components/ui/badge";

const courses = [
    { name: "AP US History", progress: 65, xp: 4500, examDays: 57 },
    { name: "AP Chemistry", progress: 40, xp: 2800, examDays: 45 },
    { name: "AP English Literature", progress: 80, xp: 6200, examDays: 52 },
    { name: "AP Calculus AB", progress: 95, xp: 8100, examDays: 38 },
    { name: "AP Biology", progress: 55, xp: 3900, examDays: 48 },
];

export default function CourseProgress() {
    return (
        <Card className="overflow-hidden">
            <CardHeader>
                <CardTitle>AP Class Progress</CardTitle>
            </CardHeader>
            <CardContent>
                 <Carousel
                    opts={{
                        align: "start",
                        loop: false,
                    }}
                    className="w-full"
                >
                    <CarouselContent>
                        {courses.map((course) => (
                            <CarouselItem key={course.name} className="md:basis-1/2 xl:basis-1/3">
                                <Card className="h-full flex flex-col">
                                    <CardHeader>
                                        <CardTitle className="text-lg">{course.name}</CardTitle>
                                    </CardHeader>
                                    <CardContent className="flex-grow">
                                        <div className="space-y-2">
                                            <Progress value={course.progress} className="w-full" />
                                            <p className="text-sm text-muted-foreground">{course.progress}% complete</p>
                                        </div>
                                        <div className="flex justify-between text-sm mt-4">
                                            <span className="text-muted-foreground">XP Earned</span>
                                            <span className="font-medium">{course.xp.toLocaleString()} XP</span>
                                        </div>
                                        <div className="flex justify-between text-sm">
                                             <span className="text-muted-foreground">Time Spent</span>
                                             <span className="font-medium">{course.progress * 2}h 15m</span>
                                        </div>
                                    </CardContent>
                                    <CardFooter>
                                        <Badge variant="secondary">Exam in {course.examDays} days</Badge>
                                    </CardFooter>
                                </Card>
                            </CarouselItem>
                        ))}
                    </CarouselContent>
                    <CarouselPrevious className="hidden sm:flex" />
                    <CarouselNext className="hidden sm:flex" />
                </Carousel>
            </CardContent>
        </Card>
    );
}
