
'use client';

import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { db } from '@/lib/firebase';
import { doc, setDoc } from 'firebase/firestore';
import type { Deck, DeckProgress, FlashcardData } from './page';
import { calculateSimilarity } from '@/lib/string-similarity';

import { Card as UICard, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator, DropdownMenuCheckboxItem } from '@/components/ui/dropdown-menu';
import { SegmentedProgress } from '../../components/SegmentedProgress';
import {
  Shuffle,
  Star,
  Settings,
  Pencil,
  ArrowLeft,
  ArrowRight,
  ThumbsUp,
  CheckCircle2,
  XCircle,
  Lightbulb,
  AlertCircle,
  Brain,
  Maximize,
  Minimize,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Progress } from '@/components/ui/progress';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

// Smart Grader thresholds
const TYPO_THRESHOLD = 0.85;

const masteryStatusConfig = {
    new: { value: 25, count: 0, color: 'bg-blue-500', label: 'New' },
    learning: { value: 25, count: 0, color: 'bg-yellow-500', label: 'Learning' },
    almostDone: { value: 25, count: 0, color: 'bg-orange-500', label: 'Almost Done' },
    mastered: { value: 25, count: 0, color: 'bg-green-500', label: 'Mastered' },
};

const stripHtml = (html: string) => {
    if (typeof window === 'undefined') return '';
    try {
        const doc = new DOMParser().parseFromString(html, 'text/html');
        return doc.body.textContent || "";
    } catch(e) {
        return html;
    }
};

