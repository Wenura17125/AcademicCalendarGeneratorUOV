import { addWeeks, addDays, format, parse, getWeek, getYear } from 'date-fns';

export interface SemesterConfig {
  startDate: Date;
  weeksCount: number;
  includeOrientation: boolean;
  deadWeeks: number;
  examWeeks: number;
  vacationWeeks: number;
}

export interface CalendarConfig {
  academicYear: string;   // e.g., "2025-2026"
  faculty: string;        // e.g., "Faculty of Applied Science"
  university: string;     // e.g., "University of Vavuniya"
  batches: string[];      // e.g., ["FAS/20", "FAS/21", "FAS/22", "FAS/23"]
  firstSemester: SemesterConfig;
  secondSemester: SemesterConfig;
  includeIndustrialTraining: boolean;
  graduationDate?: Date;
}

export interface CalendarWeek {
  weekNumber: number;
  startDate: Date;
  endDate: Date;
  label: string;
  status: {
    [batchKey: string]: WeekStatus;
  }
}

export type WeekStatus =
  | { type: 'lecture'; semesterNumber: number; weekNumber: number }
  | { type: 'orientation' }
  | { type: 'deadWeek'; label: 'DW' }
  | { type: 'exam'; label: 'EX' }
  | { type: 'examEnd'; label: 'EX-END' }
  | { type: 'vacation'; label: 'Vaca.' }
  | { type: 'industrialTraining'; label: 'IT'; weekNumber: number }
  | { type: 'graduation'; label: string };

export function generateCalendarWeeks(config: CalendarConfig): CalendarWeek[] {
  const weeks: CalendarWeek[] = [];
  const firstSemStartDate = config.firstSemester.startDate;

  // Start the academic year from the first semester start date
  let currentDate = firstSemStartDate;
  const totalWeeks = 52; // Full year

  for (let weekIdx = 1; weekIdx <= totalWeeks; weekIdx++) {
    const weekStartDate = currentDate;
    const weekEndDate = addDays(weekStartDate, 4); // Monday to Friday

    const week: CalendarWeek = {
      weekNumber: weekIdx,
      startDate: weekStartDate,
      endDate: weekEndDate,
      label: `${format(weekStartDate, 'd-MMM')} to ${format(weekEndDate, 'd-MMM')}`,
      status: {}
    };

    // Determine the status for each batch in this week
    for (const batchKey of config.batches) {
      week.status[batchKey] = determineWeekStatus(weekIdx, weekStartDate, config, batchKey);
    }

    weeks.push(week);
    currentDate = addWeeks(currentDate, 1);
  }

  return weeks;
}

function determineWeekStatus(
  weekIdx: number,
  weekStartDate: Date,
  config: CalendarConfig,
  batchKey: string
): WeekStatus {
  const firstSemConfig = config.firstSemester;
  const secondSemConfig = config.secondSemester;

  // First semester period
  const firstSemEndWeek = firstSemConfig.weeksCount +
    firstSemConfig.deadWeeks +
    firstSemConfig.examWeeks +
    firstSemConfig.vacationWeeks;

  // First semester lecture weeks
  if (weekIdx <= firstSemConfig.weeksCount) {
    return {
      type: 'lecture',
      semesterNumber: 1,
      weekNumber: weekIdx
    };
  }

  // First semester dead weeks
  if (weekIdx > firstSemConfig.weeksCount &&
      weekIdx <= firstSemConfig.weeksCount + firstSemConfig.deadWeeks) {
    return { type: 'deadWeek', label: 'DW' };
  }

  // First semester exam weeks
  if (weekIdx > firstSemConfig.weeksCount + firstSemConfig.deadWeeks &&
      weekIdx <= firstSemConfig.weeksCount + firstSemConfig.deadWeeks + firstSemConfig.examWeeks) {
    return { type: 'exam', label: 'EX' };
  }

  // Last week of first semester exams
  if (weekIdx === firstSemConfig.weeksCount + firstSemConfig.deadWeeks + firstSemConfig.examWeeks) {
    // For graduating batches, mark as final exam
    if (batchKey === config.batches[0]) {
      return { type: 'examEnd', label: 'EX-END' };
    }
    return { type: 'exam', label: 'EX' };
  }

  // First semester vacation weeks
  if (weekIdx > firstSemConfig.weeksCount + firstSemConfig.deadWeeks + firstSemConfig.examWeeks &&
      weekIdx <= firstSemEndWeek) {
    return { type: 'vacation', label: 'Vaca.' };
  }

  // Second semester starts right after vacation
  const secondSemStartWeek = firstSemEndWeek + 1;

  // Orientation week for new batches
  if (weekIdx === secondSemStartWeek &&
      batchKey === config.batches[config.batches.length - 1] &&
      secondSemConfig.includeOrientation) {
    return { type: 'orientation' };
  }

  // Second semester lecture weeks
  const secondSemLectureEndWeek = secondSemStartWeek + secondSemConfig.weeksCount - 1;
  if (weekIdx >= secondSemStartWeek && weekIdx <= secondSemLectureEndWeek) {
    // For the first batch (oldest students), this might be industrial training
    if (batchKey === config.batches[0] && config.includeIndustrialTraining) {
      return {
        type: 'industrialTraining',
        label: 'IT',
        weekNumber: weekIdx - secondSemStartWeek + 1
      };
    }

    return {
      type: 'lecture',
      semesterNumber: 2,
      weekNumber: weekIdx - secondSemStartWeek + 1
    };
  }

  // Second semester dead weeks
  const secondSemDeadWeekEnd = secondSemLectureEndWeek + secondSemConfig.deadWeeks;
  if (weekIdx > secondSemLectureEndWeek && weekIdx <= secondSemDeadWeekEnd) {
    return { type: 'deadWeek', label: 'DW' };
  }

  // Second semester exam weeks
  const secondSemExamWeekEnd = secondSemDeadWeekEnd + secondSemConfig.examWeeks;
  if (weekIdx > secondSemDeadWeekEnd && weekIdx <= secondSemExamWeekEnd) {
    return { type: 'exam', label: 'EX' };
  }

  // Last week of second semester exams
  if (weekIdx === secondSemExamWeekEnd) {
    if (batchKey === config.batches[0]) {
      return { type: 'examEnd', label: 'EX-END' };
    }
    return { type: 'exam', label: 'EX' };
  }

  // Check for graduation
  if (config.graduationDate &&
      batchKey === config.batches[0] &&
      weekStartDate <= config.graduationDate &&
      config.graduationDate <= addDays(weekStartDate, 6)) {
    return { type: 'graduation', label: 'Graduation' };
  }

  // Default to vacation for remaining weeks
  return { type: 'vacation', label: 'Vaca.' };
}

