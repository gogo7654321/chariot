
'use client';

import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { db } from '@/lib/firebase';
import { doc, setDoc } from 'firebase/firestore';
import type { Deck, DeckProgress, CardProgress, FlashcardData } from './page';

import { Card as UICard, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator, DropdownMenuLabel } from '@/components/ui/dropdown-menu';
import { SegmentedProgress } from '../../components/SegmentedProgress';
import {
  Shuffle,
  Star,
  Settings,
  Pencil,
  RotateCcw,
  ArrowLeft,
  ArrowRight,
  ThumbsDown,
  ThumbsUp,
  Volume2,
  Maximize,
  Minimize,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from '@/components/ui/tooltip';

const masteryStatusConfig = {
    new: { value: 25, count: 0, color: 'bg-blue-500', label: 'New' },
    learning: { value: 25, count: 0, color: 'bg-yellow-500', label: 'Learning' },
    almostDone: { value: 25, count: 0, color: 'bg-orange-500', label: 'Almost Done' },
    mastered: { value: 25, count: 0, color: 'bg-green-500', label: 'Mastered' },
};

export function FlashcardPlayer({ deck, initialProgress }: { deck: Deck; initialProgress: DeckProgress }) {
  const { user } = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  // Session state
  const [cardsToStudy, setCardsToStudy] = useState<FlashcardData[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [sessionStats, setSessionStats] = useState({ reviewed: 0, correct: 0 });

  // Persistent state
  const [cardProgress, setCardProgress] = useState<DeckProgress>(initialProgress);

  // Settings state
  const [shuffle, setShuffle] = useState(false);
  const [studyStarred, setStudyStarred] = useState(false);
  const [answerWith, setAnswerWith] = useState<'definition' | 'term'>('definition');
  const [flipDirection, setFlipDirection] = useState<'horizontal' | 'vertical'>('horizontal');
  const [showMasteryButtons, setShowMasteryButtons] = useState(true);

  // Fullscreen state
  const playerRef = useRef<HTMLDivElement>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [hasShownFullscreenTip, setHasShownFullscreenTip] = useState(false);


  const updateProgressInDb = useCallback(async (newProgress: DeckProgress) => {
    if (!user) return;
    const progressDocRef = doc(db, 'users', user.uid, 'deckProgress', deck.id);
    await setDoc(progressDocRef, newProgress);
  }, [user, deck.id]);

  useEffect(() => {
    let filteredCards = [...deck.cards];

    if (studyStarred) {
      filteredCards = filteredCards.filter(card => cardProgress[card.id]?.starred);
    }

    if (shuffle) {
      // Fisher-Yates shuffle
      for (let i = filteredCards.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [filteredCards[i], filteredCards[j]] = [filteredCards[j], filteredCards[i]];
      }
    }

    setCardsToStudy(filteredCards);
    setCurrentIndex(0);
    setIsFlipped(false);
  }, [deck.cards, studyStarred, shuffle, cardProgress]);
  
  const handleNext = useCallback(() => {
    setIsFlipped(false);
    setTimeout(() => {
      setCurrentIndex(prev => (prev + 1) % cardsToStudy.length);
    }, 150);
  }, [cardsToStudy.length]);
  
  const handlePrev = useCallback(() => {
    setIsFlipped(false);
    setTimeout(() => {
        setCurrentIndex(prev => (prev - 1 + cardsToStudy.length) % cardsToStudy.length);
    }, 150)
  }, [cardsToStudy.length]);
  
  const handleMark = useCallback(async (isCorrect: boolean) => {
    if (!cardsToStudy.length || !user) return;

    const cardId = cardsToStudy[currentIndex].id;
    const currentStatus = cardProgress[cardId]?.status || 'new';
    let nextStatus = currentStatus;

    if (isCorrect) {
        setSessionStats(prev => ({ reviewed: prev.reviewed + 1, correct: prev.correct + 1 }));
        switch(currentStatus) {
            case 'new': nextStatus = 'almostDone'; break;
            case 'learning': nextStatus = 'almostDone'; break;
            case 'almostDone': nextStatus = 'mastered'; break;
            case 'mastered': nextStatus = 'mastered'; break;
        }
    } else {
        setSessionStats(prev => ({ ...prev, reviewed: prev.reviewed + 1 }));
        switch(currentStatus) {
            case 'new': nextStatus = 'learning'; break;
            case 'learning': nextStatus = 'learning'; break;
            case 'almostDone': nextStatus = 'learning'; break;
            case 'mastered': nextStatus = 'almostDone'; break;
        }
    }
    
    const newCardProgress = {
      ...cardProgress,
      [cardId]: {
        ...cardProgress[cardId],
        status: nextStatus,
      },
    };
    setCardProgress(newCardProgress);
    await updateProgressInDb(newCardProgress);
    
    handleNext();
  }, [user, currentIndex, cardProgress, cardsToStudy, handleNext, updateProgressInDb]);

  const handleToggleStar = async () => {
    if (!cardsToStudy.length || !user) return;
    const cardId = cardsToStudy[currentIndex].id;
    const currentIsStarred = cardProgress[cardId]?.starred || false;
    
    const newCardProgress = {
        ...cardProgress,
        [cardId]: {
          status: cardProgress[cardId]?.status || 'new',
          starred: !currentIsStarred,
        },
      };
    setCardProgress(newCardProgress);
    await updateProgressInDb(newCardProgress);
  };

  const handleReadAloud = useCallback((text: string) => {
    toast({
        title: 'Read Aloud Coming Soon!',
        description: 'This feature is currently under development.',
    });
  }, [toast]);

  const handleFullscreenToggle = async () => {
    if (!playerRef.current) return;
    
    if (!document.fullscreenElement) {
        await playerRef.current.requestFullscreen();
        if (!hasShownFullscreenTip) {
            toast({
                title: 'Keyboard Shortcuts Enabled',
                description: 'Use ← → to navigate and Spacebar to flip the card.',
            });
            setHasShownFullscreenTip(true);
        }
    } else {
        if (document.exitFullscreen) {
            await document.exitFullscreen();
        }
    }
  };

  useEffect(() => {
    const handleFullscreenChange = () => {
        setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);

    return () => {
        document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, []);
  
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
        if(e.key === ' ') {
            e.preventDefault();
            setIsFlipped(f => !f);
        }
        if(e.key === 'ArrowRight') handleNext();
        if(e.key === 'ArrowLeft') handlePrev();
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleNext, handlePrev]);

  const masteryStats = useMemo(() => {
    const stats = JSON.parse(JSON.stringify(masteryStatusConfig));
    deck.cards.forEach(card => {
        const status = cardProgress[card.id]?.status || 'new';
        stats[status].count++;
    });
    return Object.values(stats);
  }, [deck.cards, cardProgress]);
  
  const currentCard = cardsToStudy[currentIndex];
  if (!currentCard) {
    return (
        <div className="flex flex-col items-center justify-center text-center h-full p-8 rounded-lg bg-secondary/50">
            <h3 className="font-headline text-2xl font-bold">No cards to study!</h3>
            <p className="mt-2 max-w-md text-muted-foreground">
                {studyStarred ? "You have no starred cards in this deck." : "This deck is empty."}
            </p>
            {studyStarred && <Button onClick={() => setStudyStarred(false)} className="mt-4">Study All Cards</Button>}
        </div>
    );
  }

  const frontContent = answerWith === 'definition' ? currentCard.term : currentCard.definition;
  const backContent = answerWith === 'definition' ? currentCard.definition : currentCard.term;

  const CardActions = ({ side }: { side: 'front' | 'back' }) => {
    const text = side === 'front' ? frontContent : backContent;
    return (
        <div className="absolute top-2 right-2 z-10 flex items-center gap-1">
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={(e) => { e.stopPropagation(); handleReadAloud(text); }}>
                <Volume2 className="h-5 w-5 text-muted-foreground" />
            </Button>
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={(e) => { e.stopPropagation(); handleToggleStar(); }}>
                <Star className={cn("h-5 w-5 text-muted-foreground", cardProgress[currentCard.id]?.starred && 'fill-yellow-400 text-yellow-500')} />
            </Button>
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={(e) => { e.stopPropagation(); router.push(`/dashboard/ace-os/create?deckId=${deck.id}`); }}>
                <Pencil className="h-5 w-5 text-muted-foreground" />
            </Button>
        </div>
    );
  };

  return (
    <TooltipProvider>
        <div ref={playerRef} className={cn("flex flex-col h-full gap-4 md:gap-6", isFullscreen && "bg-background p-8 justify-center")}>
            {/* Top bar with progress and settings */}
            <div className="flex flex-col md:flex-row gap-4 justify-between items-center flex-shrink-0">
                <div className="w-full md:w-2/3">
                    <SegmentedProgress segments={masteryStats} />
                </div>
                <div className="flex items-center gap-2">
                    <Button variant={shuffle ? "default" : "outline"} size="sm" onClick={() => setShuffle(!shuffle)}>
                        <Shuffle className="h-4 w-4 mr-2" /> Shuffle
                    </Button>
                    <Button variant={studyStarred ? "default" : "outline"} size="sm" onClick={() => setStudyStarred(!studyStarred)}>
                        <Star className="h-4 w-4 mr-2" /> Starred
                    </Button>
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button variant="outline" size="sm" onClick={handleFullscreenToggle}>
                                {isFullscreen ? <Minimize className="h-4 w-4" /> : <Maximize className="h-4 w-4" />}
                                <span className="sr-only">{isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen'}</span>
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                            <p>{isFullscreen ? 'Exit' : 'Fullscreen'}</p>
                        </TooltipContent>
                    </Tooltip>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="outline" size="sm">
                                <Settings className="h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuItem onSelect={() => setAnswerWith('definition')}>
                                Answer with Definition {answerWith === 'definition' && '✓'}
                            </DropdownMenuItem>
                            <DropdownMenuItem onSelect={() => setAnswerWith('term')}>
                                Answer with Term {answerWith === 'term' && '✓'}
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuLabel>Flip Animation</DropdownMenuLabel>
                            <DropdownMenuItem onSelect={() => setFlipDirection('horizontal')}>
                                Horizontal {flipDirection === 'horizontal' && '✓'}
                            </DropdownMenuItem>
                            <DropdownMenuItem onSelect={() => setFlipDirection('vertical')}>
                                Vertical {flipDirection === 'vertical' && '✓'}
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onSelect={() => setShowMasteryButtons(!showMasteryButtons)}>
                                Show Mastery Buttons {showMasteryButtons && '✓'}
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </div>

            {/* Main Card Area */}
            <div className="flex-grow flex items-center justify-center [perspective:1000px]">
                <div
                    className={cn(
                        'relative w-full h-[45vh] max-w-3xl text-center transition-transform duration-700 [transform-style:preserve-3d]',
                        isFlipped && (flipDirection === 'horizontal' ? '[transform:rotateY(180deg)]' : '[transform:rotateX(180deg)]')
                    )}
                    onClick={() => setIsFlipped(!isFlipped)}
                    >
                    <div className="absolute w-full h-full [backface-visibility:hidden] p-1">
                        <UICard className="relative w-full h-full flex items-center justify-center p-6 cursor-pointer bg-card">
                            <CardActions side="front" />
                            <div className="prose dark:prose-invert max-w-none text-2xl" dangerouslySetInnerHTML={{ __html: frontContent || ""}} />
                        </UICard>
                    </div>
                    <div className={cn(
                        "absolute w-full h-full [backface-visibility:hidden] p-1",
                        flipDirection === 'horizontal' ? '[transform:rotateY(180deg)]' : '[transform:rotateX(180deg)]'
                    )}>
                        <UICard className="relative w-full h-full flex items-center justify-center p-6 cursor-pointer bg-card">
                            <CardActions side="back" />
                            <div className="prose dark:prose-invert max-w-none text-xl" dangerouslySetInnerHTML={{ __html: backContent || ""}} />
                        </UICard>
                    </div>
                </div>
            </div>
            
            {/* Mastery and Navigation Controls */}
            <div className="flex-shrink-0 space-y-4">
                {isFlipped && showMasteryButtons && (
                    <div className="flex justify-center gap-4 animate-in fade-in duration-500">
                        <Button variant="destructive" size="lg" className="h-14" onClick={(e) => {e.stopPropagation(); handleMark(false)}}>
                            <ThumbsDown className="mr-2"/> I was wrong
                        </Button>
                        <Button variant="default" size="lg" className="h-14 bg-green-600 hover:bg-green-700" onClick={(e) => {e.stopPropagation(); handleMark(true)}}>
                             <ThumbsUp className="mr-2"/> I knew it!
                        </Button>
                    </div>
                )}

                <div className="flex items-center justify-between">
                    <div className="w-16">
                        {/* Placeholder for spacing */}
                    </div>
                    <div className="flex items-center gap-4">
                        <Button variant="outline" size="icon" onClick={handlePrev}><ArrowLeft/></Button>
                        <span className="font-medium text-muted-foreground tabular-nums">{currentIndex + 1} / {cardsToStudy.length}</span>
                        <Button variant="outline" size="icon" onClick={handleNext}><ArrowRight/></Button>
                    </div>
                    <div className="w-16">
                        {/* Placeholder for spacing */}
                    </div>
                </div>
                <div className="space-y-1">
                    <div className="flex justify-between items-center text-sm text-muted-foreground">
                        <span>Session Accuracy</span>
                        <span className="font-semibold">{sessionStats.reviewed > 0 ? `${Math.round((sessionStats.correct / sessionStats.reviewed) * 100)}%` : 'N/A'}</span>
                    </div>
                    <Progress value={sessionStats.reviewed > 0 ? (sessionStats.correct / sessionStats.reviewed) * 100 : 0} />
                </div>
            </div>
        </div>
    </TooltipProvider>
  );
}
