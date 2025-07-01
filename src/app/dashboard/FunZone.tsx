
"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BrainCircuit, Lightbulb } from 'lucide-react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

type Item = {
    question: string;
    answer: string;
    type: string;
};

// Expanded list of items
const funStuff = {
    riddles: [
        { type: "Riddle", question: "I have cities, but no houses; forests, but no trees; and water, but no fish. What am I?", answer: "A map." },
        { type: "Riddle", question: "What has an eye, but cannot see?", answer: "A needle." },
        { type: "Riddle", question: "What is full of holes but still holds water?", answer: "A sponge." },
        { type: "Riddle", question: "I’m tall when I’m young, and I’m short when I’m old. What am I?", answer: "A candle." },
        { type: "Riddle", question: "What gets wet while drying?", answer: "A towel." },
        { type: "Riddle", question: "What can you catch, but not throw?", answer: "A cold." },
        { type: "Riddle", question: "What has a neck without a head, and a body without legs?", answer: "A bottle." },
    ],
    teasers: [
        { type: "AP History Teaser", question: "Which 1803 land deal doubled the size of the United States?", answer: "The Louisiana Purchase." },
        { type: "AP Science Teaser", question: "What is the name of the process by which plants use sunlight to synthesize foods from carbon dioxide and water?", answer: "Photosynthesis." },
        { type: "Logic Teaser", question: "A farmer has 17 sheep and all but nine die. How many are left?", answer: "Nine." },
        { type: "AP Math Teaser", question: "What is the limit of (1 + 1/n)^n as n approaches infinity?", answer: "The mathematical constant 'e'." },
        { type: "AP English Teaser", question: "Which rhetorical appeal focuses on credibility or character?", answer: "Ethos." },
        { type: "Logic Teaser", question: "What five-letter word becomes shorter when you add two letters to it?", answer: "Short (Short + er)." },
        { type: "AP Science Teaser", question: "In genetics, what term describes an allele that is masked by a dominant allele?", answer: "Recessive." },
    ],
};


export function FunZone() {
  const [items, setItems] = useState<{riddle: Item; teaser: Item} | null>(null);

  useEffect(() => {
    // Function to select items based on the current hour.
    const updateItems = () => {
      const hour = new Date().getHours();
      const riddleIndex = hour % funStuff.riddles.length;
      const teaserIndex = hour % funStuff.teasers.length;
      
      setItems({
        riddle: funStuff.riddles[riddleIndex],
        teaser: funStuff.teasers[teaserIndex],
      });
    };
    
    updateItems(); // Set items on initial client-side mount.

    // Set an interval to update the items every hour.
    const intervalId = setInterval(updateItems, 1000 * 60 * 60);

    // Clean up interval on component unmount.
    return () => clearInterval(intervalId);
  }, []);

  if (!items) {
    return null; // Render nothing on the server or before the first client-side render.
  }

  return (
    <div className="flex flex-col items-center justify-center text-center text-muted-foreground py-10">
      <BrainCircuit className="h-12 w-12 text-primary mb-4" />
      <p className="font-semibold text-lg text-foreground">You're all clear for today!</p>
      <p className="text-sm mt-1 mb-6">Here are a couple of brain teasers to keep you sharp.</p>

      <div className="w-full max-w-md space-y-4">
        <FunItemCard item={items.riddle} />
        <FunItemCard item={items.teaser} />
      </div>
    </div>
  );
}

function FunItemCard({ item }: { item: Item }) {
  return (
    <Card className="text-left">
      <CardHeader>
        <CardTitle className="text-base">{item.type}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="font-medium text-foreground">{item.question}</p>
        <Accordion type="single" collapsible className="w-full mt-4">
          <AccordionItem value={item.question} className="border-none">
            <AccordionTrigger className="text-sm text-primary hover:no-underline p-0 justify-start gap-2">
              <Lightbulb className="h-4 w-4" />
              Show Answer
            </AccordionTrigger>
            <AccordionContent className="pt-2 text-sm">
              {item.answer}
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </CardContent>
    </Card>
  );
}
