
import { notFound } from "next/navigation";
import { getCourseBySlug } from "@/lib/courses";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AceMascot } from "@/components/AceMascot";
import { CountdownTimer } from "./CountdownTimer";
import { FileText, Film } from "lucide-react";
import Image from "next/image";
import { CourseIcon } from "@/components/CourseIcon";
import { CourseProgressClient } from "./CourseProgressClient";
import { HonorsExamSetter } from "./HonorsExamSetter";

type CoursePageProps = {
  params: {
    slug: string;
  };
};

export default function CoursePage({ params }: CoursePageProps) {
  const course = getCourseBySlug(params.slug);

  if (!course) {
    notFound();
  }
  
  const isHonors = course.name.includes("Honors");

  return (
    <div className="relative">
      <Image 
        src={`https://placehold.co/1920x1080.png`} 
        alt={`${course.name} themed background`}
        layout="fill"
        objectFit="cover"
        className="absolute inset-0 z-[-1] opacity-10"
        data-ai-hint="abstract background"
      />
      <div className="container mx-auto px-4 md:px-6 py-12">
        <header className="mb-12">
          <div className="flex items-center gap-4 mb-4">
            <div className="bg-card p-2 rounded-lg shadow-md">
              <CourseIcon iconName={course.icon} className="h-12 w-12" />
            </div>
            <h1 className="text-4xl font-bold font-headline tracking-tighter sm:text-5xl">{course.name}</h1>
          </div>
          <Card className="bg-card/80 backdrop-blur-sm rounded-2xl shadow-lg">
            <CardContent className="p-6 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <AceMascot className="h-12 w-12 hidden sm:block" />
                <p className="text-lg">Welcome! I'm Ace. I'll be your guide for {course.name}. Let's get started!</p>
              </div>
              {isHonors ? (
                <HonorsExamSetter course={course} />
              ) : (
                <CountdownTimer examDate={course.examDate} />
              )}
            </CardContent>
          </Card>
        </header>

        <div className="grid md:grid-cols-3 gap-8">
          <div className="md:col-span-2">
            <Card className="rounded-2xl shadow-lg mb-8 bg-card/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="font-headline">Units Breakdown</CardTitle>
              </CardHeader>
              <CardContent>
                <CourseProgressClient course={course} />
              </CardContent>
            </Card>
          </div>
          
          <div className="space-y-8">
            <Card className="rounded-2xl shadow-lg bg-card/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="font-headline">Study Guides</CardTitle>
                <CardDescription>Essential resources for your success.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <a href="#" className="flex items-center gap-3 p-3 rounded-lg hover:bg-secondary transition-colors">
                  <FileText className="h-6 w-6 text-primary" />
                  <span className="font-medium">Unit 1 Notes (PDF)</span>
                </a>
                <a href="#" className="flex items-center gap-3 p-3 rounded-lg hover:bg-secondary transition-colors">
                  <Film className="h-6 w-6 text-primary" />
                  <span className="font-medium">Video: Key Concepts</span>
                </a>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
