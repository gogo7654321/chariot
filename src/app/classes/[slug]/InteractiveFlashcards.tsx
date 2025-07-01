"use client";

import { useState } from 'react';
import type { Flashcard } from '@/lib/courses';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, ArrowRight, RefreshCw } from 'lucide-react';
import { cn } from '@/lib/utils';

export function InteractiveFlashcards({ flashcards }: { flashcards: Flashcard[] }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);

  if (flashcards.length === 0) {
    return <p className="text-muted-foreground">No flashcards available for this unit yet.</p>;
  }

  const handleNext = () => {
    setIsFlipped(false);
    setTimeout(() => {
        setCurrentIndex((prev) => (prev + 1) % flashcards.length);
    }, 150)
  };

  const handlePrev = () => {
    setIsFlipped(false);
    setTimeout(() => {
        setCurrentIndex((prev) => (prev - 1 + flashcards.length) % flashcards.length);
    }, 150)
  };

  const currentFlashcard = flashcards[currentIndex];

  return (
    <div className="flex flex-col items-center">
      <div className="w-full max-w-md h-64 [perspective:1000px]">
        <div
          className={cn(
            'relative w-full h-full text-center transition-transform duration-500 [transform-style:preserve-3d]',
            isFlipped ? '[transform:rotateY(180deg)]' : ''
          )}
          onClick={() => setIsFlipped(!isFlipped)}
        >
          <div className="absolute w-full h-full [backface-visibility:hidden]">
            <Card className="w-full h-full flex items-center justify-center p-4 cursor-pointer bg-secondary">
              <p className="text-2xl font-bold">{currentFlashcard.term}</p>
            </Card>
          </div>
          <div className="absolute w-full h-full [backface-visibility:hidden] [transform:rotateY(180deg)]">
            <Card className="w-full h-full flex items-center justify-center p-4 cursor-pointer">
              <p className="text-lg">{currentFlashcard.definition}</p>
            </Card>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between w-full max-w-md mt-4">
        <Button variant="outline" size="icon" onClick={handlePrev} aria-label="Previous card">
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" onClick={() => setIsFlipped(!isFlipped)} aria-label="Flip card">
                <RefreshCw className="h-5 w-5" />
            </Button>
            <p className="text-muted-foreground text-sm font-medium">
              {currentIndex + 1} / {flashcards.length}
            </p>
        </div>
        <Button variant="outline" size="icon" onClick={handleNext} aria-label="Next card">
          <ArrowRight className="h-5 w-5" />
        </Button>
      </div>
    </div>
  );
}
