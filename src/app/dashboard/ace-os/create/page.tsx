
'use client';

import React, { useState, useMemo, Suspense, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { PlusCircle, ArrowLeft, Loader2, Send, Lightbulb, CheckCircle, AlertCircle, Save, Search } from 'lucide-react';
import { CardEditor } from './CardEditor';
import { courses, type Course } from '@/lib/courses';
import { useToast } from '@/hooks/use-toast';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/contexts/AuthContext';
import { db } from '@/lib/firebase';
import { doc, getDoc, setDoc, collection, serverTimestamp, updateDoc, onSnapshot } from 'firebase/firestore';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, SelectLabel, SelectSeparator, SelectGroup } from '@/components/ui/select';


type FlashcardState = {
    id: number;
    term: string;
    definition: string;
    hint: string;
    options: string[];
    cardType: 'term-definition' | 'multiple-choice' | 'fill-in-the-blank';
};

type AutoSaveStatus = 'idle' | 'saving' | 'saved' | 'error';

function AutoSaveStatusIndicator({ status }: { status: AutoSaveStatus }) {
    switch (status) {
        case 'saving':
            return <div className="flex items-center gap-2 text-sm text-muted-foreground"><Loader2 className="h-4 w-4 animate-spin" /><span>Saving...</span></div>;
        case 'saved':
            return <div className="flex items-center gap-2 text-sm text-green-600"><CheckCircle className="h-4 w-4" /><span>Saved</span></div>;
        case 'error':
            return <div className="flex items-center gap-2 text-sm text-destructive"><AlertCircle className="h-4 w-4" /><span>Save failed</span></div>;
        default:
            return <div className="h-6"></div>; // Placeholder to prevent layout shift
    }
}

const stripHtml = (html: string) => {
    if (typeof window === 'undefined') return '';
    const doc = new DOMParser().parseFromString(html, 'text/html');
    return doc.body.textContent || "";
};


