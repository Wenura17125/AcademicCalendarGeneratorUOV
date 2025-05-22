"use client";

import { useState } from 'react';
import { CalendarConfig, CalendarWeek, generateCalendarWeeks } from '@/lib/calendar-utils';
import { CalendarForm } from '@/components/calendar-form';
import { CalendarView } from '@/components/calendar-view';
import { Footer } from '@/components/footer';
import { Skeleton } from '@/components/ui/skeleton';
import { Toaster } from 'sonner';

export default function Home() {
  const [calendarWeeks, setCalendarWeeks] = useState<CalendarWeek[] | null>(null);
  const [config, setConfig] = useState<CalendarConfig | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const handleSubmit = (formConfig: CalendarConfig) => {
    setIsGenerating(true);

    try {
      // Generate calendar weeks
      const weeks = generateCalendarWeeks(formConfig);

      setCalendarWeeks(weeks);
      setConfig(formConfig);
    } catch (error) {
      console.error('Error generating calendar:', error);
      alert('Failed to generate calendar. Please check your inputs and try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleNewCalendar = () => {
    setCalendarWeeks(null);
    setConfig(null);
  };

  return (
    <main className="flex min-h-screen flex-col items-center p-4 md:p-12">
      <div className="w-full max-w-7xl mx-auto mb-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold mb-4">Academic Calendar Generator</h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Create detailed academic calendars for your institution by entering the semester start date and
            number of weeks. Generate calendars for different years and faculties.
          </p>
        </div>

        {isGenerating ? (
          <div className="space-y-4 w-full">
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-96 w-full" />
          </div>
        ) : calendarWeeks && config ? (
          <CalendarView
            calendarWeeks={calendarWeeks}
            config={config}
            onNewCalendar={handleNewCalendar}
          />
        ) : (
          <CalendarForm onSubmit={handleSubmit} />
        )}
      </div>
      <Footer />
      <Toaster position="bottom-right" />
    </main>
  );
}
