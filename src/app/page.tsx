import {
  SidebarProvider,
  SidebarInset,
} from '@/components/ui/sidebar';
import AppSidebar from '@/components/app-sidebar';
import Header from '@/components/dashboard/header';
import ScheduleCard from '@/components/dashboard/schedule-card';
import CourseProgress from '@/components/dashboard/course-progress';
import TodoList from '@/components/dashboard/todo-list';
import DailyGoals from '@/components/dashboard/daily-goals';
import QuickLaunch from '@/components/dashboard/quick-launch';
import FocusZone from '@/components/dashboard/focus-zone';

export default function Home() {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <div className="p-4 sm:p-6 lg:p-8 flex flex-col min-h-svh">
          <Header />
          <main className="flex-1 grid grid-cols-12 gap-6 mt-6">
            <div className="col-span-12 xl:col-span-8 flex flex-col gap-6">
              <ScheduleCard />
              <CourseProgress />
            </div>
            <div className="col-span-12 xl:col-span-4 flex flex-col gap-6">
              <TodoList />
              <DailyGoals />
            </div>
            <div className="col-span-12 lg:col-span-6">
              <QuickLaunch />
            </div>
            <div className="col-span-12 lg:col-span-6">
              <FocusZone />
            </div>
          </main>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