function CreateFlashcardComponent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const { toast } = useToast();
    const { user } = useAuth();

    const initialCourseId = searchParams.get('courseId');
    const initialDeckId = searchParams.get('deckId');
    
    const [deckId, setDeckId] = useState<string | null>(initialDeckId);
    const [deckTitle, setDeckTitle] = useState('');
    const [deckCourseId, setDeckCourseId] = useState<string | null>(initialCourseId);
    const [description, setDescription] = useState('');
    const [hashtags, setHashtags] = useState('');
    const [cards, setCards] = useState<FlashcardState[]>([{ id: Date.now(), term: '', definition: '', hint: '', options: [], cardType: 'term-definition' }]);
    
    const [isPublishing, setIsPublishing] = useState(false);
    const [isLoadingData, setIsLoadingData] = useState(!!initialDeckId);
    const [autoSaveStatus, setAutoSaveStatus] = useState<AutoSaveStatus>('idle');
    const debounceTimeout = useRef<NodeJS.Timeout | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [userCourses, setUserCourses] = useState<Course[]>([]);

    const selectedCourse = useMemo(() => courses.find(c => c.id === deckCourseId), [deckCourseId]);

    useEffect(() => {
        if (!user) {
            setUserCourses([]);
            return;
        };
        const userDocRef = doc(db, 'users', user.uid);
        const unsubscribe = onSnapshot(userDocRef, (docSnap) => {
            if (docSnap.exists()) {
                const addedCourseIds: string[] = docSnap.data().addedCourses || [];
                const fetchedCourses = addedCourseIds
                    .map(id => courses.find(c => c.id === id))
                    .filter((c): c is Course => !!c);
                setUserCourses(fetchedCourses);
            }
        });
        return () => unsubscribe();
    }, [user]);

    useEffect(() => {
        if (!initialDeckId || !user) {
            setIsLoadingData(false);
            return;
        }

        const fetchDeck = async () => {
            setIsLoadingData(true);
            const deckDocRef = doc(db, 'users', user.uid, 'flashcardDecks', initialDeckId);
            const docSnap = await getDoc(deckDocRef);

            if (docSnap.exists()) {
                const data = docSnap.data();
                setDeckTitle(data.title || '');
                setDescription(data.description || '');
                setHashtags(data.hashtags || '');
                setDeckCourseId(data.courseId || null);
                const loadedCards = data.cards.map((c: any, index: number): FlashcardState => ({
                    id: c.id || Date.now() + index,
                    term: c.term || '',
                    definition: c.definition || '',
                    hint: c.hint || '',
                    options: c.options || [],
                    cardType: c.cardType || 'term-definition',
                }));
                setCards(loadedCards.length > 0 ? loadedCards : [{ id: Date.now(), term: '', definition: '', hint: '', options: [], cardType: 'term-definition' }]);
                setAutoSaveStatus('idle');
            } else {
                toast({ variant: 'destructive', title: 'Error', description: 'Could not find the requested deck.' });
                router.push('/dashboard/ace-os');
            }
            setIsLoadingData(false);
        };
        fetchDeck();
    }, [initialDeckId, user, router, toast]);

    const handleAddCard = () => {
        setCards([...cards, { id: Date.now(), term: '', definition: '', hint: '', options: [], cardType: 'term-definition' }]);
    };

    const handleUpdateCard = (id: number, field: 'term' | 'definition' | 'hint' | 'cardType', value: string) => {
        setCards(currentCards => 
            currentCards.map(card => {
                if (card.id === id) {
                    const updatedCard = { ...card, [field]: value };
                    if (field === 'cardType' && value !== 'multiple-choice') {
                        updatedCard.options = [];
                    }
                    return updatedCard;
                }
                return card;
            })
        );
    };

    const handleDeleteCard = (id: number) => {
        setCards(currentCards => currentCards.filter(card => card.id !== id));
    };

    const handleSwapCard = (id: number) => {
        setCards(currentCards =>
            currentCards.map(card => {
                if (card.id === id) {
                    return { ...card, term: card.definition, definition: card.term };
                }
                return card;
            })
        );
    };

    const handleOptionChange = (cardId: number, optionIndex: number, value: string) => {
        setCards(currentCards =>
            currentCards.map(card => {
                if (card.id === cardId) {
                    const newOptions = [...card.options];
                    newOptions[optionIndex] = value;
                    return { ...card, options: newOptions };
                }
                return card;
            })
        );
    };

    const handleAddOption = (cardId: number) => {
        setCards(currentCards =>
            currentCards.map(card => {
                if (card.id === cardId) {
                    return { ...card, options: [...card.options, ''] };
                }
                return card;
            })
        );
    };

    const handleRemoveOption = (cardId: number, optionIndex: number) => {
        setCards(currentCards =>
            currentCards.map(card => {
                if (card.id === cardId) {
                    const newOptions = card.options.filter((_, i) => i !== optionIndex);
                    return { ...card, options: newOptions };
                }
                return card;
            })
        );
    };

    const handleSuggestHashtags = async () => {
        toast({
            title: 'Feature Temporarily Unavailable',
            description: 'AI hashtag suggestions are offline while we resolve a package issue. Please check back later.',
        });
    };

    const handleSaveDraft = useCallback(async (redirectHome: boolean = false) => {
        if (!user || !deckTitle.trim() || isLoadingData) {
            if (redirectHome && !deckTitle.trim()) { // Only toast on manual save
                toast({
                    variant: 'destructive',
                    title: 'Title Required',
                    description: 'Please provide a title for your deck before saving.',
                });
            }
            setAutoSaveStatus(deckTitle.trim() ? 'idle' : 'error');
            return;
        }

        setAutoSaveStatus('saving');

        const isNewDeckCreation = !deckId;
        const currentDeckId = deckId || doc(collection(db, 'users', user.uid, 'flashcardDecks')).id;
        const deckDocRef = doc(db, 'users', user.uid, 'flashcardDecks', currentDeckId);

        const deckData: any = {
            title: deckTitle,
            description,
            hashtags,
            courseId: deckCourseId,
            cards,
            status: 'draft',
            updatedAt: serverTimestamp(),
        };

        if (isNewDeckCreation) {
            deckData.createdAt = serverTimestamp();
        }

        try {
            await setDoc(deckDocRef, deckData, { merge: true });

            if (isNewDeckCreation) {
                setDeckId(currentDeckId);
                const newUrl = `/dashboard/ace-os/create?deckId=${currentDeckId}`;
                router.replace(newUrl, { scroll: false });
                if (!redirectHome) {
                    toast({
                        title: 'Draft Created!',
                        description: `Your work is now being auto-saved as you type.`,
                    });
                }
            }
            setAutoSaveStatus('saved');
            
            if (redirectHome) {
                toast({
                    title: 'Draft Saved',
                    description: `Returning to Ace OS...`,
                });
                router.push('/dashboard/ace-os');
            }

        } catch (error) {
            console.error("Error auto-saving deck: ", error);
            setAutoSaveStatus('error');
            toast({
                variant: 'destructive',
                title: 'Save Failed',
                description: 'Could not save your draft. Please try again.',
            });
        }
    }, [user, isLoadingData, deckId, deckTitle, description, hashtags, cards, deckCourseId, router, toast]);

    useEffect(() => {
        if (isLoadingData) return;

        if (debounceTimeout.current) clearTimeout(debounceTimeout.current);
        
        if (deckTitle) { // Only start saving if there's a title
            setAutoSaveStatus('saving'); 
            debounceTimeout.current = setTimeout(() => {
                handleSaveDraft();
            }, 2500);
        }

        return () => {
            if (debounceTimeout.current) clearTimeout(debounceTimeout.current);
        };
    }, [deckTitle, description, hashtags, cards, isLoadingData, handleSaveDraft]);

    const handlePublish = async () => {
        if (!user || !deckId) {
            toast({ variant: 'destructive', title: 'Error', description: 'Please add a title to create a draft before publishing.' });
            return;
        }
        if (!deckTitle.trim()) {
            toast({ variant: 'destructive', title: 'Error', description: 'Please provide a title for your deck.' });
            return;
        }
        if (cards.some(card => !card.term.trim() || !card.definition.trim())) {
            toast({ variant: 'destructive', title: 'Error', description: 'All flashcards must have a primary term/question and definition/answer.' });
            return;
        }

        setIsPublishing(true);
        if (debounceTimeout.current) {
            clearTimeout(debounceTimeout.current);
        }
        await handleSaveDraft();
        
        const deckDocRef = doc(db, 'users', user.uid, 'flashcardDecks', deckId);

        try {
            await updateDoc(deckDocRef, {
                status: 'published',
                updatedAt: serverTimestamp(),
            });
            toast({
                title: 'Deck Published!',
                description: `Your deck "${deckTitle}" is ready for studying.`,
            });
            router.push(`/dashboard/ace-os/study/${deckId}`);
        } catch (error) {
            console.error("Error publishing deck: ", error);
            toast({ variant: 'destructive', title: 'Error', description: 'Failed to publish deck. Please try again.' });
        } finally {
            setIsPublishing(false);
        }
    };
    
    const filteredCards = useMemo(() => {
        if (!searchTerm.trim()) {
            return cards;
        }
        const lowercasedFilter = searchTerm.toLowerCase();
        return cards.filter(card => {
            const cardTypeLabel = card.cardType.replace('-', ' ');
            const optionsText = card.options.join(' ');

            return (
                stripHtml(card.term).toLowerCase().includes(lowercasedFilter) ||
                stripHtml(card.definition).toLowerCase().includes(lowercasedFilter) ||
                stripHtml(card.hint).toLowerCase().includes(lowercasedFilter) ||
                cardTypeLabel.toLowerCase().includes(lowercasedFilter) ||
                optionsText.toLowerCase().includes(lowercasedFilter)
            );
        });
    }, [cards, searchTerm]);

    if (isLoadingData) {
        return <div className="flex h-screen w-full items-center justify-center"><Loader2 className="h-12 w-12 animate-spin text-primary"/></div>;
    }

    return (
        <div className="flex flex-col h-full bg-background">
            <header className="sticky top-0 z-20 flex items-center justify-between bg-background p-4 border-b">
                <div className="flex items-center gap-4">
                    <Button variant="outline" size="icon" asChild>
                        <Link href="/dashboard/ace-os"><ArrowLeft className="h-4 w-4" /></Link>
                    </Button>
                    <div>
                        <h1 className="text-xl font-bold font-headline">{deckId ? "Edit Flashcards" : "Create Flashcards"}</h1>
                        <p className="text-sm text-muted-foreground">Course: {selectedCourse?.name || 'General'}</p>
                    </div>
                </div>
                <div className="flex items-center gap-4">
                    <AutoSaveStatusIndicator status={autoSaveStatus} />
                    <Button variant="outline" onClick={() => handleSaveDraft(true)} disabled={autoSaveStatus === 'saving' || !deckTitle.trim()}>
                        <Save className="mr-2 h-4 w-4" />
                        Save as Draft
                    </Button>
                    <Button onClick={handlePublish} disabled={isPublishing || !deckId}>
                        {isPublishing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Send className="mr-2 h-4 w-4" />}
                        Save & Study
                    </Button>
                </div>
            </header>

            <div className="bg-secondary p-4 md:p-8 rounded-lg">
                 <div className="grid md:grid-cols-3 gap-x-6 gap-y-4">
                    <div className="md:col-span-2">
                        <Label htmlFor="deck-title" className="text-lg font-semibold">Deck Title</Label>
                        <Input 
                            id="deck-title"
                            placeholder="e.g., Chapter 3 Vocabulary, APUSH Period 5 Key Events" 
                            className="mt-2 text-xl h-12"
                            value={deckTitle}
                            onChange={(e) => setDeckTitle(e.target.value)}
                        />
                    </div>
                    <div>
                         <Label htmlFor="deck-course">Course</Label>
                         <Select value={deckCourseId || 'general'} onValueChange={(value) => setDeckCourseId(value === 'general' ? null : value)}>
                            <SelectTrigger id="deck-course" className="mt-2 h-12">
                                <SelectValue placeholder="Select a course..." />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="general">General / Uncategorized</SelectItem>
                                {userCourses.length > 0 && (
                                    <>
                                        <SelectSeparator />
                                        <SelectGroup>
                                            <SelectLabel>Your Courses</SelectLabel>
                                            {userCourses.map(course => (
                                                <SelectItem key={course.id} value={course.id}>{course.name}</SelectItem>
                                            ))}
                                        </SelectGroup>
                                    </>
                                )}
                                <SelectSeparator />
                                <SelectGroup>
                                    <SelectLabel className="p-0 text-center">
                                        <Link href="/classes" className="text-sm font-medium text-primary hover:underline underline-offset-4 block py-1.5 px-2">
                                            Add/Remove Courses...
                                        </Link>
                                    </SelectLabel>
                                </SelectGroup>
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="md:col-span-3">
                        <Label htmlFor="deck-description">Description (Optional)</Label>
                        <Textarea
                            id="deck-description"
                            placeholder="Add a brief description of what this deck covers..."
                            className="mt-2"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                        />
                    </div>
                    <div className="md:col-span-3">
                        <Label htmlFor="deck-hashtags">Hashtags (Optional)</Label>
                        <div className="flex items-center gap-2 mt-2">
                            <Button type="button" variant="outline" size="icon" onClick={handleSuggestHashtags}>
                                <Lightbulb className="h-5 w-5" />
                                <span className="sr-only">Auto Generate Hashtags</span>
                            </Button>
                            <Input
                                id="deck-hashtags"
                                placeholder="#history #ww2 #midterm"
                                value={hashtags}
                                onChange={(e) => setHashtags(e.target.value)}
                            />
                        </div>
                    </div>
                </div>
            </div>

            <div className="px-4 md:px-8 py-6">
                <Label htmlFor="card-search" className="sr-only">Search Cards</Label>
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                    <Input
                        id="card-search"
                        placeholder="Search terms, definitions, hints, types..."
                        className="pl-10 h-11"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            <main className="flex-grow p-4 md:p-8 pt-0 space-y-6 overflow-y-auto bg-secondary/30">
                {filteredCards.length > 0 ? (
                    filteredCards.map((card, index) => (
                        <CardEditor 
                            key={card.id}
                            index={index + 1}
                            card={card}
                            onUpdate={handleUpdateCard}
                            onDelete={handleDeleteCard}
                            onSwap={handleSwapCard}
                            onOptionChange={handleOptionChange}
                            onAddOption={handleAddOption}
                            onRemoveOption={handleRemoveOption}
                        />
                    ))
                ) : (
                    cards.length > 0 && (
                        <div className="text-center py-16 text-muted-foreground bg-background rounded-lg">
                            <h3 className="text-lg font-semibold">No Cards Found</h3>
                            <p>Your search for "{searchTerm}" did not match any cards.</p>
                        </div>
                    )
                )}

                <Button variant="secondary" className="w-full h-12" onClick={handleAddCard}>
                    <PlusCircle className="mr-2 h-5 w-5" />
                    Add Card
                </Button>
            </main>
        </div>
    );
}

export default function CreateFlashcardPage() {
    return (
        <Suspense fallback={<div className="flex h-screen w-full items-center justify-center"><Loader2 className="h-12 w-12 animate-spin text-primary"/></div>}>
            <CreateFlashcardComponent />
        </Suspense>
    )
}
