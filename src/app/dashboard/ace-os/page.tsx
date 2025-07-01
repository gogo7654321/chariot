
'use client';

import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { db } from '@/lib/firebase';
import { collection, onSnapshot, query, doc, Timestamp, updateDoc, deleteDoc, getDoc, setDoc } from 'firebase/firestore';
import type { Course } from '@/lib/courses';
import { courses } from '@/lib/courses';
import { Responsive, WidthProvider } from 'react-grid-layout';
import 'react-grid-layout/css/styles.css';
import '../../dashboard/dashboard.css';

import { Button, buttonVariants } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, SelectSeparator, SelectGroup, SelectLabel } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
    PlusCircle, 
    Loader2, 
    Search, 
    FileText, 
    Settings, 
    Pin, 
    PinOff,
    Copy,
    Pencil,
    FileDown,
    Share2,
    FolderOutput,
    ExternalLink,
    Tags,
    Combine,
    Download,
    Trash2,
    BookCopy,
    FlipHorizontal,
    FlipVertical,
    AudioLines,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { CourseIcon } from '@/components/CourseIcon';
import { 
    DropdownMenu, 
    DropdownMenuContent, 
    DropdownMenuItem, 
    DropdownMenuLabel,
    DropdownMenuTrigger,
    DropdownMenuSeparator,
    DropdownMenuSub,
    DropdownMenuSubTrigger,
    DropdownMenuSubContent,
    DropdownMenuCheckboxItem,
} from '@/components/ui/dropdown-menu';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useToast } from '@/hooks/use-toast';
import { ExportDialog } from './components/ExportDialog';
import { EditHashtagsDialog } from './components/EditHashtagsDialog';
import { cn } from '@/lib/utils';


type UserDeck = {
    id: string;
    title: string;
    courseId: string;
    status: 'draft' | 'published';
    cardCount: number;
    createdAt: Date | null;
    hashtags?: string;
    isPinned: boolean;
    studyDefaults?: StudyDefaults;
};

type StudyDefaults = {
    answerWith: 'term' | 'definition';
    flipDirection: 'horizontal' | 'vertical';
};

type FullUserDeck = UserDeck & {
    cards: { term: string; definition: string }[];
};

type LayoutItem = { i: string; x: number; y: number; w: number; h: number; };
type Layouts = { [key: string]: LayoutItem[] };

const ResponsiveGridLayout = WidthProvider(Responsive);

const generateDefaultLayout = (decks: UserDeck[], cols: number): LayoutItem[] => {
    const w = Math.min(4, cols);
    const h = 4;
    const numPerRow = Math.max(1, Math.floor(cols / w));
    return decks.map((deck, index) => ({
      i: deck.id,
      x: (index % numPerRow) * w,
      y: Math.floor(index / numPerRow) * h,
      w: w,
      h: h,
    }));
};

const cleanLayout = (layout: LayoutItem[]) => {
    return layout.map(({ i, x, y, w, h }) => ({ i, x, y, w, h }));
};
  
const cleanAllLayouts = (layouts: Layouts): Layouts => {
    const cleaned: Layouts = {};
    for (const breakpoint in layouts) {
        if (Object.prototype.hasOwnProperty.call(layouts, breakpoint)) {
            cleaned[breakpoint] = cleanLayout(layouts[breakpoint as keyof Layouts]);
        }
    }
    return cleaned;
};

