
'use client';

import React, { useCallback, useRef } from 'react';
import { Responsive, WidthProvider } from 'react-grid-layout';
import 'react-grid-layout/css/styles.css';
import { DashboardHeader } from "./DashboardHeader";
import { ClassProgress } from "./ClassProgress";
import { Schedule } from "./Schedule";
import { TodoList } from "./TodoList";
import { DailyGoals } from "./DailyGoals";
import { QuickTools } from "./QuickTools";
import { FocusZone } from "./FocusZone";
import { useAuth } from '@/contexts/AuthContext';
import { db } from '@/lib/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { Loader2 } from 'lucide-react';
import './dashboard.css';

const ResponsiveGridLayout = WidthProvider(Responsive);

const componentMap = {
    classProgress: ClassProgress,
    schedule: Schedule,
    todoList: TodoList,
    dailyGoals: DailyGoals,
    quickTools: QuickTools,
    focusZone: FocusZone,
};

type LayoutItem = { i: string; x: number; y: number; w: number; h: number; minW?: number, minH?: number, maxW?: number, maxH?: number };
type Layouts = { [key: string]: LayoutItem[] };

const defaultLayouts: Layouts = {
  lg: [
    // Left column
    { i: 'classProgress', x: 0, y: 0, w: 8, h: 12, minW: 4, minH: 8 },
    { i: 'schedule',      x: 0, y: 12, w: 8, h: 12, minW: 4, minH: 8 },
    // Right column
    { i: 'todoList',    x: 8, y: 0, w: 4, h: 8, minW: 3, minH: 6 },
    { i: 'dailyGoals',  x: 8, y: 8, w: 4, h: 8, minW: 3, minH: 6 },
    { i: 'focusZone',   x: 8, y: 16, w: 4, h: 8, minW: 3, minH: 6 },
    { i: 'quickTools',  x: 8, y: 24, w: 4, h: 5, minW: 3, minH: 4 },
  ],
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


export default function DashboardPage() {
    const { user } = useAuth();
    const [layouts, setLayouts] = React.useState<Layouts>(defaultLayouts);
    const [isLayoutInitialized, setIsLayoutInitialized] = React.useState(false);
    const debounceTimer = useRef<NodeJS.Timeout | null>(null);

    React.useEffect(() => {
        if (user) {
            const layoutDocRef = doc(db, 'users', user.uid);
            getDoc(layoutDocRef).then(docSnap => {
                if (docSnap.exists() && docSnap.data().dashboardLayouts) {
                    const savedLayouts = docSnap.data().dashboardLayouts;
                    const defaultKeys = defaultLayouts.lg.map(item => item.i);
                    const savedKeys = savedLayouts.lg?.map((item: LayoutItem) => item.i) || [];
                    const allKeysPresent = defaultKeys.every(key => savedKeys.includes(key));

                    if(savedLayouts.lg && savedKeys.length === defaultKeys.length && allKeysPresent) {
                        setLayouts(savedLayouts);
                    }
                }
                setIsLayoutInitialized(true);
            });
        } else {
            setIsLayoutInitialized(true);
        }
    }, [user]);

    const handleLayoutChange = useCallback((layout: LayoutItem[], allLayouts: Layouts) => {
        if (!isLayoutInitialized || !user) return;

        const cleanedLayouts = cleanAllLayouts(allLayouts);
        setLayouts(cleanedLayouts);
        
        if (debounceTimer.current) {
            clearTimeout(debounceTimer.current);
        }

        debounceTimer.current = setTimeout(() => {
            if (user) {
                const layoutDocRef = doc(db, 'users', user.uid);
                setDoc(layoutDocRef, { dashboardLayouts: cleanedLayouts }, { merge: true });
            }
        }, 500);
    }, [isLayoutInitialized, user]);
    
    if (!isLayoutInitialized) {
        return (
            <div className="flex h-[calc(100vh-8rem)] items-center justify-center">
                <Loader2 className="h-12 w-12 animate-spin text-primary" />
            </div>
        );
    }

  return (
    <div className="flex flex-col p-4 md:p-8">
      <DashboardHeader />
      <ResponsiveGridLayout
        layouts={layouts}
        onLayoutChange={handleLayoutChange}
        breakpoints={{ lg: 1200, md: 1000, sm: 768, xs: 480, xxs: 0 }}
        cols={{ lg: 12, md: 12, sm: 6, xs: 4, xxs: 2 }}
        rowHeight={30}
        margin={[24, 24]}
        containerPadding={[0, 0]}
        draggableHandle=".drag-handle"
      >
        {layouts.lg.map((item) => {
            const Component = componentMap[item.i as keyof typeof componentMap];
            return (
                <div key={item.i} className="grid-card-wrapper bg-card rounded-lg border shadow-sm">
                    <div className="drag-handle"></div>
                    <Component />
                </div>
            );
        })}
      </ResponsiveGridLayout>
    </div>
  );
}