export function DeepDivePlayer({ deck, initialProgress }: { deck: Deck; initialProgress: DeckProgress }) {
  const { user } = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  // Session state
  const [cardsToStudy, setCardsToStudy] = useState<FlashcardData[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [sessionStats, setSessionStats] = useState({ reviewed: 0, correct: 0 });
  const [inputValue, setInputValue] = useState('');
  const [answerState, setAnswerState] = useState<'unanswered' | 'answered'>('unanswered');
  const [lastResult, setLastResult] = useState<'correct' | 'incorrect' | 'typo' | null>(null);

  // Persistent state
  const [cardProgress, setCardProgress] = useState<DeckProgress>(initialProgress);

  // Settings state
  const [shuffle, setShuffle] = useState(false);
  const [studyStarred, setStudyStarred] = useState(false);
  const [answerWith, setAnswerWith] = useState<'definition' | 'term'>('definition');
  const [isSmartGradingEnabled, setIsSmartGradingEnabled] = useState(true);

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
      for (let i = filteredCards.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [filteredCards[i], filteredCards[j]] = [filteredCards[j], filteredCards[i]];
      }
    }

    setCardsToStudy(filteredCards);
    setCurrentIndex(0);
  }, [deck.cards, studyStarred, shuffle, cardProgress]);
  
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
        starred: cardProgress[cardId]?.starred || false
      },
    };
    setCardProgress(newCardProgress);
    await updateProgressInDb(newCardProgress);
    
  }, [user, currentIndex, cardProgress, cardsToStudy, updateProgressInDb]);

  const handleCheckAnswer = async () => {
    if (!currentCard || !inputValue.trim()) return;
    
    const correctAnswer = stripHtml(answerWith === 'term' ? currentCard.term : currentCard.definition);
    
    let result: 'correct' | 'incorrect' | 'typo';
    let isCorrectForProgress = false;
    
    if (isSmartGradingEnabled) {
        const similarity = calculateSimilarity(inputValue, correctAnswer);
        if (similarity === 1) {
            result = 'correct';
            isCorrectForProgress = true;
        } else if (similarity >= TYPO_THRESHOLD) {
            result = 'typo';
            isCorrectForProgress = true;
        } else {
            result = 'incorrect';
            isCorrectForProgress = false;
        }
    } else {
        const isPerfectMatch = inputValue.trim().toLowerCase() === correctAnswer.trim().toLowerCase();
        if (isPerfectMatch) {
            result = 'correct';
            isCorrectForProgress = true;
        } else {
            result = 'incorrect';
            isCorrectForProgress = false;
        }
    }
    
    setLastResult(result);
    setAnswerState('answered');
    await handleMark(isCorrectForProgress);
  };

  const handleNextQuestion = () => {
    setAnswerState('unanswered');
    setInputValue('');
    setLastResult(null);
    setCurrentIndex(prev => (prev + 1) % cardsToStudy.length);
  };
  
  const handlePrev = () => {
    setAnswerState('unanswered');
    setInputValue('');
    setLastResult(null);
    setCurrentIndex(prev => (prev - 1 + cardsToStudy.length) % cardsToStudy.length);
  };

  const handleCorrectOverride = async () => {
    await handleMark(true); // Mark as correct
    handleNextQuestion(); // Move to next
  };

  const handleIncorrectOverride = async () => {
    await handleMark(false); // Mark as incorrect
    handleNextQuestion(); // Move to next
  };
  
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

  const handleFullscreenToggle = async () => {
    if (!playerRef.current) return;
    
    if (!document.fullscreenElement) {
        await playerRef.current.requestFullscreen();
        if (!hasShownFullscreenTip) {
            toast({
                title: 'Keyboard Shortcuts Active',
                description: 'Press Enter to submit your answer.',
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

  const questionContent = answerWith === 'term' ? currentCard.definition : currentCard.term;
  const answerContent = answerWith === 'term' ? currentCard.term : currentCard.definition;

  return (
    <div ref={playerRef} className={cn("flex flex-col h-full gap-4 md:gap-6", isFullscreen && "bg-background p-8 justify-center")}>
        {/* Top bar */}
        <div className="flex flex-col md:flex-row gap-4 justify-between items-center flex-shrink-0">
            <div className="w-full md:w-2/3">
                <SegmentedProgress segments={masteryStats} />
            </div>
            <div className="flex items-center gap-2">
                <Button variant={shuffle ? "default" : "outline"} size="sm" onClick={() => setShuffle(!shuffle)}><Shuffle className="h-4 w-4 mr-2" /> Shuffle</Button>
                <Button variant={studyStarred ? "default" : "outline"} size="sm" onClick={() => setStudyStarred(!studyStarred)}><Star className="h-4 w-4 mr-2" /> Starred</Button>
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
                    <DropdownMenuTrigger asChild><Button variant="outline" size="sm"><Settings className="h-4 w-4" /></Button></DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuItem onSelect={() => setAnswerWith('definition')}>Answer with Definition {answerWith === 'definition' && '✓'}</DropdownMenuItem>
                        <DropdownMenuItem onSelect={() => setAnswerWith('term')}>Answer with Term {answerWith === 'term' && '✓'}</DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuCheckboxItem
                            checked={isSmartGradingEnabled}
                            onCheckedChange={setIsSmartGradingEnabled}
                        >
                            <Brain className="mr-2 h-4 w-4" />
                            Smart Grading
                        </DropdownMenuCheckboxItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </div>

        {/* Main Area */}
        <div className="flex-grow flex flex-col items-center justify-center gap-6">
            <UICard className="w-full max-w-3xl">
                <CardHeader>
                    <CardTitle className="text-muted-foreground font-semibold flex items-center justify-between">
                        <span>{answerWith === 'definition' ? 'Term' : 'Definition'}</span>
                        <Badge variant="outline">Typed Recall</Badge>
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="prose dark:prose-invert max-w-none text-2xl" dangerouslySetInnerHTML={{ __html: questionContent || ""}} />
                </CardContent>
            </UICard>

            {answerState === 'unanswered' ? (
                <form onSubmit={(e) => { e.preventDefault(); handleCheckAnswer(); }} className="w-full max-w-3xl space-y-3 text-right">
                    <Textarea 
                        placeholder={`Type the ${answerWith === 'definition' ? 'definition' : 'term'} here...`}
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        rows={3}
                        className="text-lg"
                    />
                    <Button type="submit">Check Answer</Button>
                </form>
            ) : (
                <AnswerFeedback 
                    result={lastResult}
                    userAnswer={inputValue}
                    correctAnswer={stripHtml(answerContent)}
                    onContinue={handleNextQuestion}
                    onCorrectOverride={handleCorrectOverride}
                    onIncorrectOverride={handleIncorrectOverride}
                />
            )}
        </div>
        
        {/* Bottom Controls */}
        <div className="flex-shrink-0 space-y-4">
            <div className="flex items-center justify-between">
                <Button variant="ghost" size="icon" onClick={handleToggleStar}>
                    <Star className={cn("h-6 w-6 text-muted-foreground", cardProgress[currentCard.id]?.starred && 'fill-yellow-400 text-yellow-500')} />
                </Button>
                <div className="flex items-center gap-4">
                    <Button variant="outline" size="icon" onClick={handlePrev}><ArrowLeft/></Button>
                    <span className="font-medium text-muted-foreground tabular-nums">{currentIndex + 1} / {cardsToStudy.length}</span>
                    <Button variant="outline" size="icon" onClick={handleNextQuestion}><ArrowRight/></Button>
                </div>
                <Button variant="ghost" size="icon" onClick={() => router.push(`/dashboard/ace-os/create?deckId=${deck.id}`)}>
                    <Pencil className="h-5 w-5 text-muted-foreground" />
                </Button>
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
  );
}

// Sub-component for feedback
function AnswerFeedback({ result, userAnswer, correctAnswer, onContinue, onCorrectOverride, onIncorrectOverride }: {
    result: 'correct' | 'incorrect' | 'typo' | null;
    userAnswer: string;
    correctAnswer: string;
    onContinue: () => void;
    onCorrectOverride: () => void;
    onIncorrectOverride: () => void;
}) {
    const feedbackConfig = {
        correct: {
            Icon: CheckCircle2,
            title: "Correct!",
            className: "border-green-500/50 bg-green-500/10 text-green-700 dark:text-green-300"
        },
        typo: {
            Icon: Lightbulb,
            title: "Close! You had a small typo.",
            className: "border-yellow-500/50 bg-yellow-500/10 text-yellow-700 dark:text-yellow-300"
        },
        incorrect: {
            Icon: XCircle,
            title: "Incorrect",
            className: "border-red-500/50 bg-red-500/10 text-red-700 dark:text-red-300"
        },
    };

    const currentFeedback = result ? feedbackConfig[result] : null;

    if (!currentFeedback) return null;

    return (
        <UICard className={cn("w-full max-w-3xl animate-in fade-in duration-300", currentFeedback.className)}>
            <CardHeader className="flex-row items-center gap-3 space-y-0">
                <currentFeedback.Icon className="h-6 w-6" />
                <CardTitle className="text-xl">{currentFeedback.title}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                {result === 'typo' && (
                     <p className="text-sm text-muted-foreground italic">
                        This question has been marked as correct.
                    </p>
                )}
                {result !== 'correct' && (
                    <div className="space-y-1">
                        <Label className="text-xs">Your Answer</Label>
                        <p className="rounded-md border bg-background/50 p-2 text-sm">{userAnswer}</p>
                    </div>
                )}
                <div className="space-y-1">
                    <Label className="text-xs">Correct Answer</Label>
                    <p className="rounded-md border bg-background/50 p-2 text-sm">{correctAnswer}</p>
                </div>
                <div className="flex justify-between items-center pt-2">
                    {result === 'incorrect' ? (
                        <Button variant="ghost" size="sm" onClick={onCorrectOverride}>
                            <AlertCircle className="mr-2 h-4 w-4" /> Override: I was right
                        </Button>
                    ) : result === 'typo' ? (
                        <Button variant="ghost" size="sm" onClick={onIncorrectOverride}>
                            <XCircle className="mr-2 h-4 w-4" /> Override: I was wrong
                        </Button>
                    ): <div />}
                    <Button onClick={onContinue}>Continue <ArrowRight className="ml-2 h-4 w-4" /></Button>
                </div>
            </CardContent>
        </UICard>
    )
}