export default function AceOSPage() {
    const { user } = useAuth();
    const router = useRouter();
    const { toast } = useToast();
    const [userCourses, setUserCourses] = useState<Course[]>([]);
    const [userDecks, setUserDecks] = useState<UserDeck[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [filterCourseId, setFilterCourseId] = useState<string>('all');
    const [searchTerm, setSearchTerm] = useState('');

    const [layouts, setLayouts] = useState<Layouts>({ lg: [] });
    const [isLayoutInitialized, setIsLayoutInitialized] = useState(false);
    const debounceTimer = useRef<NodeJS.Timeout | null>(null);
    
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [deckToDelete, setDeckToDelete] = useState<UserDeck | null>(null);

    const [isExportDialogOpen, setIsExportDialogOpen] = useState(false);
    const [deckToExport, setDeckToExport] = useState<FullUserDeck | null>(null);

    const [isHashtagsDialogOpen, setIsHashtagsDialogOpen] = useState(false);
    const [deckToEditHashtags, setDeckToEditHashtags] = useState<Omit<FullUserDeck, 'cards' | 'cardCount'> | null>(null);
    

    useEffect(() => {
        if (!user) {
            setIsLoading(false);
            return;
        }

        const userDocRef = doc(db, 'users', user.uid);
        const unsubscribeUser = onSnapshot(userDocRef, (docSnap) => {
            if (docSnap.exists()) {
                const data = docSnap.data();
                const addedCourseIds: string[] = data.addedCourses || [];
                const fetchedCourses = addedCourseIds
                    .map(id => courses.find(c => c.id === id))
                    .filter((c): c is Course => !!c);
                setUserCourses(fetchedCourses);

                const decksQuery = query(collection(db, 'users', user.uid, 'flashcardDecks'));
                const unsubscribeDecks = onSnapshot(decksQuery, (snapshot) => {
                    const fetchedDecks: UserDeck[] = [];
                    snapshot.forEach((doc) => {
                        const data = doc.data();
                        fetchedDecks.push({
                            id: doc.id,
                            title: data.title,
                            courseId: data.courseId,
                            status: data.status || 'draft',
                            cardCount: data.cards?.length || 0,
                            createdAt: data.createdAt instanceof Timestamp ? data.createdAt.toDate() : null,
                            hashtags: data.hashtags || '',
                            isPinned: data.isPinned ?? false,
                            studyDefaults: data.studyDefaults,
                        });
                    });
                    setUserDecks(fetchedDecks);
                    setIsLoading(false);
                }, (error) => {
                    console.error("Error fetching decks:", error);
                    setIsLoading(false);
                });

                return () => unsubscribeDecks();
            } else {
                setDoc(userDocRef, {}); // Create user doc if it doesn't exist
                setIsLoading(false);
            }
        });

        return () => unsubscribeUser();
    }, [user]);

    useEffect(() => {
        if (!user || userDecks.length === 0) {
            if (!isLoading) setIsLayoutInitialized(true);
            return;
        }
    
        const layoutDocRef = doc(db, 'users', user.uid);
        getDoc(layoutDocRef).then(docSnap => {
            const savedLayouts = docSnap.exists() ? docSnap.data().aceOsLayouts : null;
            let finalLayouts: Layouts = { lg: [], md: [], sm: [], xs: [], xxs: [] };
    
            const sortedDecks = [...userDecks].sort((a, b) => {
                if (a.isPinned !== b.isPinned) return a.isPinned ? -1 : 1;
                return (b.createdAt?.getTime() || 0) - (a.createdAt?.getTime() || 0);
            });
    
            if (savedLayouts) {
                // Reconcile saved layout with current decks
                const deckIds = new Set(sortedDecks.map(d => d.id));
                const breakpoints = ['lg', 'md', 'sm', 'xs', 'xxs'];
                breakpoints.forEach(bp => {
                    const savedLayoutForBp = savedLayouts[bp] || [];
                    const filteredLayout = cleanLayout(savedLayoutForBp).filter((item: LayoutItem) => deckIds.has(item.i));
                    const layoutDeckIds = new Set(filteredLayout.map((item: LayoutItem) => item.i));
                    const newDecks = sortedDecks.filter(deck => !layoutDeckIds.has(deck.id));
                    
                    const cols = { lg: 12, md: 10, sm: 6, xs: 4, xxs: 2 }[bp] || 12;
                    let nextY = 0;
                    if(filteredLayout.length > 0) {
                        const maxYItem = filteredLayout.reduce((prev, current) => ((prev.y + prev.h) > (current.y + current.h)) ? prev : current);
                        nextY = maxYItem.y + maxYItem.h;
                    }
                    
                    const w = Math.min(4, cols);
                    const h = 4;
                    const numPerRow = Math.max(1, Math.floor(cols / w));
                    
                    const newItems = newDecks.map((deck, index) => ({
                      i: deck.id,
                      x: (index % numPerRow) * w,
                      y: nextY + Math.floor(index / numPerRow) * h,
                      w: w,
                      h: h,
                    }));
                    finalLayouts[bp as keyof Layouts] = [...filteredLayout, ...newItems];
                });
            } else {
                // Generate default layout for all breakpoints
                finalLayouts = {
                    lg: generateDefaultLayout(sortedDecks, 12),
                    md: generateDefaultLayout(sortedDecks, 10),
                    sm: generateDefaultLayout(sortedDecks, 6),
                    xs: generateDefaultLayout(sortedDecks, 4),
                    xxs: generateDefaultLayout(sortedDecks, 2),
                };
            }
            setLayouts(finalLayouts);
            setIsLayoutInitialized(true);
        });
    }, [user, userDecks, isLoading]);

    const handleLayoutChange = useCallback((layout: LayoutItem[], allLayouts: Layouts) => {
        if (!isLayoutInitialized || !user) return;
        
        const cleanedLayouts = cleanAllLayouts(allLayouts);
        setLayouts(cleanedLayouts);

        if (debounceTimer.current) {
            clearTimeout(debounceTimer.current);
        }
        debounceTimer.current = setTimeout(() => {
            const layoutDocRef = doc(db, 'users', user.uid);
            setDoc(layoutDocRef, { aceOsLayouts: cleanedLayouts }, { merge: true });
        }, 500);

    }, [isLayoutInitialized, user]);


    const handleTogglePin = async (e: React.MouseEvent, deckId: string) => {
        e.preventDefault();
        e.stopPropagation();
        if (!user) return;

        const deck = userDecks.find(d => d.id === deckId);
        if (!deck) return;

        const deckDocRef = doc(db, 'users', user.uid, 'flashcardDecks', deckId);
        try {
            await updateDoc(deckDocRef, {
                isPinned: !deck.isPinned,
            });
        } catch (error) {
            console.error("Error pinning deck:", error);
            toast({
                variant: 'destructive',
                title: 'Error',
                description: 'Could not update pin status. Please try again.',
            });
        }
    };

    const handleSetStudyDefault = async (deckId: string, setting: keyof StudyDefaults, value: string) => {
        if (!user) return;
        
        const deckDocRef = doc(db, 'users', user.uid, 'flashcardDecks', deckId);
        try {
            await updateDoc(deckDocRef, {
                [`studyDefaults.${setting}`]: value,
            });
            toast({
                title: 'Default Saved',
                description: `Your preference for this deck has been updated.`,
            });
        } catch (error) {
            console.error("Error saving study default:", error);
            toast({
                variant: 'destructive',
                title: 'Error',
                description: 'Could not save your preference. Please try again.',
            });
        }
    };
    
    const handleDeleteDeck = async () => {
        if (!user || !deckToDelete) return;
        try {
            await deleteDoc(doc(db, 'users', user.uid, 'flashcardDecks', deckToDelete.id));
            toast({
                title: "Deck Deleted",
                description: `"${deckToDelete.title}" has been permanently deleted.`,
            });
        } catch (error) {
            console.error("Error deleting deck:", error);
            toast({
                variant: 'destructive',
                title: 'Error',
                description: 'Failed to delete the deck. Please try again.',
            });
        } finally {
            setDeckToDelete(null);
            setIsDeleteDialogOpen(false);
        }
    };

    const handleOpenExportDialog = async (e: React.MouseEvent, deckId: string) => {
        e.preventDefault();
        e.stopPropagation();
        if (!user) return;
    
        toast({ title: "Preparing export..." });
        try {
            const deckDocRef = doc(db, 'users', user.uid, 'flashcardDecks', deckId);
            const docSnap = await getDoc(deckDocRef);
            if (docSnap.exists()) {
                const data = docSnap.data();
                const fullDeck: FullUserDeck = {
                    id: docSnap.id,
                    title: data.title,
                    courseId: data.courseId,
                    status: data.status,
                    cardCount: data.cards?.length || 0,
                    createdAt: data.createdAt?.toDate() || null,
                    cards: data.cards || [],
                    hashtags: data.hashtags || '',
                    isPinned: data.isPinned ?? false,
                };
                setDeckToExport(fullDeck);
                setIsExportDialogOpen(true);
            } else {
                throw new Error("Deck not found.");
            }
        } catch (error) {
            console.error("Failed to fetch deck for export:", error);
            toast({
                variant: 'destructive',
                title: 'Error',
                description: 'Could not load deck for export. Please try again.',
            });
        }
    };

    const filteredDecks = useMemo(() => {
        return userDecks.filter(deck => {
            const courseMatch = filterCourseId === 'all' || deck.courseId === filterCourseId || (!deck.courseId && filterCourseId === 'general');
            const searchMatch = searchTerm === '' || deck.title.toLowerCase().includes(searchTerm.toLowerCase()) || deck.hashtags?.toLowerCase().includes(searchTerm.toLowerCase());
            return courseMatch && searchMatch;
        });
    }, [userDecks, filterCourseId, searchTerm]);

    if (isLoading || !isLayoutInitialized) {
        return <div className="flex h-full items-center justify-center p-8"><Loader2 className="h-12 w-12 animate-spin text-primary"/></div>;
    }

    return (
        <div className="flex flex-col h-full p-4 md:p-8 space-y-6">
            <header className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                    <h1 className="font-headline text-3xl md:text-4xl font-bold">Ace OS<span className="copyright-symbol">©</span></h1>
                    <p className="text-muted-foreground mt-1">Your smart study hub for mastering AP content.</p>
                </div>
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button>
                            <PlusCircle className="mr-2 h-5 w-5" />
                            Create New Deck
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                        <DropdownMenuLabel>Select a course</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onSelect={() => router.push('/dashboard/ace-os/create')}>
                            General
                        </DropdownMenuItem>
                        {userCourses.map(course => (
                            <DropdownMenuItem key={course.id} onSelect={() => router.push(`/dashboard/ace-os/create?courseId=${course.id}`)}>
                                {course.name}
                            </DropdownMenuItem>
                        ))}
                         <DropdownMenuSeparator />
                         <DropdownMenuItem onSelect={() => router.push('/classes')}>
                            Add more courses...
                         </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="relative md:col-span-2">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                    <Input
                        placeholder="Search decks by title or #hashtag..."
                        className="pl-10 h-11"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <Select onValueChange={setFilterCourseId} value={filterCourseId}>
                    <SelectTrigger className="h-11">
                        <SelectValue placeholder="Filter by course..." />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Courses</SelectItem>
                        <SelectItem value="general">General</SelectItem>
                        <SelectGroup>
                            <SelectLabel className="p-0 text-center">
                                <Link
                                    href="/classes"
                                    className="text-sm font-medium text-primary hover:underline underline-offset-4 block py-1.5"
                                >
                                    Add Courses...
                                </Link>
                            </SelectLabel>
                        </SelectGroup>
                        {userCourses.length > 0 && <SelectSeparator />}
                        {userCourses.map(course => (
                            <SelectItem key={course.id} value={course.id}>{course.name}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            <div className="flex-grow min-h-0">
                {filteredDecks.length > 0 ? (
                     <ResponsiveGridLayout
                        layouts={layouts}
                        onLayoutChange={handleLayoutChange}
                        breakpoints={{ lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 }}
                        cols={{ lg: 12, md: 10, sm: 6, xs: 4, xxs: 2 }}
                        rowHeight={50}
                        margin={[24, 24]}
                        isResizable={false}
                        draggableHandle=".drag-handle"
                    >
                       {filteredDecks.map(deck => {
                           const course = deck.courseId ? courses.find(c => c.id === deck.courseId) : null;
                           const isPinned = deck.isPinned;
                           const studyDefaults = deck.studyDefaults || { answerWith: 'definition', flipDirection: 'horizontal' };

                           return (
                                <div key={deck.id} className="group">
                                    <Card className="flex flex-col h-full transition-all duration-200 hover:shadow-lg hover:-translate-y-1 relative">
                                        <div className="drag-handle z-30"></div>
                                        <Link 
                                            href={deck.status === 'published' ? `/dashboard/ace-os/study/${deck.id}` : `/dashboard/ace-os/create?deckId=${deck.id}`} 
                                            className="absolute inset-0 z-10" 
                                            aria-label={`View deck ${deck.title}`}>
                                        </Link>
                                        <CardHeader className="relative pl-10">
                                            <div className="flex items-start justify-between">
                                                <CardTitle className="text-xl font-bold line-clamp-2 text-foreground pr-20">
                                                    <span className="animated-gradient-text" data-text={deck.title}>
                                                        {deck.title}
                                                    </span>
                                                </CardTitle>
                                                <div className="absolute top-2 right-1 flex items-center z-20">
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-8 w-8"
                                                        onClick={(e) => handleTogglePin(e, deck.id)}
                                                        aria-label={isPinned ? 'Unpin deck' : 'Pin deck'}
                                                    >
                                                        <Pin className={cn("h-4 w-4 text-muted-foreground transition-colors group-hover:text-primary", isPinned && "fill-primary text-primary")} />
                                                    </Button>
                                                    <DropdownMenu>
                                                        <DropdownMenuTrigger asChild>
                                                            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={(e) => e.preventDefault()}>
                                                                <Settings className="h-4 w-4" />
                                                            </Button>
                                                        </DropdownMenuTrigger>
                                                        <DropdownMenuContent align="end" onClick={(e) => {e.preventDefault(); e.stopPropagation();}}>
                                                            <DropdownMenuItem onSelect={(e) => { e.preventDefault(); router.push(`/dashboard/ace-os/create?deckId=${deck.id}`); }}>
                                                                <Pencil className="mr-2 h-4 w-4" />
                                                                <span>Edit</span>
                                                            </DropdownMenuItem>
                                                            <DropdownMenuItem onSelect={(e) => { e.preventDefault(); window.open(`/dashboard/ace-os/create?deckId=${deck.id}`, '_blank'); }}>
                                                                <ExternalLink className="mr-2 h-4 w-4" />
                                                                <span>Open in new tab</span>
                                                            </DropdownMenuItem>
                                                            <DropdownMenuSeparator />
                                                            <DropdownMenuSub>
                                                                <DropdownMenuSubTrigger>
                                                                    <Settings className="mr-2 h-4 w-4" />
                                                                    <span>Study Defaults</span>
                                                                </DropdownMenuSubTrigger>
                                                                <DropdownMenuSubContent>
                                                                    <DropdownMenuLabel>Answer With</DropdownMenuLabel>
                                                                    <DropdownMenuCheckboxItem
                                                                        checked={studyDefaults.answerWith === 'definition'}
                                                                        onSelect={() => handleSetStudyDefault(deck.id, 'answerWith', 'definition')}
                                                                    >
                                                                        <AudioLines className="mr-2 h-4 w-4" /> Definition
                                                                    </DropdownMenuCheckboxItem>
                                                                    <DropdownMenuCheckboxItem
                                                                        checked={studyDefaults.answerWith === 'term'}
                                                                        onSelect={() => handleSetStudyDefault(deck.id, 'answerWith', 'term')}
                                                                    >
                                                                        <FileText className="mr-2 h-4 w-4" /> Term
                                                                    </DropdownMenuCheckboxItem>
                                                                    <DropdownMenuSeparator />
                                                                    <DropdownMenuLabel>Flip Animation</DropdownMenuLabel>
                                                                    <DropdownMenuCheckboxItem
                                                                        checked={studyDefaults.flipDirection === 'horizontal'}
                                                                        onSelect={() => handleSetStudyDefault(deck.id, 'flipDirection', 'horizontal')}
                                                                    >
                                                                        <FlipHorizontal className="mr-2 h-4 w-4" /> Horizontal
                                                                    </DropdownMenuCheckboxItem>
                                                                    <DropdownMenuCheckboxItem
                                                                        checked={studyDefaults.flipDirection === 'vertical'}
                                                                        onSelect={() => handleSetStudyDefault(deck.id, 'flipDirection', 'vertical')}
                                                                    >
                                                                        <FlipVertical className="mr-2 h-4 w-4" /> Vertical
                                                                    </DropdownMenuCheckboxItem>
                                                                </DropdownMenuSubContent>
                                                            </DropdownMenuSub>
                                                            <DropdownMenuSeparator />
                                                            <DropdownMenuItem disabled>
                                                                <Copy className="mr-2 h-4 w-4" />
                                                                <span>Duplicate</span>
                                                            </DropdownMenuItem>
                                                            <DropdownMenuItem disabled>
                                                                <FolderOutput className="mr-2 h-4 w-4" />
                                                                <span>Move to...</span>
                                                            </DropdownMenuItem>
                                                            <DropdownMenuItem disabled>
                                                                <Combine className="mr-2 h-4 w-4" />
                                                                <span>Combine</span>
                                                            </DropdownMenuItem>
                                                            <DropdownMenuSeparator />
                                                             <DropdownMenuItem disabled>
                                                                <Share2 className="mr-2 h-4 w-4" />
                                                                <span>Manage Sharing</span>
                                                            </DropdownMenuItem>
                                                            <DropdownMenuItem onSelect={(e) => {
                                                                    e.preventDefault();
                                                                    setDeckToEditHashtags(deck);
                                                                    setIsHashtagsDialogOpen(true);
                                                                }}>
                                                                <Tags className="mr-2 h-4 w-4" />
                                                                <span>Edit tags</span>
                                                            </DropdownMenuItem>
                                                            <DropdownMenuSeparator />
                                                            <DropdownMenuSub>
                                                                <DropdownMenuSubTrigger>
                                                                    <Download className="mr-2 h-4 w-4" />
                                                                    <span>Export</span>
                                                                </DropdownMenuSubTrigger>
                                                                <DropdownMenuSubContent>
                                                                    <DropdownMenuItem disabled>
                                                                        <FileDown className="mr-2 h-4 w-4" />
                                                                        <span>Export as PDF</span>
                                                                    </DropdownMenuItem>
                                                                    <DropdownMenuItem onSelect={(e) => handleOpenExportDialog(e, deck.id)}>
                                                                        <Download className="mr-2 h-4 w-4" />
                                                                        <span>Export as Text</span>
                                                                    </DropdownMenuItem>
                                                                </DropdownMenuSubContent>
                                                            </DropdownMenuSub>
                                                            <DropdownMenuSeparator />
                                                            <DropdownMenuItem
                                                                className="text-destructive focus:text-destructive"
                                                                onSelect={(e) => {
                                                                    e.preventDefault();
                                                                    setDeckToDelete(deck);
                                                                    setIsDeleteDialogOpen(true);
                                                                }}
                                                            >
                                                                <Trash2 className="mr-2 h-4 w-4" />
                                                                <span>Delete</span>
                                                            </DropdownMenuItem>
                                                        </DropdownMenuContent>
                                                    </DropdownMenu>
                                                </div>
                                            </div>
                                            {course ? (
                                                <CardDescription className="flex items-center gap-2 pt-1 text-muted-foreground">
                                                    <CourseIcon iconName={course.icon} className="h-4 w-4" />
                                                    <span className="animated-gradient-text" data-text={course.name}>
                                                        {course.name}
                                                    </span>
                                                </CardDescription>
                                            ) : (
                                                <CardDescription className="flex items-center gap-2 pt-1 text-muted-foreground">
                                                    <BookCopy className="h-4 w-4" />
                                                    <span className="animated-gradient-text" data-text="General">
                                                        General
                                                    </span>
                                                </CardDescription>
                                            )}
                                        </CardHeader>
                                        <CardContent className="flex-grow relative z-20">
                                            <div className="text-sm text-muted-foreground font-medium">
                                                <span className="animated-gradient-text" data-text={`${deck.cardCount} ${deck.cardCount === 1 ? 'card' : 'cards'}`}>
                                                    {deck.cardCount} {deck.cardCount === 1 ? 'card' : 'cards'}
                                                </span>
                                            </div>
                                            <div className="mt-2 flex flex-wrap gap-1.5">
                                                {deck.hashtags?.split(' ').filter(Boolean).map(tag => (
                                                    <Badge key={tag} variant="secondary" className="transition-colors group-hover:bg-accent/20 group-hover:text-accent-foreground/80">{tag}</Badge>
                                                ))}
                                            </div>
                                        </CardContent>
                                        <CardFooter className="text-xs text-muted-foreground flex justify-end relative z-20">
                                            {deck.status === 'draft' && <Badge variant="outline">Draft</Badge>}
                                            <span className="ml-auto">
                                                Created {deck.createdAt ? new Date(deck.createdAt).toLocaleDateString() : '...'}
                                            </span>
                                        </CardFooter>
                                    </Card>
                                </div>
                           );
                       })}
                    </ResponsiveGridLayout>
                ) : (
                     <div className="flex-grow flex items-center justify-center bg-secondary/50 rounded-lg border border-dashed min-h-[400px]">
                        <div className="text-center text-muted-foreground p-4">
                            <FileText className="mx-auto h-12 w-12" />
                            <p className="mt-4 font-semibold text-lg">No Decks Found</p>
                            <p className="text-sm mt-1 max-w-sm mx-auto">
                                {userDecks.length === 0 ? "You haven't created any flashcard decks yet. Get started by creating one!" : "Your search or filter returned no results. Try a different search term or select 'All Courses'."}
                            </p>
                            {userDecks.length === 0 && (
                                <Button asChild className="mt-4">
                                    <Link href="/dashboard/ace-os/create">
                                        <PlusCircle className="mr-2 h-5 w-5" />
                                        Create Your First Deck
                                    </Link>
                                </Button>
                            )}
                        </div>
                    </div>
                )}
            </div>
            <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This action cannot be undone. This will permanently delete the deck <span className="font-semibold text-foreground">"{deckToDelete?.title}"</span>.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel onClick={() => setDeckToDelete(null)}>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDeleteDeck} className={buttonVariants({ variant: "destructive" })}>
                            Delete
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
            {deckToExport && (
                <ExportDialog 
                    isOpen={isExportDialogOpen}
                    onClose={() => setIsExportDialogOpen(false)}
                    cards={deckToExport.cards}
                />
            )}
            {deckToEditHashtags && (
                <EditHashtagsDialog
                    isOpen={isHashtagsDialogOpen}
                    onClose={() => {
                        setIsHashtagsDialogOpen(false);
                        setDeckToEditHashtags(null);
                    }}
                    deck={deckToEditHashtags}
                />
            )}
        </div>
    );
}
