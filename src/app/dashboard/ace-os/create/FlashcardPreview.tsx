'use client';

import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { RefreshCw } from 'lucide-react';

interface FlashcardPreviewProps {
  isOpen: boolean;
  onClose: () => void;
  term: string;
  definition: string;
}

export default function FlashcardPreview({ isOpen, onClose, term, definition }: FlashcardPreviewProps) {
  const [isFlipped, setIsFlipped] = useState(false);

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      onClose();
      // Reset flip state when closing
      setTimeout(() => setIsFlipped(false), 300);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>Flashcard Preview</DialogTitle>
          <DialogDescription>
            Click the card to flip it over. This is how it will look in study mode.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4 flex flex-col items-center gap-4">
          <div className="w-full h-80 [perspective:1000px]">
            <div
              className={cn(
                'relative w-full h-full text-center transition-transform duration-700 [transform-style:preserve-3d] cursor-pointer',
                isFlipped ? '[transform:rotateY(180deg)]' : ''
              )}
              onClick={() => setIsFlipped(!isFlipped)}
            >
              {/* Front of the card */}
              <div className="absolute w-full h-full [backface-visibility:hidden] p-1">
                <Card className="w-full h-full flex items-center justify-center p-6 bg-secondary">
                  <div className="prose dark:prose-invert max-w-none" dangerouslySetInnerHTML={{ __html: term || "<p>Front is empty.</p>" }} />
                </Card>
              </div>
              {/* Back of the card */}
              <div className="absolute w-full h-full [backface-visibility:hidden] [transform:rotateY(180deg)] p-1">
                <Card className="w-full h-full flex items-center justify-center p-6">
                   <div className="prose dark:prose-invert max-w-none" dangerouslySetInnerHTML={{ __html: definition || "<p>Back is empty.</p>" }} />
                </Card>
              </div>
            </div>
          </div>
          <Button variant="outline" size="icon" onClick={() => setIsFlipped(!isFlipped)} aria-label="Flip card">
            <RefreshCw className="h-5 w-5" />
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
