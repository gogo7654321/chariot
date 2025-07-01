"use client";

import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import './flashcard.css';

interface FlashcardProps {
  question: string;
  answer: string;
}

export default function Flashcard({ question, answer }: FlashcardProps) {
  const [isFlipped, setIsFlipped] = useState(false);

  return (
    <div className="flip-card h-80 w-full" onClick={() => setIsFlipped(!isFlipped)}>
      <div className={cn("flip-card-inner", { 'is-flipped': isFlipped })}>
        <div className="flip-card-front">
          <Card className="h-full w-full flex items-center justify-center">
            <CardContent className="p-6">
              <p className="text-xl md:text-2xl font-semibold text-center">{question}</p>
            </CardContent>
          </Card>
        </div>
        <div className="flip-card-back">
          <Card className="h-full w-full flex items-center justify-center bg-secondary">
            <CardContent className="p-6">
              <p className="text-lg md:text-xl text-center">{answer}</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
