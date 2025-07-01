"use client";

import { useState } from "react";
import { useForm, type SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import type { TopicRecommenderInput, TopicRecommenderOutput } from "@/ai/flows/topic-recommender";
import { recommendTopicAction } from "./actions";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Loader2, Lightbulb } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import AppSidebar from "@/components/app-sidebar";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";

const formSchema = z.object({
  courseName: z.string().min(2, "Course name is required."),
  unitsCompleted: z.coerce.number().min(0, "Units must be a positive number."),
  examDate: z.string().min(1, "Exam date is required."),
  studyHistory: z.string().min(10, "Please provide some study history."),
  learningGoals: z.string().min(10, "Please describe your learning goals."),
});

export default function TopicRecommenderPage() {
  const [recommendation, setRecommendation] = useState<TopicRecommenderOutput | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      courseName: "",
      unitsCompleted: 0,
      examDate: "",
      studyHistory: "",
      learningGoals: "",
    },
  });

  const onSubmit: SubmitHandler<z.infer<typeof formSchema>> = async (data) => {
    setIsLoading(true);
    setError(null);
    setRecommendation(null);
    try {
      const result = await recommendTopicAction(data);
      setRecommendation(result);
    } catch (e) {
      setError("Failed to get recommendation. Please try again.");
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <div className="p-4 sm:p-6 lg:p-8 max-w-4xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold">AI Topic Recommender</h1>
            <p className="text-muted-foreground">Unsure what to study next? Let our AI guide you to the most important topics.</p>
          </div>
          
          <Card>
            <CardHeader>
              <CardTitle>Your Study Profile</CardTitle>
              <CardDescription>Fill in your details to get a personalized study recommendation.</CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField control={form.control} name="courseName" render={({ field }) => (
                      <FormItem><FormLabel>Course Name</FormLabel><FormControl><Input placeholder="e.g., AP World History" {...field} /></FormControl><FormMessage /></FormItem>
                    )} />
                    <FormField control={form.control} name="unitsCompleted" render={({ field }) => (
                      <FormItem><FormLabel>Units Completed</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>
                    )} />
                  </div>
                   <FormField control={form.control} name="examDate" render={({ field }) => (
                      <FormItem><FormLabel>Upcoming Exam Date</FormLabel><FormControl><Input type="date" {...field} /></FormControl><FormMessage /></FormItem>
                    )} />
                  <FormField control={form.control} name="studyHistory" render={({ field }) => (
                      <FormItem><FormLabel>Study History</FormLabel><FormControl><Textarea placeholder="e.g., Scored 85% on Unit 1 test, struggled with industrial revolution topics." {...field} /></FormControl><FormMessage /></FormItem>
                    )} />
                  <FormField control={form.control} name="learningGoals" render={({ field }) => (
                     <FormItem><FormLabel>Learning Goals</FormLabel><FormControl><Textarea placeholder="e.g., I want to achieve a 5 on the exam and improve my essay writing skills." {...field} /></FormControl><FormMessage /></FormItem>
                    )} />

                  <Button type="submit" disabled={isLoading} className="w-full sm:w-auto">
                    {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Lightbulb className="mr-2 h-4 w-4" />}
                    Get Recommendation
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>

          {error && (
            <Alert variant="destructive" className="mt-6">
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {recommendation && (
            <Card className="mt-8 bg-accent/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2"><Lightbulb className="text-primary"/> AI Recommendation</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                    <h3 className="font-semibold text-lg">Recommended Topics</h3>
                    <p className="whitespace-pre-wrap">{recommendation.recommendedTopics}</p>
                </div>
                 <div>
                    <h3 className="font-semibold text-lg">Reasoning</h3>
                    <p className="text-muted-foreground whitespace-pre-wrap">{recommendation.reasoning}</p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
