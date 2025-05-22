import React, { useState } from 'react';
import { format } from 'date-fns';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Calendar } from '@/components/ui/calendar';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { CalendarConfig, SemesterConfig, getDefaultCalendarConfig } from '@/lib/calendar-utils';
import { getPresetTemplates, TemplateInfo } from '@/lib/preset-templates';

interface CalendarFormProps {
  onSubmit: (config: CalendarConfig) => void;
}

export function CalendarForm({ onSubmit }: CalendarFormProps) {
  const [config, setConfig] = useState<CalendarConfig>(getDefaultCalendarConfig());
  const [firstSemStartDateOpen, setFirstSemStartDateOpen] = useState(false);
  const [secondSemStartDateOpen, setSecondSemStartDateOpen] = useState(false);
  const [graduationDateOpen, setGraduationDateOpen] = useState(false);
  const [templatesOpen, setTemplatesOpen] = useState(false);
  const [aiSuggestion, setAiSuggestion] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showDisclaimer, setShowDisclaimer] = useState(true);

  // Get preset templates
  const presetTemplates = getPresetTemplates(new Date().getFullYear());

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(config);
  };

  const updateConfig = (key: keyof CalendarConfig, value: string | number | boolean | Date | string[]) => {
    setConfig(prev => ({ ...prev, [key]: value }));
  };

  const updateFirstSemesterConfig = (key: keyof SemesterConfig, value: string | number | Date | boolean) => {
    setConfig(prev => ({
      ...prev,
      firstSemester: {
        ...prev.firstSemester,
        [key]: value
      }
    }));
  };

  const updateSecondSemesterConfig = (key: keyof SemesterConfig, value: string | number | Date | boolean) => {
    setConfig(prev => ({
      ...prev,
      secondSemester: {
        ...prev.secondSemester,
        [key]: value
      }
    }));
  };

  const getAiSuggestion = async () => {
    setIsLoading(true);
    try {
      const prompt = `Generate suggestions for an academic calendar with the following configuration:

      Academic Year: ${config.academicYear}
      Faculty: ${config.faculty}
      University: ${config.university}

      First Semester: Starts on ${format(config.firstSemester.startDate, 'dd MMMM yyyy')}
      First Semester Weeks: ${config.firstSemester.weeksCount}

      Second Semester Weeks: ${config.secondSemester.weeksCount}

      Include Industrial Training: ${config.includeIndustrialTraining ? 'Yes' : 'No'}

      The batches are: ${config.batches.join(', ')}

      Please provide suggestions for:
      1. Optimal number of dead weeks before exams
      2. Duration for examination periods
      3. Vacation period lengths
      4. When to schedule orientation for new students
      5. Best time for industrial training
      6. Ideal graduation date
      `;

      const response = await fetch('/api/ai', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ prompt })
      });

      const data = await response.json();
      if (data.success) {
        setAiSuggestion(data.data);
      } else {
        setAiSuggestion('Sorry, I was unable to generate suggestions at this time.');
      }
    } catch (error) {
      console.error('Error getting AI suggestion:', error);
      setAiSuggestion('Error: Unable to connect to AI service.');
    } finally {
      setIsLoading(false);
    }
  };

  const applyTemplate = (template: TemplateInfo) => {
    setConfig(template.config);
    setTemplatesOpen(false);
  };

  return (
    <Card className="w-full max-w-4xl">
      <CardHeader>
        <CardTitle className="text-2xl font-bold text-center">Academic Calendar Configuration</CardTitle>
      </CardHeader>
      <CardContent>
        {showDisclaimer && (
          <div className="bg-blue-50 p-4 rounded-lg mb-6 text-sm">
            <div className="flex justify-between">
              <h3 className="font-semibold text-blue-800">Original Calendar Reference</h3>
              <button
                onClick={() => setShowDisclaimer(false)}
                className="text-blue-700 hover:text-blue-900"
              >
                ✕
              </button>
            </div>
            <p className="mt-2">
              This application is designed to recreate the academic calendar format from the University of Vavuniya's
              Faculty of Applied Science. Start by configuring your calendar parameters below, then generate to see the full calendar.
            </p>
          </div>
        )}

        <div className="flex justify-end mb-4">
          <Sheet open={templatesOpen} onOpenChange={setTemplatesOpen}>
            <SheetTrigger asChild>
              <Button variant="outline">Load Template</Button>
            </SheetTrigger>
            <SheetContent>
              <SheetHeader>
                <SheetTitle>Preset Calendar Templates</SheetTitle>
                <SheetDescription>
                  Choose a template to quickly set up your academic calendar
                </SheetDescription>
              </SheetHeader>
              <div className="mt-6 space-y-4">
                {presetTemplates.map((template) => (
                  <div key={template.id} className="border p-4 rounded-lg hover:bg-gray-50 cursor-pointer" onClick={() => applyTemplate(template)}>
                    <h3 className="font-semibold">{template.name}</h3>
                    <p className="text-sm text-gray-600">{template.description}</p>
                  </div>
                ))}
              </div>
            </SheetContent>
          </Sheet>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <Label htmlFor="academicYear">Academic Year</Label>
                <Input
                  id="academicYear"
                  value={config.academicYear}
                  onChange={e => updateConfig('academicYear', e.target.value)}
                  placeholder="e.g., 2025-2026"
                  required
                />
              </div>

              <div>
                <Label htmlFor="faculty">Faculty</Label>
                <Input
                  id="faculty"
                  value={config.faculty}
                  onChange={e => updateConfig('faculty', e.target.value)}
                  placeholder="e.g., Faculty of Applied Science"
                  required
                />
              </div>

              <div>
                <Label htmlFor="university">University</Label>
                <Input
                  id="university"
                  value={config.university}
                  onChange={e => updateConfig('university', e.target.value)}
                  placeholder="e.g., University of Vavuniya"
                  required
                />
              </div>

              <div>
                <Label htmlFor="batches">Batches (comma separated)</Label>
                <Input
                  id="batches"
                  value={config.batches.join(', ')}
                  onChange={e => updateConfig('batches', e.target.value.split(',').map(b => b.trim()))}
                  placeholder="e.g., FAS/20, FAS/21, FAS/22, FAS/23"
                  required
                />
                <p className="text-xs text-gray-500 mt-1">
                  List older batches first (graduating students), followed by newer batches
                </p>
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="includeIndustrialTraining"
                  checked={config.includeIndustrialTraining}
                  onChange={e => updateConfig('includeIndustrialTraining', e.target.checked)}
                  className="h-4 w-4 text-blue-600"
                />
                <Label htmlFor="includeIndustrialTraining">Include Industrial Training</Label>
              </div>

              <div>
                <Label htmlFor="graduationDate">Graduation Date</Label>
                <div className="flex items-center space-x-2 mt-1">
                  <Input
                    id="graduationDate"
                    value={config.graduationDate ? format(config.graduationDate, 'dd MMMM yyyy') : ''}
                    onClick={() => setGraduationDateOpen(true)}
                    readOnly
                    placeholder="Select graduation date"
                  />
                  <Button type="button" variant="outline" onClick={() => setGraduationDateOpen(true)}>
                    Select
                  </Button>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div className="border p-4 rounded-lg space-y-4">
                <h3 className="text-lg font-semibold">First Semester</h3>

                <div>
                  <Label htmlFor="firstSemStartDate">Start Date</Label>
                  <div className="flex items-center space-x-2 mt-1">
                    <Input
                      id="firstSemStartDate"
                      value={format(config.firstSemester.startDate, 'dd MMMM yyyy')}
                      onClick={() => setFirstSemStartDateOpen(true)}
                      readOnly
                      placeholder="Select first semester start date"
                      required
                    />
                    <Button type="button" variant="outline" onClick={() => setFirstSemStartDateOpen(true)}>
                      Select
                    </Button>
                  </div>
                </div>

                <div>
                  <Label htmlFor="firstSemWeeks">Number of Weeks</Label>
                  <Input
                    id="firstSemWeeks"
                    type="number"
                    min="1"
                    max="30"
                    value={config.firstSemester.weeksCount}
                    onChange={e => updateFirstSemesterConfig('weeksCount', parseInt(e.target.value))}
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label htmlFor="firstSemDeadWeeks">Dead Weeks</Label>
                    <Input
                      id="firstSemDeadWeeks"
                      type="number"
                      min="0"
                      max="4"
                      value={config.firstSemester.deadWeeks}
                      onChange={e => updateFirstSemesterConfig('deadWeeks', parseInt(e.target.value))}
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="firstSemExamWeeks">Exam Weeks</Label>
                    <Input
                      id="firstSemExamWeeks"
                      type="number"
                      min="1"
                      max="6"
                      value={config.firstSemester.examWeeks}
                      onChange={e => updateFirstSemesterConfig('examWeeks', parseInt(e.target.value))}
                      required
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="firstSemVacationWeeks">Vacation Weeks</Label>
                  <Input
                    id="firstSemVacationWeeks"
                    type="number"
                    min="0"
                    max="8"
                    value={config.firstSemester.vacationWeeks}
                    onChange={e => updateFirstSemesterConfig('vacationWeeks', parseInt(e.target.value))}
                    required
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="firstSemOrientation"
                    checked={config.firstSemester.includeOrientation}
                    onChange={e => updateFirstSemesterConfig('includeOrientation', e.target.checked)}
                    className="h-4 w-4 text-blue-600"
                  />
                  <Label htmlFor="firstSemOrientation">Include Orientation</Label>
                </div>
              </div>

              <div className="border p-4 rounded-lg space-y-4">
                <h3 className="text-lg font-semibold">Second Semester</h3>

                <div>
                  <Label htmlFor="secondSemWeeks">Number of Weeks</Label>
                  <Input
                    id="secondSemWeeks"
                    type="number"
                    min="1"
                    max="30"
                    value={config.secondSemester.weeksCount}
                    onChange={e => updateSecondSemesterConfig('weeksCount', parseInt(e.target.value))}
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label htmlFor="secondSemDeadWeeks">Dead Weeks</Label>
                    <Input
                      id="secondSemDeadWeeks"
                      type="number"
                      min="0"
                      max="4"
                      value={config.secondSemester.deadWeeks}
                      onChange={e => updateSecondSemesterConfig('deadWeeks', parseInt(e.target.value))}
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="secondSemExamWeeks">Exam Weeks</Label>
                    <Input
                      id="secondSemExamWeeks"
                      type="number"
                      min="1"
                      max="6"
                      value={config.secondSemester.examWeeks}
                      onChange={e => updateSecondSemesterConfig('examWeeks', parseInt(e.target.value))}
                      required
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="secondSemVacationWeeks">Vacation Weeks</Label>
                  <Input
                    id="secondSemVacationWeeks"
                    type="number"
                    min="0"
                    max="8"
                    value={config.secondSemester.vacationWeeks}
                    onChange={e => updateSecondSemesterConfig('vacationWeeks', parseInt(e.target.value))}
                    required
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="secondSemOrientation"
                    checked={config.secondSemester.includeOrientation}
                    onChange={e => updateSecondSemesterConfig('includeOrientation', e.target.checked)}
                    className="h-4 w-4 text-blue-600"
                  />
                  <Label htmlFor="secondSemOrientation">Include Orientation</Label>
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row justify-between gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={getAiSuggestion}
              disabled={isLoading}
              className="flex-1"
            >
              {isLoading ? 'Getting AI Suggestions...' : 'Get AI Suggestions'}
            </Button>
            <Button type="submit" className="flex-1">Generate Calendar</Button>
          </div>
        </form>

        {aiSuggestion && (
          <div className="mt-6 p-4 border rounded-lg bg-blue-50">
            <div className="flex justify-between items-start">
              <h3 className="text-lg font-semibold mb-2">AI Suggestions</h3>
              <button
                onClick={() => setAiSuggestion(null)}
                className="text-blue-700 hover:text-blue-900"
              >
                ✕
              </button>
            </div>
            <div className="whitespace-pre-line text-sm">{aiSuggestion}</div>
          </div>
        )}
      </CardContent>

      {/* Date Picker Dialogs */}
      <Dialog open={firstSemStartDateOpen} onOpenChange={setFirstSemStartDateOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Select First Semester Start Date</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <Calendar
              mode="single"
              selected={config.firstSemester.startDate}
              onSelect={(date) => {
                if (date) {
                  updateFirstSemesterConfig('startDate', date);
                  setFirstSemStartDateOpen(false);
                }
              }}
              className="rounded-md border"
            />
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={secondSemStartDateOpen} onOpenChange={setSecondSemStartDateOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Select Second Semester Start Date</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <Calendar
              mode="single"
              selected={config.secondSemester.startDate}
              onSelect={(date) => {
                if (date) {
                  updateSecondSemesterConfig('startDate', date);
                  setSecondSemStartDateOpen(false);
                }
              }}
              className="rounded-md border"
            />
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={graduationDateOpen} onOpenChange={setGraduationDateOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Select Graduation Date</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <Calendar
              mode="single"
              selected={config.graduationDate || undefined}
              onSelect={(date) => {
                if (date) {
                  updateConfig('graduationDate', date);
                }
                setGraduationDateOpen(false);
              }}
              className="rounded-md border"
            />
          </div>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
