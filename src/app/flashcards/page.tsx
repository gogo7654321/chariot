"use client";

import { useState } from "react";
import { useForm, type SubmitHandler } from "react-hook-form";
import type { GenerateFlashcardsInput, GenerateFlashcardsOutput } from "@/ai/flows/flashcard-generator";
import { generateFlashcardsAction } from "./actions";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Loader2, Wand2 } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import AppSidebar from "@/components/app-sidebar";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import Flashcard from "@/components/flashcard";

type FormData = GenerateFlashcardsInput;

export default function FlashcardGeneratorPage() {
  const [flashcards, setFlashcards] = useState<GenerateFlashcardsOutput['flashcards'] | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>();

  const onSubmit: SubmitHandler<FormData> = async (data) => {
    setIsLoading(true);
    setError(null);
    setFlashcards(null);
    try {
      const result = await generateFlashcardsAction(data);
      setFlashcards(result.flashcards);
    } catch (e) {
      setError("Failed to generate flashcards. Please try again.");
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
                <h1 className="text-3xl font-bold">Flashcard Generator</h1>
                <p className="text-muted-foreground">Enter a topic or paste your notes to instantly create a set of study flashcards.</p>
            </div>
          
          <Card>
            <CardHeader>
              <CardTitle>Topic / Notes</CardTitle>
              <CardDescription>Provide the material you want to turn into flashcards.</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <Textarea
                  {...register("topic", { required: "Topic is required." })}
                  placeholder="e.g., The Causes of World War I"
                  rows={10}
                  className={errors.topic ? "border-destructive" : ""}
                />
                {errors.topic && <p className="text-sm text-destructive">{errors.topic.message}</p>}
                <Button type="submit" disabled={isLoading} className="w-full sm:w-auto">
                  {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Wand2 className="mr-2 h-4 w-4" />}
                  Generate Flashcards
                </Button>
              </form>
            </CardContent>
          </Card>

          {error && (
            <Alert variant="destructive" className="mt-6">
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {flashcards && (
            <div className="mt-8">
                 <h2 className="text-2xl font-bold mb-4">Your Flashcards</h2>
                <Carousel className="w-full">
                    <CarouselContent>
                        {flashcards.map((card, index) => (
                            <CarouselItem key={index}>
                                <div className="p-1">
                                    <Flashcard question={card.question} answer={card.answer} />
                                </div>
                            </CarouselItem>
                        ))}
                    </CarouselContent>
                    <CarouselPrevious />
                    <CarouselNext />
                </Carousel>
            </div>
          )}
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
