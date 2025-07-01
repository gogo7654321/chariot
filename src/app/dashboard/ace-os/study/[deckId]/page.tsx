
'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { ArrowLeft, BookCopy, Loader2, Tags, Lightbulb, Bot, Gamepad2, BrainCircuit } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { FlashcardPlayer } from './FlashcardPlayer';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import type { Card as FlashcardContent } from '@/lib/courses'; // Using this as a base type
import { TooltipProvider } from '@/components/ui/tooltip';
import { DeepDivePlayer } from './DeepDivePlayer';

export type Deck = {
    id: string;
    title: string;
    description: string;
    hashtags?: string;
    courseId?: string;
    cards: FlashcardData[];
};

export type FlashcardData = FlashcardContent & {
    id: number;
    hint: string;
    options: string[];
    cardType: 'term-definition' | 'multiple-choice' | 'fill-in-the-blank';
}

export type CardProgress = {
    status: 'new' | 'learning' | 'almostDone' | 'mastered';
    starred: boolean;
};

export type DeckProgress = {
    [cardId: string]: CardProgress;
};


const ComingSoonContent = ({ title, description, icon: Icon }: { title: string, description: string, icon: React.ElementType }) => (
    <Card className="h-full">
        <div className="flex flex-col items-center justify-center text-center h-full min-h-[400px] p-8">
            <Icon className="h-16 w-16 text-primary mb-4" />
            <h3 className="font-headline text-2xl font-bold">{title}</h3>
            <p className="mt-2 max-w-md text-muted-foreground">{description}</p>
            <Button variant="outline" className="mt-6" disabled>Coming Soon</Button>
        </div>
    </Card>
);


export default function StudyDeckPage() {
    const params = useParams();
    const router = useRouter();
    const { user } = useAuth();

    const [deck, setDeck] = useState<Deck | null>(null);
    const [deckProgress, setDeckProgress] = useState<DeckProgress>({});
    const [isLoading, setIsLoading] = useState(true);

    const deckId = params.deckId as string;

    useEffect(() => {
        if (!user || !deckId) {
            if (!isLoading) router.push('/dashboard/ace-os');
            return;
        }

        const deckDocRef = doc(db, 'users', user.uid, 'flashcardDecks', deckId);
        const progressDocRef = doc(db, 'users', user.uid, 'deckProgress', deckId);

        const unsubscribeDeck = onSnapshot(deckDocRef, (docSnap) => {
            if (docSnap.exists()) {
                const data = docSnap.data();
                setDeck({
                    id: docSnap.id,
                    title: data.title || 'Untitled Deck',
                    description: data.description || '',
                    hashtags: data.hashtags || '',
                    courseId: data.courseId,
                    cards: data.cards || [],
                });
            } else {
                // Deck not found
                router.push('/dashboard/ace-os');
            }
            setIsLoading(false);
        });
        
        const unsubscribeProgress = onSnapshot(progressDocRef, (docSnap) => {
            if (docSnap.exists()) {
                setDeckProgress(docSnap.data() as DeckProgress);
            }
        });


        return () => {
            unsubscribeDeck();
            unsubscribeProgress();
        };
    }, [user, deckId, router, isLoading]);

    if (isLoading) {
        return (
            <div className="flex h-full w-full items-center justify-center p-8">
                <Loader2 className="h-12 w-12 animate-spin text-primary" />
            </div>
        );
    }
    
    if (!deck) {
        return (
             <div className="flex h-full w-full items-center justify-center p-8">
                <p>Deck not found.</p>
            </div>
        )
    }

    return (
        <div className="p-4 md:p-8 space-y-6 h-full flex flex-col">
            <header className="flex-shrink-0">
                <Button variant="ghost" asChild className="mb-4 -ml-4">
                    <Link href="/dashboard/ace-os" className="flex items-center">
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Back to Ace OS<span className="copyright-symbol">©</span>
                    </Link>
                </Button>
                <div>
                    <h1 className="font-headline text-3xl md:text-4xl font-bold">{deck.title}</h1>
                    {deck.description && (
                        <p className="mt-2 text-lg text-muted-foreground max-w-3xl">{deck.description}</p>
                    )}
                    <div className="mt-4 flex flex-wrap items-center gap-4">
                        <Badge variant="outline" className="text-base py-1 px-3">
                            <BookCopy className="mr-2 h-4 w-4"/>
                            {deck.cards.length} {deck.cards.length === 1 ? 'Card' : 'Cards'}
                        </Badge>
                        {deck.hashtags && (
                             <div className="flex flex-wrap items-center gap-2">
                                <Tags className="h-5 w-5 text-muted-foreground" />
                                {deck.hashtags.split(' ').filter(Boolean).map(tag => (
                                    <Badge key={tag} variant="secondary">{tag}</Badge>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </header>

            <main className="flex-grow min-h-0">
                <Tabs defaultValue="flashcards" className="w-full h-full flex flex-col">
                    <TabsList className="grid w-full grid-cols-5">
                        <TabsTrigger value="flashcards">Flashcards</TabsTrigger>
                        <TabsTrigger value="learn">Deep Dive</TabsTrigger>
                        <TabsTrigger value="test">Test</TabsTrigger>
                        <TabsTrigger value="match">Match</TabsTrigger>
                        <TabsTrigger value="spaced">Spaced</TabsTrigger>
                    </TabsList>
                    
                    <TabsContent value="flashcards" className="mt-4 flex-grow data-[state=active]:animate-in data-[state=active]:fade-in-90 data-[state=active]:slide-in-from-bottom-4">
                        <TooltipProvider>
                            <FlashcardPlayer deck={deck} initialProgress={deckProgress} />
                        </TooltipProvider>
                    </TabsContent>
                    <TabsContent value="learn" className="mt-4 flex-grow data-[state=active]:animate-in data-[state=active]:fade-in-90 data-[state=active]:slide-in-from-bottom-4">
                        <TooltipProvider>
                            <DeepDivePlayer deck={deck} initialProgress={deckProgress} />
                        </TooltipProvider>
                    </TabsContent>
                    <TabsContent value="test" className="mt-4 flex-grow data-[state=active]:animate-in data-[state=active]:fade-in-90 data-[state=active]:slide-in-from-bottom-4">
                        <ComingSoonContent 
                            title="Practice Test" 
                            description="Generate a custom practice test from your deck. Choose the number of questions, types, and even set a timer."
                            icon={Bot}
                        />
                    </TabsContent>
                    <TabsContent value="match" className="mt-4 flex-grow data-[state=active]:animate-in data-[state=active]:fade-in-90 data-[state=active]:slide-in-from-bottom-4">
                        <ComingSoonContent 
                            title="Matching Game" 
                            description="Race against the clock to match terms with their definitions. A fun and fast way to reinforce your knowledge."
                            icon={Gamepad2}
                        />
                    </TabsContent>
                    <TabsContent value="spaced" className="mt-4 flex-grow data-[state=active]:animate-in data-[state=active]:fade-in-90 data-[state=active]:slide-in-from-bottom-4">
                        <ComingSoonContent 
                            title="Spaced Repetition" 
                            description="Our algorithm schedules reviews at the perfect intervals to move cards into your long-term memory, ensuring you're ready for test day."
                            icon={BrainCircuit}
                        />
                    </TabsContent>
                </Tabs>
            </main>
        </div>
    );
}
