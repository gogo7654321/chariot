
'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { Responsive, WidthProvider } from 'react-grid-layout';
import 'react-grid-layout/css/styles.css';
import '../dashboard.css';

import { Button, buttonVariants } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogTrigger,
  DialogClose,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { cn } from '@/lib/utils';
import {
  format as formatDate,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  isToday,
  isSameMonth,
  isSameDay,
  addMonths,
  subMonths,
  add,
  getDay,
  getDate,
  getMonth,
  isAfter,
  isBefore,
  differenceInWeeks,
  parse,
  parseISO,
} from 'date-fns';
import { ChevronLeft, ChevronRight, PlusCircle, Calendar as CalendarDays, MapPin, NotebookText, Edit, Tag, Settings, Loader2 } from 'lucide-react';
import { FaApple } from 'react-icons/fa';
import { SiCanvas } from 'react-icons/si';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar as CalendarIcon } from '@/components/ui/calendar';
import { useAuth } from '@/contexts/AuthContext';
import { db } from '@/lib/firebase';
import {
  collection,
  query,
  onSnapshot,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  Timestamp,
  getDoc,
  setDoc,
  arrayUnion,
  getDocs,
  where,
  writeBatch,
} from 'firebase/firestore';
import { TimezoneSelect } from '@/components/TimezoneSelect';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { GoogleAuthProvider, signInWithPopup, getAdditionalUserInfo } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';


type RecurrenceRule = {
    type: 'none' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'custom';
    interval?: number;
    days?: number[]; // 0 for Sunday, 6 for Saturday
};

type CalendarEvent = {
  id: string;
  title: string;
  date: Date; // This is the START date for recurring events
  time: string;
  color: 'blue' | 'green' | 'red' | 'purple' | 'orange';
  location?: string;
  notes?: string;
  recurrenceRule?: RecurrenceRule;
  exceptions?: Timestamp[];
  googleEventId?: string;
};

type CalendarSettings = {
    dateFormat: string;
    timeFormat: '12h' | '24h';
    weekStartsOn: 0 | 1;
    timezone: string;
    googleCalendar?: {
        connected: boolean;
    };
};

const getBrowserTimezone = () => {
    if (typeof window === 'undefined') return 'UTC';
    try {
        return Intl.DateTimeFormat().resolvedOptions().timeZone;
    } catch (e) {
        console.warn('Could not detect timezone, defaulting to UTC.');
        return 'UTC';
    }
};

const defaultSettingsData: CalendarSettings = {
    dateFormat: "MMMM d, yyyy",
    timeFormat: '12h',
    weekStartsOn: 1, // Default Monday
    timezone: getBrowserTimezone(),
    googleCalendar: {
        connected: false,
    }
};

const settingsFormSchema = z.object({
    dateFormat: z.string(),
    timeFormat: z.enum(['12h', '24h']),
    weekStartsOn: z.coerce.number().min(0).max(1),
    timezone: z.string().min(1, 'Timezone is required.'),
});

const eventFormSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  date: z.date({ required_error: 'Date is required' }),
  hour: z.string({ required_error: "Please select an hour." }),
  minute: z.string({ required_error: "Please select a minute." }),
  period: z.enum(['AM', 'PM'], { required_error: "Please select AM or PM." }),
  color: z.enum(['blue', 'green', 'red', 'purple', 'orange']),
  location: z.string().optional(),
  notes: z.string().optional(),
  recurrenceType: z.enum(['none', 'daily', 'weekly', 'monthly', 'yearly', 'custom']),
  recurrenceInterval: z.string().optional(),
  recurrenceDays: z.array(z.number()).optional(),
}).refine(data => {
    if (data.recurrenceType === 'custom' && (!data.recurrenceInterval || parseInt(data.recurrenceInterval, 10) < 1)) {
        return false;
    }
    return true;
}, {
    message: "Interval must be at least 1",
    path: ['recurrenceInterval'],
}).refine(data => {
    if (data.recurrenceType === 'custom' && (!data.recurrenceDays || data.recurrenceDays.length === 0)) {
        return false;
    }
    return true;
}, {
    message: 'Please select at least one day to repeat',
    path: ['recurrenceDays'],
});

type EventFormData = z.infer<typeof eventFormSchema>;
type SettingsFormData = z.infer<typeof settingsFormSchema>;

const colorMap = {
  blue: { bg: 'bg-blue-500', name: 'Due Date' },
  green: { bg: 'bg-green-500', name: 'Extracurricular' },
  red: { bg: 'bg-red-500', name: 'Exam' },
  purple: { bg: 'bg-purple-500', name: 'Meeting' },
  orange: { bg: 'bg-orange-500', name: 'Personal' },
};
const colorOptions = Object.entries(colorMap).map(([key, {name}]) => ({ value: key as keyof typeof colorMap, label: name}));