export function formatDateForDisplay(date: Date): string {
  return format(date, 'dd-MMM-yyyy');
}

export function getWeekDisplay(startDate: Date, endDate: Date): string {
  return `${format(startDate, 'd-MMM')} to ${format(endDate, 'd-MMM')}`;
}

export function getColorForStatus(status: WeekStatus): string {
  switch (status.type) {
    case 'lecture':
      return '#ffffff'; // White
    case 'orientation':
      return '#ffff00'; // Yellow
    case 'deadWeek':
      return '#ff6600'; // Orange
    case 'exam':
      return '#3366ff'; // Blue
    case 'examEnd':
      return '#ff0000'; // Red
    case 'vacation':
      return '#ccffcc'; // Light Green
    case 'industrialTraining':
      return '#b2a1c7'; // Purple
    case 'graduation':
      return '#ff00ff'; // Pink
    default:
      return '#ffffff'; // White
  }
}

export function getTextColorForStatus(status: WeekStatus): string {
  switch (status.type) {
    case 'exam':
    case 'examEnd':
      return '#ffffff'; // White text on dark backgrounds
    default:
      return '#000000'; // Black text on light backgrounds
  }
}

export function getStatusDisplayText(status: WeekStatus): string {
  switch (status.type) {
    case 'lecture':
      return `L${status.semesterNumber}, S${status.semesterNumber} - ${status.weekNumber}`;
    case 'orientation':
      return 'Orientation';
    case 'deadWeek':
    case 'exam':
    case 'examEnd':
    case 'vacation':
      return status.label;
    case 'industrialTraining':
      return `IT - ${status.weekNumber}`;
    case 'graduation':
      return status.label;
    default:
      return '';
  }
}

export function getLegendItems() {
  return [
    { label: 'Lecture', color: '#ffffff' },
    { label: 'Orientation Program', color: '#ffff00' },
    { label: 'Dead Week', color: '#ff6600' },
    { label: 'End Semester Examination', color: '#3366ff' },
    { label: 'Final Exam Ending Week', color: '#ff0000' },
    { label: 'Vacation', color: '#ccffcc' },
    { label: 'Industrial Training', color: '#b2a1c7' },
    { label: 'Graduation', color: '#ff00ff' },
  ];
}

export function getDefaultCalendarConfig(): CalendarConfig {
  const currentYear = new Date().getFullYear();
  const academicYearStart = currentYear;
  const academicYearEnd = currentYear + 1;

  return {
    academicYear: `${academicYearStart}-${academicYearEnd}`,
    faculty: "Faculty of Applied Science",
    university: "University of Vavuniya",
    batches: [
      `FAS/${academicYearStart - 4}`,
      `FAS/${academicYearStart - 3}`,
      `FAS/${academicYearStart - 2}`,
      `FAS/${academicYearStart - 1}`,
      `FAS/${academicYearStart}`
    ],
    firstSemester: {
      startDate: new Date(academicYearStart, 7, 15), // August 15th
      weeksCount: 15,
      includeOrientation: true,
      deadWeeks: 1,
      examWeeks: 3,
      vacationWeeks: 3
    },
    secondSemester: {
      startDate: new Date(academicYearStart + 1, 0, 15), // January 15th
      weeksCount: 15,
      includeOrientation: false,
      deadWeeks: 1,
      examWeeks: 3,
      vacationWeeks: 3
    },
    includeIndustrialTraining: true,
    graduationDate: new Date(academicYearStart + 1, 5, 15) // June 15th of the next year
  };
}
