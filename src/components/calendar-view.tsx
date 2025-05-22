import React, { useState } from 'react';
import { format } from 'date-fns';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  CalendarWeek,
  CalendarConfig,
  getColorForStatus,
  getTextColorForStatus,
  getStatusDisplayText,
  getLegendItems
} from '@/lib/calendar-utils';
import { exportToExcel } from '@/lib/excel-utils';

interface CalendarViewProps {
  calendarWeeks: CalendarWeek[];
  config: CalendarConfig;
  onNewCalendar: () => void;
}

export function CalendarView({ calendarWeeks, config, onNewCalendar }: CalendarViewProps) {
  const [visibleWeeks, setVisibleWeeks] = useState<number>(52); // Default to showing all weeks

  const handleExport = async () => {
    try {
      await exportToExcel(calendarWeeks, config);
    } catch (error) {
      console.error('Error exporting to Excel:', error);
      alert('Failed to export calendar. Please try again.');
    }
  };

  // Split the calendar into semesters for easier navigation
  const firstSemesterWeeks = calendarWeeks.slice(0, 26); // First half of the year
  const secondSemesterWeeks = calendarWeeks.slice(26, 52); // Second half of the year

  // Show only the number of weeks selected
  const filteredWeeks = calendarWeeks.slice(0, visibleWeeks);

  return (
    <div className="w-full space-y-6">
      <Card className="border-blue-200">
        <CardHeader className="pb-2">
          <CardTitle className="text-2xl font-bold text-center">
            Academic Calendar for {config.academicYear}
          </CardTitle>
          <CardDescription className="text-center">
            {config.faculty}, {config.university}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row justify-between items-center mb-4 gap-4">
            <div className="flex items-center space-x-4">
              <div className="text-sm flex items-center gap-2">
                <span className="font-semibold">Show weeks:</span>
                <select
                  value={visibleWeeks}
                  onChange={(e) => setVisibleWeeks(parseInt(e.target.value))}
                  className="border rounded px-2 py-1 text-sm"
                >
                  <option value="13">First Quarter</option>
                  <option value="26">First Semester</option>
                  <option value="39">Third Quarter</option>
                  <option value="52">Full Year</option>
                </select>
              </div>

              <div className="text-sm">
                <span className="font-semibold">Total Weeks:</span> {calendarWeeks.length}
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Button onClick={onNewCalendar} variant="outline" size="sm">
                Create New Calendar
              </Button>
              <Button onClick={handleExport} size="sm">
                Export to Excel
              </Button>
            </div>
          </div>

          <div className="overflow-x-auto border rounded-lg">
            <Table className="border-collapse">
              <TableHeader>
                <TableRow className="bg-gray-100">
                  <TableHead className="w-24 font-bold border text-center">Year</TableHead>
                  <TableHead className="w-32 font-bold border text-center">Dates</TableHead>
                  <TableHead className="w-20 font-bold border text-center">Week</TableHead>
                  {config.batches.map((batch, index) => (
                    <TableHead key={index} className="w-28 font-bold border text-center">
                      {batch}
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredWeeks.map((week, index) => (
                  <TableRow key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                    <TableCell className="border text-center font-medium text-sm py-2">
                      {format(week.startDate, 'yyyy')}
                    </TableCell>
                    <TableCell className="border text-center text-sm py-2">
                      {format(week.startDate, 'd-MMM')} to {format(week.endDate, 'd-MMM')}
                    </TableCell>
                    <TableCell className="border text-center font-medium text-sm py-2">
                      {week.weekNumber}
                    </TableCell>

                    {config.batches.map((batch, batchIndex) => {
                      const status = week.status[batch];
                      const statusText = getStatusDisplayText(status);
                      const bgColor = getColorForStatus(status);
                      const textColor = getTextColorForStatus(status);

                      return (
                        <TableCell
                          key={batchIndex}
                          className="border text-center text-sm py-1 px-1"
                          style={{
                            backgroundColor: bgColor,
                            color: textColor,
                            fontWeight: textColor === '#ffffff' ? 'normal' : 'normal'
                          }}
                        >
                          {statusText}
                        </TableCell>
                      );
                    })}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          <div className="mt-6 px-2">
            <h3 className="text-lg font-bold mb-3">Legend</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {getLegendItems().map((item, index) => (
                <div key={index} className="flex items-center text-sm">
                  <div
                    className="w-5 h-5 mr-2 border border-gray-300"
                    style={{ backgroundColor: item.color }}
                  ></div>
                  <span>{item.label}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-6 text-sm text-gray-500 text-center">
            <p>
              This calendar was generated on {format(new Date(), 'dd MMMM yyyy')} using the Academic Calendar Generator.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