function parseTime(timeStr: string): number {
  if (!timeStr) return -1;
  const normalizedTime = timeStr.toUpperCase().replace(/\./g, '');
  const modifierMatch = normalizedTime.match(/([AP]M)/);
  const modifier = modifierMatch ? modifierMatch[0] : '';
  
  const timePart = normalizedTime.replace(modifier, '').trim();
  const [hourStr, minuteStr] = timePart.split(':');
  
  let hours = parseInt(hourStr, 10);
  const minutes = minuteStr ? parseInt(minuteStr, 10) : 0;

  if (isNaN(hours) || isNaN(minutes)) {
    return -1;
  }

  if (modifier === 'PM' && hours !== 12) {
    hours += 12;
  } else if (modifier === 'AM' && hours === 12) {
    hours = 0;
  }

  return hours * 60 + minutes;
}

const ResponsiveGridLayout = WidthProvider(Responsive);
type LayoutItem = { i: string; x: number; y: number; w: number; h: number; minW?: number, minH?: number, maxW?: number, maxH?: number };
type Layouts = { [key: string]: LayoutItem[] };

const defaultLayouts: Layouts = {
    lg: [
      { i: 'calendar', x: 0, y: 0, w: 8, h: 12, minH: 8, minW: 6 },
      { i: 'eventOverview', x: 8, y: 0, w: 4, h: 12, minH: 6, minW: 3 },
    ],
    md: [
      { i: 'calendar', x: 0, y: 0, w: 6, h: 12, minH: 8, minW: 5 },
      { i: 'eventOverview', x: 6, y: 0, w: 4, h: 12, minH: 6, minW: 3 },
    ],
    sm: [
      { i: 'calendar', x: 0, y: 0, w: 6, h: 10, minH: 8, minW: 4 },
      { i: 'eventOverview', x: 0, y: 10, w: 6, h: 8, minH: 6, minW: 4 },
    ],
    xs: [
      { i: 'calendar', x: 0, y: 0, w: 4, h: 9, minH: 8, minW: 4 },
      { i: 'eventOverview', x: 0, y: 9, w: 4, h: 7, minH: 6, minW: 2 },
    ],
    xxs: [
       { i: 'calendar', x: 0, y: 0, w: 2, h: 8, minH: 8, minW: 2 },
       { i: 'eventOverview', x: 0, y: 8, w: 2, h: 7, minH: 6, minW: 2 },
    ],
  };

const GoogleIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" width="24px" height="24px" {...props}>
      <path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24s8.955,20,20,20s20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"/>
      <path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"/>
      <path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.222,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z"/>
      <path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.574l6.19,5.238C39.99,36.596,44,31.1,44,24C44,22.659,43.862,21.35,43.611,20.083z"/>
    </svg>
);

