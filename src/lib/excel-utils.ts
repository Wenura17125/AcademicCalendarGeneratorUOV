import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';
import { format } from 'date-fns';
import { CalendarWeek, CalendarConfig, getColorForStatus, getTextColorForStatus, getStatusDisplayText } from './calendar-utils';

export async function exportToExcel(
  calendarWeeks: CalendarWeek[],
  config: CalendarConfig
) {
  const workbook = new ExcelJS.Workbook();

  // Add the calendar sheet
  const worksheet = workbook.addWorksheet('Academic Calendar');

  // Set up column widths
  worksheet.columns = [
    { header: '', width: 4 },                  // Empty column for row numbers
    { header: 'Year', width: 10 },             // Year column
    { header: 'Start Date', width: 12 },       // Start date column
    { header: 'End Date', width: 12 },         // End date column
    { header: '', width: 4 },                  // Empty spacing column
    { header: 'Week', width: 8 },              // Week number column
    { header: '', width: 4 },                  // Empty spacing column
    { header: '', width: 4 },                  // Empty spacing column
    ...config.batches.map(batch => ({ header: batch, width: 15 }))  // Batch columns
  ];

  // Add title row
  const titleRow = worksheet.addRow(['', '']);
  titleRow.height = 20;
  titleRow.getCell(2).value = `ACADEMIC CALENDAR FOR THE YEAR ${config.academicYear} - ${config.faculty}, ${config.university}`;

  // Merge cells for title
  worksheet.mergeCells(1, 2, 1, 8 + config.batches.length);

  // Style the title
  const titleCell = titleRow.getCell(2);
  titleCell.font = {
    bold: true,
    size: 12
  };
  titleCell.alignment = {
    horizontal: 'center',
    vertical: 'middle'
  };

  // Add empty row
  worksheet.addRow([]);

  // Add header row
  const headerRow = worksheet.addRow(['', 'Year / Dates', '', '', '', 'Week', '', '']);

  // Add batch headers to the header row
  config.batches.forEach((batch, index) => {
    headerRow.getCell(9 + index).value = batch;
  });

  // Style the header row
  headerRow.height = 20;
  headerRow.eachCell((cell, colNumber) => {
    if (cell.value) {
      cell.font = {
        bold: true,
        size: 10
      };
      cell.alignment = {
        horizontal: 'center',
        vertical: 'middle'
      };
      cell.border = {
        top: { style: 'thick' },
        left: { style: 'thin' },
        bottom: { style: 'thick' },
        right: { style: 'thick' }
      };
    }
  });

  // Merge cells for the "Year / Dates" heading
  worksheet.mergeCells(4, 2, 4, 4);

  // Add empty row
  worksheet.addRow([]);

  // Add the calendar data rows
  calendarWeeks.forEach((week, index) => {
    const year = format(week.startDate, 'yyyy');
    const startDateStr = format(week.startDate, 'dd-MMM');
    const endDateStr = format(week.endDate, 'dd-MMM');

    const row = worksheet.addRow([
      '', // Row number column (empty)
      year,
      startDateStr,
      endDateStr,
      '', // Empty spacing column
      week.weekNumber.toString(),
      '', // Empty spacing column
      '' // Empty spacing column
    ]);

    // Add batch statuses
    config.batches.forEach((batch, batchIndex) => {
      const status = week.status[batch];
      const statusText = getStatusDisplayText(status);

      const cell = row.getCell(9 + batchIndex);
      cell.value = statusText;

      // Style the cell based on status
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: getColorForStatus(status).replace('#', '') }
      };

      cell.font = {
        color: { argb: getTextColorForStatus(status).replace('#', '') },
        size: 10
      };

      cell.alignment = {
        horizontal: 'center',
        vertical: 'middle'
      };

      cell.border = {
        top: { style: 'thin' },
        left: { style: 'thin' },
        bottom: { style: 'thin' },
        right: { style: 'thin' }
      };
    });

    // Style the row
    row.height = 18;

    // Style the year and date cells
    const yearCell = row.getCell(2);
    const startDateCell = row.getCell(3);
    const endDateCell = row.getCell(4);
    const weekCell = row.getCell(6);

    [yearCell, startDateCell, endDateCell, weekCell].forEach(cell => {
      cell.font = {
        size: 10
      };
      cell.alignment = {
        horizontal: 'center',
        vertical: 'middle'
      };
      cell.border = {
        top: { style: 'thin' },
        left: { style: 'thin' },
        bottom: { style: 'thin' },
        right: { style: 'thin' }
      };
    });
  });

  // Add a legend section
  worksheet.addRow([]);
  worksheet.addRow([]);

  const legendRow = worksheet.addRow(['', 'Legend:']);
  legendRow.getCell(2).font = {
    bold: true,
    size: 10
  };

  // Add legend items
  worksheet.addRow(['', 'DW', ':', 'Dead Week']);
  worksheet.addRow(['', 'EX', ':', 'End Semester Examination']);
  worksheet.addRow(['', 'Vaca', ':', 'Vacation']);
  worksheet.addRow(['', 'IT', ':', 'Industrial Training']);
  worksheet.addRow(['', 'EX-END', ':', 'Final Exam Ending Week']);

  // Style legend items
  for (let i = 0; i < 5; i++) {
    const row = worksheet.getRow(worksheet.rowCount - i);
    row.getCell(2).font = {
      bold: true,
      size: 9
    };
    row.getCell(3).alignment = {
      horizontal: 'center'
    };
    row.getCell(4).font = {
      size: 9
    };
  }

  // Generate the Excel file
  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  saveAs(blob, `Academic_Calendar_${config.academicYear}.xlsx`);
}

export async function exportToPdf(calendarData: CalendarWeek[], config: CalendarConfig) {
  // PDF export would go here - we'll focus on Excel as the primary format
  console.log('PDF export not yet implemented');
}
