
'use client';

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Lightbulb, FileText, Bot, Gamepad2, BrainCircuit } from 'lucide-react';
import { Button } from "@/components/ui/button";

const ComingSoonContent = ({ title, description, icon: Icon }: { title: string, description: string, icon: React.ElementType }) => (
    <div className="flex flex-col items-center justify-center text-center h-full min-h-[400px] p-8">
        <Icon className="h-16 w-16 text-primary mb-4" />
        <h3 className="font-headline text-2xl font-bold">{title}</h3>
        <p className="mt-2 max-w-md text-muted-foreground">{description}</p>
        <Button variant="outline" className="mt-6" disabled>Coming Soon</Button>
    </div>
);

export function StudyModes() {
    return (
        <Tabs defaultValue="flashcards" className="w-full h-full flex flex-col">
            <TabsList className="grid w-full grid-cols-5">
                <TabsTrigger value="flashcards">Flashcards</TabsTrigger>
                <TabsTrigger value="learn">Learn</TabsTrigger>
                <TabsTrigger value="test">Test</TabsTrigger>
                <TabsTrigger value="match">Match</TabsTrigger>
                <TabsTrigger value="spaced">Spaced</TabsTrigger>
            </TabsList>
            <Card className="mt-4 flex-grow">
                <CardContent className="p-0 h-full">
                    <TabsContent value="learn" className="m-0 h-full">
                         <ComingSoonContent 
                            title="Learn Mode" 
                            description="An adaptive system that tests you with multiple choice, true/false, and written recall to help you master every card."
                            icon={Lightbulb}
                        />
                    </TabsContent>
                    <TabsContent value="flashcards" className="m-0 h-full">
                        <ComingSoonContent 
                            title="Flashcards" 
                            description="The classic way to study. Flip through your cards, mark the ones you know, and focus on what you need to learn."
                            icon={FileText}
                        />
                    </TabsContent>
                    <TabsContent value="test" className="m-0 h-full">
                         <ComingSoonContent 
                            title="Practice Test" 
                            description="Generate a custom practice test from your deck. Choose the number of questions, types, and even set a timer."
                            icon={Bot}
                        />
                    </TabsContent>
                    <TabsContent value="match" className="m-0 h-full">
                         <ComingSoonContent 
                            title="Matching Game" 
                            description="Race against the clock to match terms with their definitions. A fun and fast way to reinforce your knowledge."
                            icon={Gamepad2}
                        />
                    </TabsContent>
                     <TabsContent value="spaced" className="m-0 h-full">
                         <ComingSoonContent 
                            title="Spaced Repetition" 
                            description="Our algorithm schedules reviews at the perfect intervals to move cards into your long-term memory, ensuring you're ready for test day."
                            icon={BrainCircuit}
                        />
                    </TabsContent>
                </CardContent>
            </Card>
        </Tabs>
    );
}
