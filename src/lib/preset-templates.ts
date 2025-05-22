// Preset templates for different university calendar types
import { CalendarConfig } from './calendar-utils';

export interface TemplateInfo {
  id: string;
  name: string;
  description: string;
  config: CalendarConfig;
}

export const getPresetTemplates = (currentYear: number): TemplateInfo[] => {
  const nextYear = currentYear + 1;

  return [
    {
      id: 'vavuniya-applied-science',
      name: 'Vavuniya University - Applied Science',
      description: 'Academic calendar based on University of Vavuniya Faculty of Applied Science 2-semester format with industrial training for final year students.',
      config: {
        academicYear: `${currentYear}-${nextYear}`,
        faculty: 'Faculty of Applied Science',
        university: 'University of Vavuniya',
        batches: [
          `FAS/${currentYear - 4}`,
          `FAS/${currentYear - 3}`,
          `FAS/${currentYear - 2}`,
          `FAS/${currentYear - 1}`,
          `FAS/${currentYear}`
        ],
        firstSemester: {
          startDate: new Date(currentYear, 7, 15), // August 15th
          weeksCount: 15,
          includeOrientation: true,
          deadWeeks: 1,
          examWeeks: 3,
          vacationWeeks: 3
        },
        secondSemester: {
          startDate: new Date(nextYear, 0, 15), // January 15th
          weeksCount: 15,
          includeOrientation: false,
          deadWeeks: 1,
          examWeeks: 3,
          vacationWeeks: 3
        },
        includeIndustrialTraining: true,
        graduationDate: new Date(nextYear, 5, 15) // June 15th
      }
    },
    {
      id: 'uk-standard',
      name: 'UK University Standard',
      description: 'Standard UK academic calendar with 3 terms (autumn, spring, summer) and typical exam and break periods.',
      config: {
        academicYear: `${currentYear}-${nextYear}`,
        faculty: 'Faculty of Science',
        university: 'UK University',
        batches: [
          `Year ${4}`,
          `Year ${3}`,
          `Year ${2}`,
          `Year ${1}`
        ],
        firstSemester: {
          startDate: new Date(currentYear, 8, 21), // September 21st
          weeksCount: 12,
          includeOrientation: true,
          deadWeeks: 1,
          examWeeks: 2,
          vacationWeeks: 3
        },
        secondSemester: {
          startDate: new Date(nextYear, 0, 10), // January 10th
          weeksCount: 12,
          includeOrientation: false,
          deadWeeks: 1,
          examWeeks: 3,
          vacationWeeks: 12 // Long summer break
        },
        includeIndustrialTraining: false,
        graduationDate: new Date(nextYear, 6, 15) // July 15th
      }
    },
    {
      id: 'us-semester',
      name: 'US University - Semester System',
      description: 'Standard US academic calendar with Fall and Spring semesters, plus optional summer session.',
      config: {
        academicYear: `${currentYear}-${nextYear}`,
        faculty: 'College of Arts & Sciences',
        university: 'US University',
        batches: [
          `Senior`,
          `Junior`,
          `Sophomore`,
          `Freshman`
        ],
        firstSemester: {
          startDate: new Date(currentYear, 7, 25), // August 25th
          weeksCount: 15,
          includeOrientation: true,
          deadWeeks: 1,
          examWeeks: 1,
          vacationWeeks: 4 // Winter break
        },
        secondSemester: {
          startDate: new Date(nextYear, 0, 15), // January 15th
          weeksCount: 15,
          includeOrientation: false,
          deadWeeks: 1,
          examWeeks: 1,
          vacationWeeks: 14 // Summer break
        },
        includeIndustrialTraining: false,
        graduationDate: new Date(nextYear, 4, 15) // May 15th
      }
    },
    {
      id: 'australia-standard',
      name: 'Australian University',
      description: 'Australian academic calendar with two main semesters and optional summer/winter terms.',
      config: {
        academicYear: `${currentYear}-${nextYear}`,
        faculty: 'Faculty of Science',
        university: 'Australian University',
        batches: [
          `Year ${3}`,
          `Year ${2}`,
          `Year ${1}`
        ],
        firstSemester: {
          startDate: new Date(currentYear, 1, 20), // February 20th
          weeksCount: 13,
          includeOrientation: true,
          deadWeeks: 1,
          examWeeks: 2,
          vacationWeeks: 3
        },
        secondSemester: {
          startDate: new Date(currentYear, 6, 20), // July 20th
          weeksCount: 13,
          includeOrientation: false,
          deadWeeks: 1,
          examWeeks: 2,
          vacationWeeks: 12 // Summer break
        },
        includeIndustrialTraining: true,
        graduationDate: new Date(currentYear, 11, 10) // December 10th
      }
    }
  ];
};