export default function CalendarPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);

  const [layouts, setLayouts] = React.useState<Layouts>(defaultLayouts);
  const [isLayoutInitialized, setIsLayoutInitialized] = React.useState(false);
  const debounceTimer = React.useRef<NodeJS.Timeout | null>(null);

  const [settings, setSettings] = useState<CalendarSettings>(defaultSettingsData);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);

  const settingsForm = useForm<SettingsFormData>({
    resolver: zodResolver(settingsFormSchema),
    values: settings,
  });

  useEffect(() => {
    if(user){
      const userDocRef = doc(db, 'users', user.uid);
      const unsubscribe = onSnapshot(userDocRef, (docSnap) => {
        if (docSnap.exists() && docSnap.data().calendarSettings) {
          const fetchedSettings = { ...defaultSettingsData, ...docSnap.data().calendarSettings };
          setSettings(fetchedSettings);
          settingsForm.reset(fetchedSettings);
        } else {
            setSettings(defaultSettingsData);
            settingsForm.reset(defaultSettingsData);
        }
      });
      return () => unsubscribe();
    } else {
        setSettings(defaultSettingsData);
        settingsForm.reset(defaultSettingsData);
    }
  }, [user, settingsForm]);

  React.useEffect(() => {
      if (user) {
          const layoutDocRef = doc(db, 'users', user.uid);
          getDoc(layoutDocRef).then(docSnap => {
              if (docSnap.exists() && docSnap.data().calendarLayouts) {
                  setLayouts(docSnap.data().calendarLayouts);
              }
              setIsLayoutInitialized(true);
          });
      } else {
          setIsLayoutInitialized(true);
      }
  }, [user]);

  const onLayoutChange = (layout: LayoutItem[], newLayouts: Layouts) => {
    if (!isLayoutInitialized) return;
    setLayouts(newLayouts);
    if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
    }
    debounceTimer.current = setTimeout(() => {
        if (user) {
            const layoutDocRef = doc(db, 'users', user.uid);
            setDoc(layoutDocRef, { calendarLayouts: newLayouts }, { merge: true });
        }
    }, 500);
  };

  const hours = Array.from({ length: 12 }, (_, i) => String(i + 1).padStart(2, '0'));
  const minutes = Array.from({ length: 12 }, (_, i) => String(i * 5).padStart(2, '0'));
  const periods = ['AM', 'PM'];

  const addForm = useForm<EventFormData>({
    resolver: zodResolver(eventFormSchema),
    defaultValues: { title: '', date: new Date(), hour: '12', minute: '00', period: 'PM', color: 'blue', location: '', notes: '', recurrenceType: 'none', recurrenceInterval: "1", recurrenceDays: [] },
  });
  
  const editForm = useForm<EventFormData>({
    resolver: zodResolver(eventFormSchema),
  });

  useEffect(() => {
    if (!user) {
      setEvents([]);
      return;
    }

    const eventsCollectionRef = collection(db, 'users', user.uid, 'events');
    const q = query(eventsCollectionRef);

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const fetchedEvents: CalendarEvent[] = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        const eventDate = data.date instanceof Timestamp ? data.date.toDate() : new Date();

        fetchedEvents.push({
          id: doc.id,
          title: data.title,
          date: eventDate,
          time: data.time,
          color: data.color,
          location: data.location,
          notes: data.notes,
          recurrenceRule: data.recurrenceRule,
          exceptions: data.exceptions,
          googleEventId: data.googleEventId,
        });
      });
      setEvents(fetchedEvents);
    });

    return () => unsubscribe();
  }, [user]);

  useEffect(() => {
    if (selectedEvent) {
      const timeParts = selectedEvent.time.match(/(\d+):(\d+)\s(AM|PM)/);
      const [, hour, minute, period] = timeParts || [null, '12', '00', 'PM'];

      editForm.reset({
        title: selectedEvent.title,
        date: selectedEvent.date,
        hour: hour || '12',
        minute: minute || '00',
        period: period as 'AM' | 'PM' || 'PM',
        color: selectedEvent.color,
        location: selectedEvent.location || '',
        notes: selectedEvent.notes || '',
        recurrenceType: selectedEvent.recurrenceRule?.type || 'none',
        recurrenceInterval: String(selectedEvent.recurrenceRule?.interval || 1),
        recurrenceDays: selectedEvent.recurrenceRule?.days || [],
      });
    }
  }, [selectedEvent, editForm]);
  
  const weekStartsOn = settings.weekStartsOn;
  const firstDayOfMonth = startOfMonth(currentMonth);
  const lastDayOfMonth = endOfMonth(currentMonth);
  const firstDayOfCalendar = startOfWeek(firstDayOfMonth, { weekStartsOn });
  const lastDayOfCalendar = endOfWeek(lastDayOfMonth, { weekStartsOn });

  const days = eachDayOfInterval({
    start: firstDayOfCalendar,
    end: lastDayOfCalendar,
  });

  const weekdays = eachDayOfInterval({
    start: firstDayOfCalendar,
    end: add(firstDayOfCalendar, { days: 6 }),
  }).map(day => formatDate(day, 'E'));

  const generatedEvents = useMemo(() => {
    const occurrences = new Map<string, CalendarEvent[]>();
    if (events.length === 0) return occurrences;
  
    days.forEach(day => {
      const dayKey = formatDate(day, 'yyyy-MM-dd');
      const dayEvents: CalendarEvent[] = [];
  
      events.forEach(event => {
        const eventStartDate = event.date;
        const exceptions = event.exceptions?.map(ts => ts.toDate()) || [];

        if (exceptions.some(exDate => isSameDay(day, exDate))) {
          return; // Skip this day for this event if it's an exception
        }
  
        if (isAfter(day, eventStartDate) || isSameDay(day, eventStartDate)) {
          const rule = event.recurrenceRule;
          let happensToday = false;
  
          if (!rule || rule.type === 'none') {
            if (isSameDay(day, eventStartDate)) {
              happensToday = true;
            }
          } else {
            switch (rule.type) {
              case 'daily':
                happensToday = true;
                break;
              case 'weekly':
                if (getDay(day) === getDay(eventStartDate)) {
                  happensToday = true;
                }
                break;
              case 'monthly':
                if (getDate(day) === getDate(eventStartDate)) {
                  happensToday = true;
                }
                break;
              case 'yearly':
                if (getMonth(day) === getMonth(eventStartDate) && getDate(day) === getDate(eventStartDate)) {
                  happensToday = true;
                }
                break;
              case 'custom':
                if (rule.days?.includes(getDay(day))) {
                  const weeksDiff = differenceInWeeks(day, eventStartDate, { weekStartsOn: settings.weekStartsOn });
                  if (weeksDiff % (rule.interval || 1) === 0) {
                    happensToday = true;
                  }
                }
                break;
            }
          }
  
          if (happensToday) {
            dayEvents.push({ ...event, date: day });
          }
        }
      });
      if (dayEvents.length > 0) {
        occurrences.set(dayKey, dayEvents.sort((a,b) => parseTime(a.time) - parseTime(b.time)));
      }
    });
  
    return occurrences;
  }, [events, days, settings.weekStartsOn]);

  const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));
  const prevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));
  const today = () => setCurrentMonth(new Date());

  const onAddSubmit = async (data: EventFormData) => {
    if (!user) return;
    const time = `${data.hour}:${data.minute} ${data.period}`;

    const recurrenceRule: RecurrenceRule = {
        type: data.recurrenceType,
        ...(data.recurrenceType === 'custom' && {
            interval: parseInt(data.recurrenceInterval || '1', 10),
            days: data.recurrenceDays
        })
    };

    await addDoc(collection(db, 'users', user.uid, 'events'), { ...data, time, recurrenceRule });
    addForm.reset({ title: '', date: new Date(), hour: '12', minute: '00', period: 'PM', color: 'blue', location: '', notes: '', recurrenceType: 'none', recurrenceInterval: "1", recurrenceDays: [] });
    setIsAddDialogOpen(false);
  };

  const onEditSubmit = async (data: EventFormData) => {
    if (!user || !selectedEvent) return;
    const time = `${data.hour}:${data.minute} ${data.period}`;
    const eventDocRef = doc(db, 'users', user.uid, 'events', selectedEvent.id);

    const recurrenceRule: RecurrenceRule = {
        type: data.recurrenceType,
        ...(data.recurrenceType === 'custom' && {
            interval: parseInt(data.recurrenceInterval || '1', 10),
            days: data.recurrenceDays
        })
    };

    await updateDoc(eventDocRef, { ...data, time, recurrenceRule });
    setIsEditDialogOpen(false);
    setSelectedEvent(null);
  };

  const onDeleteThisOccurrence = async () => {
    if (!user || !selectedEvent) return;
    const eventDocRef = doc(db, 'users', user.uid, 'events', selectedEvent.id);
    await updateDoc(eventDocRef, {
        exceptions: arrayUnion(Timestamp.fromDate(selectedEvent.date))
    });
    setIsDeleteConfirmOpen(false);
    setIsEditDialogOpen(false);
    setSelectedEvent(null);
  };

  const onDeleteAllOccurrences = async () => {
    if (!user || !selectedEvent) return;
    const eventDocRef = doc(db, 'users', user.uid, 'events', selectedEvent.id);
    await deleteDoc(eventDocRef);
    setIsDeleteConfirmOpen(false);
    setIsEditDialogOpen(false);
    setSelectedEvent(null);
  };

  const saveSettings = async (newSettings: CalendarSettings) => {
    if (!user) return;
    const userDocRef = doc(db, 'users', user.uid);
    await setDoc(userDocRef, { calendarSettings: newSettings }, { merge: true });
  }
  
  const handleSaveSettings = async (data: SettingsFormData) => {
      if (!user) return;
      await saveSettings({ ...settings, ...data });
      setIsSettingsOpen(false);
  };

  const handleImport = async (token?: string) => {
    if (!user) return;
    setIsImporting(true);

    try {
        let accessToken = token;
        if (!accessToken) {
            const provider = new GoogleAuthProvider();
            provider.addScope('https://www.googleapis.com/auth/calendar.readonly');
            provider.addScope('https://www.googleapis.com/auth/calendar.events.readonly');
            const result = await signInWithPopup(auth, provider);
            const credential = GoogleAuthProvider.credentialFromResult(result);
            accessToken = credential?.accessToken;
        }
        
        if (!accessToken) {
            throw new Error("Could not retrieve access token from Google.");
        }

        const calendarListResponse = await fetch('https://www.googleapis.com/calendar/v3/users/me/calendarList', {
            headers: { Authorization: `Bearer ${accessToken}` },
        });

        if (!calendarListResponse.ok) {
            const errorData = await calendarListResponse.json();
            console.error("Google Calendar API Error:", errorData);
            const errorMessage = errorData.error?.message || calendarListResponse.statusText;
            throw new Error(`Failed to fetch calendar list. Reason: ${errorMessage}. Ensure the Google Calendar API is enabled in your Google Cloud project.`);
        }
        const calendarListData = await calendarListResponse.json();
        const calendars = calendarListData.items;

        const allEventsPromises = calendars.map((calendar: any) => 
            fetch(`https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(calendar.id)}/events?maxResults=100`, {
                headers: { Authorization: `Bearer ${accessToken}` },
            }).then(res => res.json())
        );

        const allEventsResults = await Promise.all(allEventsPromises);
        const googleEvents = allEventsResults.flatMap(result => result.items || []);

        const eventsCollection = collection(db, 'users', user.uid, 'events');
        const existingGoogleEventIds = new Set(
            events.filter(e => e.googleEventId).map(e => e.googleEventId)
        );

        const batch = writeBatch(db);
        let importedCount = 0;

        googleEvents.forEach((gEvent: any) => {
            if (gEvent.status === 'cancelled' || !gEvent.id) return;
            if (!existingGoogleEventIds.has(gEvent.id)) {
                let eventDate: Date;
                let eventTime = "All Day";

                if (gEvent.start.dateTime) {
                    eventDate = parseISO(gEvent.start.dateTime);
                    eventTime = formatDate(eventDate, "h:mm a");
                } else if (gEvent.start.date) {
                    eventDate = parse(gEvent.start.date, 'yyyy-MM-dd', new Date());
                } else {
                    return;
                }

                const newEvent = {
                    title: gEvent.summary || "Untitled Event",
                    date: Timestamp.fromDate(eventDate),
                    time: eventTime,
                    color: "purple",
                    location: gEvent.location || "",
                    notes: gEvent.description || "",
                    recurrenceRule: { type: 'none' },
                    googleEventId: gEvent.id,
                };
                const newEventRef = doc(eventsCollection);
                batch.set(newEventRef, newEvent);
                importedCount++;
            }
        });

        if (importedCount > 0) {
            await batch.commit();
            toast({
                title: "Import Successful",
                description: `Successfully imported ${importedCount} new events.`,
            });
        } else {
             toast({
                title: "No New Events",
                description: "Your calendar is already up to date.",
            });
        }

    } catch (error: any) {
        console.error("Google Calendar import error:", error);
        toast({
            variant: "destructive",
            title: "Import Failed",
            description: error.message || "An error occurred during the import.",
        });
    } finally {
        setIsImporting(false);
    }
  };

  const handleConnectAndSync = async () => {
    if (!user) return;
    setIsConnecting(true);

    try {
        const provider = new GoogleAuthProvider();
        provider.addScope('https://www.googleapis.com/auth/calendar.readonly');
        provider.addScope('https://www.googleapis.com/auth/calendar.events.readonly');
        
        const result = await signInWithPopup(auth, provider);
        const credential = GoogleAuthProvider.credentialFromResult(result);
        
        await saveSettings({ ...settings, googleCalendar: { connected: true } });
        
        toast({
            title: "Success!",
            description: "Google Calendar connected. Importing your events now...",
        });

        await handleImport(credential?.accessToken);

    } catch (error: any) {
        console.error("Google Calendar connect error:", error);
        toast({
            variant: "destructive",
            title: "Connection Failed",
            description: error.message || "An error occurred while connecting. Check the browser console for details.",
        });
    } finally {
        setIsConnecting(false);
    }
  };

  const handleGoogleDisconnect = async () => {
    await saveSettings({ 
        ...settings, 
        googleCalendar: {
            connected: false,
        }
    });
  };

  const RecurrenceFields = ({ form }: { form: any }) => {
    const recurrenceType = form.watch('recurrenceType');
    
    if (recurrenceType !== 'custom') return null;

    const WeekdayButton = ({ day, index }: { day: string; index: number }) => {
        const days = form.watch('recurrenceDays') || [];
        const isSelected = days.includes(index);
        
        const toggleDay = () => {
            const currentDays = [...days];
            if (isSelected) {
                form.setValue('recurrenceDays', currentDays.filter(d => d !== index));
            } else {
                form.setValue('recurrenceDays', [...currentDays, index]);
            }
        };
        
        return (
            <Button
                type="button"
                variant={isSelected ? 'default' : 'outline'}
                onClick={toggleDay}
                className="h-8 w-8 p-0 rounded-full"
            >
                {day}
            </Button>
        );
    };

    return (
        <div className="p-4 border rounded-lg bg-secondary/50 space-y-4">
            <div className="flex items-center gap-2">
                <Label>Repeat every</Label>
                <FormField
                    control={form.control}
                    name="recurrenceInterval"
                    render={({ field }) => (
                        <Input {...field} type="number" min="1" className="w-20" />
                    )}
                />
                <Label>week(s) on:</Label>
            </div>
             <FormField
                control={form.control}
                name="recurrenceDays"
                render={() => (
                    <FormItem>
                         <div className="flex justify-around">
                            {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, index) => (
                                <WeekdayButton key={index} day={day} index={index} />
                            ))}
                        </div>
                        <FormMessage />
                    </FormItem>
                )}
            />
        </div>
    );
};
  
  const EventFormBody = ({form}: {form: any}) => (
    <div className="space-y-4">
        <div>
            <Label htmlFor="title">Event Title</Label>
            <Input id="title" {...form.register('title')} />
            {form.formState.errors.title && <p className="text-red-500 text-sm mt-1">{form.formState.errors.title.message}</p>}
        </div>
        <div className="grid grid-cols-2 gap-4">
            <div>
                <Label>Date</Label>
                <Controller name="date" control={form.control} render={({ field }) => (
                    <Popover>
                        <PopoverTrigger asChild>
                            <Button variant="outline" className="w-full justify-start text-left font-normal">
                                {field.value ? formatDate(field.value, 'PPP') : <span>Pick a date</span>}
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0"><CalendarIcon mode="single" selected={field.value} onSelect={field.onChange} initialFocus /></PopoverContent>
                    </Popover>
                )} />
                {form.formState.errors.date && <p className="text-red-500 text-sm mt-1">{form.formState.errors.date.message}</p>}
            </div>
            <div>
                <Label>Time</Label>
                <div className="grid grid-cols-3 gap-2">
                    <Controller name="hour" control={form.control} render={({ field }) => (
                        <Select onValueChange={field.onChange} value={field.value}>
                            <SelectTrigger><SelectValue placeholder="Hr" /></SelectTrigger>
                            <SelectContent>{hours.map(h => <SelectItem key={h} value={h}>{h}</SelectItem>)}</SelectContent>
                        </Select>
                    )} />
                    <Controller name="minute" control={form.control} render={({ field }) => (
                        <Select onValueChange={field.onChange} value={field.value}>
                            <SelectTrigger><SelectValue placeholder="Min" /></SelectTrigger>
                            <SelectContent>{minutes.map(m => <SelectItem key={m} value={m}>{m}</SelectItem>)}</SelectContent>
                        </Select>
                    )} />
                    <Controller name="period" control={form.control} render={({ field }) => (
                        <Select onValueChange={field.onChange} value={field.value}>
                            <SelectTrigger><SelectValue placeholder="AM/PM" /></SelectTrigger>
                            <SelectContent>{periods.map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}</SelectContent>
                        </Select>
                    )} />
                </div>
                {(form.formState.errors.hour || form.formState.errors.minute || form.formState.errors.period) && (
                    <p className="text-red-500 text-sm mt-1">
                        {form.formState.errors.hour?.message || form.formState.errors.minute?.message || form.formState.errors.period?.message}
                    </p>
                )}
            </div>
        </div>
        <div>
            <Label>Recurring</Label>
             <FormField
                control={form.control}
                name="recurrenceType"
                render={({ field }) => (
                    <FormItem>
                        <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                            <SelectContent>
                                <SelectItem value="none">Does not repeat</SelectItem>
                                <SelectItem value="daily">Daily</SelectItem>
                                <SelectItem value="weekly">Weekly</SelectItem>
                                <SelectItem value="monthly">Monthly</SelectItem>
                                <SelectItem value="yearly">Yearly</SelectItem>
                                <SelectItem value="custom">Custom...</SelectItem>
                            </SelectContent>
                        </Select>
                    </FormItem>
                )}
            />
        </div>
        <RecurrenceFields form={form} />
        <div>
            <Label htmlFor="color">Type</Label>
            <Controller name="color" control={form.control} render={({ field }) => (
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <SelectTrigger><SelectValue placeholder="Select a type" /></SelectTrigger>
                    <SelectContent>{colorOptions.map(opt => <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>)}</SelectContent>
                </Select>
            )} />
        </div>
        <div>
            <Label htmlFor="location">Location (Optional)</Label>
            <Input id="location" {...form.register('location')} placeholder="e.g. Library, Room 201" />
        </div>
        <div>
            <Label htmlFor="notes">Notes (Optional)</Label>
            <Textarea id="notes" {...form.register('notes')} placeholder="e.g. Bring textbook" />
        </div>
    </div>
  )

  return (
    <div className="w-full bg-background p-4 md:p-8">
        <ResponsiveGridLayout
            layouts={layouts}
            onLayoutChange={onLayoutChange}
            breakpoints={{ lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 }}
            cols={{ lg: 12, md: 10, sm: 6, xs: 4, xxs: 2 }}
            rowHeight={30}
            margin={[24, 24]}
            draggableHandle=".drag-handle"
        >
          <div key="calendar" className="grid-card-wrapper">
            <div className="drag-handle"></div>
            <Card className="shadow-lg rounded-2xl flex flex-col h-full">
              <CardHeader className="px-6 py-4 border-b">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                      <div>
                          <h1 className="font-headline text-3xl font-bold">Calendar</h1>
                          <p className="text-muted-foreground">Manage your due dates, exams, and extracurriculars.</p>
                      </div>
                      <div className="flex items-center gap-2">
                          <Button variant="outline" size="icon" onClick={prevMonth}><ChevronLeft /></Button>
                          <Button variant="outline" onClick={today} size="sm">Today</Button>
                          <Button variant="outline" size="icon" onClick={nextMonth}><ChevronRight /></Button>
                          <h2 className="text-xl font-semibold whitespace-nowrap w-32 text-center">{formatDate(currentMonth, 'MMMM yyyy')}</h2>
                      </div>
                  </div>
                  <div className="mt-4 flex justify-end items-center gap-2">
                      <Dialog open={isSettingsOpen} onOpenChange={setIsSettingsOpen}>
                        <DialogTrigger asChild>
                            <Button variant="outline" size="icon"><Settings className="h-5 w-5" /></Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Calendar Settings</DialogTitle>
                                <DialogDescription>Customize your calendar view. Settings are saved automatically.</DialogDescription>
                            </DialogHeader>
                            <Form {...settingsForm}>
                                <form onSubmit={settingsForm.handleSubmit(handleSaveSettings)} className="space-y-4 pt-2">
                                    <FormField
                                        control={settingsForm.control}
                                        name="weekStartsOn"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Week Starts On</FormLabel>
                                                <Select onValueChange={(val) => field.onChange(parseInt(val))} value={String(field.value)}>
                                                    <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                                                    <SelectContent>
                                                        <SelectItem value="0">Sunday</SelectItem>
                                                        <SelectItem value="1">Monday</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={settingsForm.control}
                                        name="dateFormat"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Date Format</FormLabel>
                                                <Select onValueChange={field.onChange} value={field.value}>
                                                    <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                                                    <SelectContent>
                                                        <SelectItem value="MMMM d, yyyy">Month D, YYYY (e.g., June 25, 2025)</SelectItem>
                                                        <SelectItem value="MM/dd/yyyy">MM/DD/YYYY (e.g., 06/25/2025)</SelectItem>
                                                        <SelectItem value="dd/MM/yyyy">DD/MM/YYYY (e.g., 25/06/2025)</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </FormItem>
                                        )}
                                    />
                                     <FormField
                                        control={settingsForm.control}
                                        name="timezone"
                                        render={({ field }) => (
                                            <FormItem className="flex flex-col">
                                                <FormLabel>Timezone</FormLabel>
                                                <TimezoneSelect
                                                    value={field.value}
                                                    onChange={field.onChange}
                                                />
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <DialogFooter>
                                        <Button type="submit">Save & Close</Button>
                                    </DialogFooter>
                                </form>
                            </Form>
                            <Separator className="my-4" />
                            <div className="space-y-4">
                                <div>
                                    <h3 className="text-base font-semibold leading-none">Integrations</h3>
                                    <p className="text-sm text-muted-foreground">Sync events from your favorite calendars.</p>
                                </div>
                                <div className="space-y-3 pt-2">
                                    <div className="relative">
                                        <Button className="w-full justify-start pl-4" variant="outline" disabled>
                                            <GoogleIcon className="mr-3 h-5 w-5" />
                                            Connect with Google
                                        </Button>
                                        <Badge variant="outline" className="absolute top-1/2 right-3 -translate-y-1/2 pointer-events-none font-semibold">
                                            Coming Soon
                                        </Badge>
                                    </div>
                                    <div className="relative">
                                        <Button className="w-full justify-start pl-4" variant="outline" disabled>
                                            <FaApple className="mr-3 h-5 w-5" />
                                            Connect with Apple
                                        </Button>
                                        <Badge variant="outline" className="absolute top-1/2 right-3 -translate-y-1/2 pointer-events-none font-semibold">
                                            Coming Soon
                                        </Badge>
                                    </div>
                                    <div className="relative">
                                        <Button className="w-full justify-start pl-4" variant="outline" disabled>
                                            <SiCanvas className="mr-3 h-5 w-5" />
                                            Connect with Canvas
                                        </Button>
                                        <Badge variant="outline" className="absolute top-1/2 right-3 -translate-y-1/2 pointer-events-none font-semibold">
                                            Coming Soon
                                        </Badge>
                                    </div>
                                </div>
                            </div>
                        </DialogContent>
                      </Dialog>
                      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                          <DialogTrigger asChild>
                              <Button><PlusCircle className="mr-2 h-5 w-5" /> Add Event</Button>
                          </DialogTrigger>
                          <DialogContent>
                              <DialogHeader>
                              <DialogTitle>Add a New Event</DialogTitle>
                              <DialogDescription>Fill out the details for your new calendar event.</DialogDescription>
                              </DialogHeader>
                              <Form {...addForm}>
                                <form onSubmit={addForm.handleSubmit(onAddSubmit)} className="space-y-4">
                                  <EventFormBody form={addForm} />
                                  <DialogFooter>
                                      <DialogClose asChild><Button type="button" variant="ghost">Cancel</Button></DialogClose>
                                      <Button type="submit">Save Event</Button>
                                  </DialogFooter>
                                </form>
                              </Form>
                          </DialogContent>
                      </Dialog>
                  </div>
              </CardHeader>
              
              <CardContent className="flex-1 p-0 flex flex-col min-h-0">
                <div className="grid grid-cols-7 border-b">
                  {weekdays.map((day) => (
                    <div
                      key={day}
                      className="text-center font-bold py-2 text-sm text-muted-foreground border-r last:border-r-0"
                    >
                      {day}
                    </div>
                  ))}
                </div>
                <div className="flex-1 overflow-y-auto">
                    <div className="grid grid-cols-7">
                      {days.map((day) => {
                        const dayEvents = generatedEvents.get(formatDate(day, 'yyyy-MM-dd')) || [];
                        return (
                          <div
                            key={day.toString()}
                            className={cn(
                              "border-b border-r p-2 flex flex-col relative min-h-32",
                              !isSameMonth(day, currentMonth) && "bg-secondary/30 text-muted-foreground/70",
                              "last:border-b-0",
                              "[&:nth-child(7n)]:border-r-0"
                            )}
                          >
                            <span
                              className={cn(
                                "font-semibold text-base self-start h-8 w-8 flex items-center justify-start mb-2",
                                isToday(day) && "bg-primary text-primary-foreground rounded-full justify-center"
                              )}
                            >
                              {formatDate(day, 'd')}
                            </span>
                            <div className="flex-grow space-y-1 overflow-y-auto -mx-1 px-1">
                              {dayEvents.map((event) => (
                                <div
                                  key={event.id}
                                  onClick={() => setSelectedEvent(event)}
                                  className={cn(
                                    "text-xs text-white p-1 rounded-md cursor-pointer hover:opacity-80 flex flex-col gap-1 shadow-sm truncate",
                                    colorMap[event.color].bg
                                  )}
                                >
                                  <div className="flex items-center justify-between">
                                    <span className="font-semibold truncate flex-1">{event.title}</span>
                                    <span className="opacity-90 whitespace-nowrap ml-1">{event.time}</span>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                </div>
              </CardContent>
              <CardFooter className="p-4 border-t flex flex-wrap gap-x-4 gap-y-2 text-xs">
                  {Object.entries(colorMap).map(([color, { name, bg }]) => (
                      <div key={color} className="flex items-center gap-2">
                          <span className={cn("h-2.5 w-2.5 rounded-full", bg)}></span>
                          <span className="text-muted-foreground">{name}</span>
                      </div>
                  ))}
              </CardFooter>
            </Card>
          </div>
          <div key="eventOverview" className="grid-card-wrapper">
              <div className="drag-handle"></div>
                {selectedEvent ? (
                     <Card className="shadow-lg rounded-2xl h-full flex flex-col">
                        <CardHeader>
                            <div className="flex items-start gap-4">
                                <span className={cn("mt-1.5 h-3 w-3 rounded-full shrink-0", colorMap[selectedEvent.color].bg)}></span>
                                <div className="flex-1">
                                    <CardTitle>{selectedEvent.title}</CardTitle>
                                    <CardDescription>{formatDate(selectedEvent.date, `EEEE, ${settings.dateFormat}`)} at {selectedEvent.time}</CardDescription>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-4 flex-grow">
                            <div className="flex items-start gap-3">
                                <Tag className="h-5 w-5 text-muted-foreground mt-0.5" />
                                <div>
                                    <p className="font-semibold">Type</p>
                                    <p className="text-muted-foreground">{colorMap[selectedEvent.color].name}</p>
                                </div>
                            </div>
                            {selectedEvent.location && (
                                <div className="flex items-start gap-3">
                                    <MapPin className="h-5 w-5 text-muted-foreground mt-0.5" />
                                    <div>
                                        <p className="font-semibold">Location</p>
                                        <p className="text-muted-foreground">{selectedEvent.location}</p>
                                    </div>
                                </div>
                            )}
                            {selectedEvent.notes && (
                                <div className="flex items-start gap-3">
                                    <NotebookText className="h-5 w-5 text-muted-foreground mt-0.5" />
                                    <div>
                                        <p className="font-semibold">Notes</p>
                                        <p className="text-muted-foreground whitespace-pre-wrap">{selectedEvent.notes}</p>
                                    </div>
                                </div>
                            )}
                        </CardContent>
                        <CardFooter className="justify-end">
                             <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
                                <DialogTrigger asChild>
                                    <Button>
                                        <Edit className="mr-2 h-4 w-4" /> Edit Event
                                    </Button>
                                </DialogTrigger>
                                <DialogContent>
                                    <DialogHeader>
                                        <DialogTitle>Edit Event</DialogTitle>
                                        <DialogDescription>Make changes to your event. Click save when you're done.</DialogDescription>
                                    </DialogHeader>
                                    {selectedEvent && (
                                        <Form {...editForm}>
                                            <form onSubmit={editForm.handleSubmit(onEditSubmit)} className="space-y-4 pt-2">
                                                <EventFormBody form={editForm} />
                                                <DialogFooter className="flex-col-reverse sm:flex-row sm:justify-between w-full pt-4">
                                                     <AlertDialog open={isDeleteConfirmOpen} onOpenChange={setIsDeleteConfirmOpen}>
                                                        <AlertDialogTrigger asChild>
                                                            <Button type="button" variant="destructive">Delete Event</Button>
                                                        </AlertDialogTrigger>
                                                        <AlertDialogContent>
                                                            {selectedEvent?.recurrenceRule && selectedEvent.recurrenceRule.type !== 'none' ? (
                                                                <>
                                                                    <AlertDialogHeader>
                                                                        <AlertDialogTitle>Delete Recurring Event</AlertDialogTitle>
                                                                        <AlertDialogDescription>
                                                                            Do you want to delete only this instance or the entire series?
                                                                        </AlertDialogDescription>
                                                                    </AlertDialogHeader>
                                                                    <AlertDialogFooter className="sm:justify-start gap-2 pt-2">
                                                                        <AlertDialogAction onClick={onDeleteThisOccurrence} className={buttonVariants({ variant: "destructive" })}>Delete This Event Only</AlertDialogAction>
                                                                        <AlertDialogAction onClick={onDeleteAllOccurrences} className={buttonVariants({ variant: "destructive" })}>Delete All Future Events</AlertDialogAction>
                                                                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                                    </AlertDialogFooter>
                                                                </>
                                                            ) : (
                                                                <>
                                                                    <AlertDialogHeader>
                                                                        <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                                                                        <AlertDialogDescription>
                                                                            This action cannot be undone. This will permanently delete this event.
                                                                        </AlertDialogDescription>
                                                                    </AlertDialogHeader>
                                                                    <AlertDialogFooter>
                                                                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                                        <AlertDialogAction onClick={onDeleteAllOccurrences} className={buttonVariants({ variant: "destructive" })}>Delete</AlertDialogAction>
                                                                    </AlertDialogFooter>
                                                                </>
                                                            )}
                                                        </AlertDialogContent>
                                                    </AlertDialog>
                                                    <div className="flex gap-2 justify-end">
                                                        <DialogClose asChild><Button type="button" variant="ghost">Cancel</Button></DialogClose>
                                                        <Button type="submit">Save Changes</Button>
                                                    </div>
                                                </DialogFooter>
                                            </form>
                                        </Form>
                                    )}
                                </DialogContent>
                             </Dialog>
                        </CardFooter>
                     </Card>
                ) : (
                    <Card className="shadow-lg rounded-2xl h-full">
                        <CardContent className="p-8 text-center text-muted-foreground flex flex-col items-center justify-center h-full">
                            <CalendarDays className="mx-auto h-12 w-12 opacity-50" />
                            <p className="mt-4 font-semibold text-lg">No Event Selected</p>
                            <p className="text-sm mt-1">Click on an event in the calendar to see its details.</p>
                        </CardContent>
                    </Card>
                )}
            </div>
        </ResponsiveGridLayout>
    </div>
  );
}
