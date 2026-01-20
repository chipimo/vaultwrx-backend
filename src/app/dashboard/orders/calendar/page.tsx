'use client';

import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { IconChevronLeft, IconChevronRight, IconEye, IconEyeOff } from '@tabler/icons-react';

interface CalendarDay {
  date: string;
  dayName: string;
  fullDate: Date;
  isCurrentMonth: boolean;
  status: 'closed' | 'taking-orders';
}

interface Holiday {
  id: string;
  name: string;
  date: string;
  checked: boolean;
}

// Mock holidays data
const mockHolidays: Holiday[] = [
  { id: '1', name: "New Year's Day", date: '2025-01-01', checked: false },
  { id: '2', name: 'Martin Luther King Jr. Day', date: '2025-01-20', checked: false },
  { id: '3', name: 'Tax Day', date: '2025-04-15', checked: false },
  { id: '4', name: 'Administrative Professionals Day', date: '2025-04-22', checked: false },
  { id: '5', name: "Father's Day", date: '2025-06-21', checked: false },
  { id: '6', name: 'Independence Day (substitute day)', date: '2025-07-03', checked: false },
  { id: '7', name: 'Independence Day', date: '2025-07-04', checked: false },
  { id: '8', name: 'Labor Day', date: '2025-09-07', checked: false },
  { id: '9', name: 'Columbus Day', date: '2025-10-12', checked: false },
  { id: '10', name: 'Halloween', date: '2025-10-31', checked: false },
  { id: '11', name: 'Election Day', date: '2025-11-03', checked: false },
  { id: '12', name: 'Veterans Day', date: '2025-11-11', checked: false },
  { id: '13', name: 'Thanksgiving Day', date: '2025-11-26', checked: false },
  { id: '14', name: 'Day after Thanksgiving Day', date: '2025-11-27', checked: false },
  { id: '15', name: 'Christmas Eve', date: '2025-12-24', checked: false },
  { id: '16', name: 'Christmas Day', date: '2025-12-25', checked: false },
  { id: '17', name: "New Year's Eve", date: '2025-12-31', checked: false }
];

const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

function getMonthDays(year: number, month: number): CalendarDay[] {
  const days: CalendarDay[] = [];
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const startPadding = firstDay.getDay();

  // Add previous month days
  const prevMonth = new Date(year, month, 0);
  for (let i = startPadding - 1; i >= 0; i--) {
    const date = new Date(year, month - 1, prevMonth.getDate() - i);
    days.push({
      date: formatDate(date),
      dayName: dayNames[date.getDay()],
      fullDate: date,
      isCurrentMonth: false,
      status: date.getDay() === 0 ? 'closed' : 'taking-orders'
    });
  }

  // Add current month days
  for (let i = 1; i <= lastDay.getDate(); i++) {
    const date = new Date(year, month, i);
    days.push({
      date: formatDate(date),
      dayName: dayNames[date.getDay()],
      fullDate: date,
      isCurrentMonth: true,
      status: date.getDay() === 0 ? 'closed' : 'taking-orders'
    });
  }

  // Add next month days to fill the grid
  const endPadding = 7 - (days.length % 7);
  if (endPadding < 7) {
    for (let i = 1; i <= endPadding; i++) {
      const date = new Date(year, month + 1, i);
      days.push({
        date: formatDate(date),
        dayName: dayNames[date.getDay()],
        fullDate: date,
        isCurrentMonth: false,
        status: date.getDay() === 0 ? 'closed' : 'taking-orders'
      });
    }
  }

  return days;
}

function formatDate(date: Date): string {
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const year = String(date.getFullYear()).slice(-2);
  return `${month}/${day}/${year}`;
}

function formatMonthYear(date: Date): string {
  return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
}

export default function Page() {
  const [currentDate, setCurrentDate] = useState(new Date(2025, 3, 1)); // April 2025
  const [holidays, setHolidays] = useState(mockHolidays);
  const [selectedDay, setSelectedDay] = useState<string | null>('04/10/25');

  const days = getMonthDays(currentDate.getFullYear(), currentDate.getMonth());

  const prevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const toggleHoliday = (id: string) => {
    setHolidays((prev) =>
      prev.map((h) => (h.id === id ? { ...h, checked: !h.checked } : h))
    );
  };

  return (
    <div className='flex justify-center p-8'>
      <div className='w-full max-w-5xl space-y-6'>
        {/* Title */}
        <h2 className='text-lg font-medium text-foreground'>Burial Vaults</h2>
        <hr className='border-border' />

        <div className='flex gap-6'>
          {/* Calendar Section */}
          <Card className='flex-1'>
            <CardContent className='p-6'>
            {/* Month Navigation */}
            <div className='mb-6 flex items-center gap-4'>
              <button
                onClick={prevMonth}
                className='rounded p-1 text-muted-foreground hover:bg-muted'
              >
                <IconChevronLeft className='size-5' stroke={1.5} />
              </button>
              <h3 className='text-lg font-medium'>{formatMonthYear(currentDate)}</h3>
              <button
                onClick={nextMonth}
                className='rounded p-1 text-muted-foreground hover:bg-muted'
              >
                <IconChevronRight className='size-5' stroke={1.5} />
              </button>
            </div>

            {/* Day Headers */}
            <div className='mb-3 grid grid-cols-7 gap-2'>
              {dayNames.map((day) => (
                <div key={day} className='text-center text-sm font-medium text-foreground'>
                  {day}
                </div>
              ))}
            </div>

            <hr className='mb-3 border-border' />

            {/* Calendar Grid */}
            <div className='grid grid-cols-7 gap-2'>
              {days.map((day, index) => (
                <div
                  key={index}
                  onClick={() => setSelectedDay(day.date)}
                  className={`cursor-pointer rounded-lg p-2 text-center transition-colors ${
                    selectedDay === day.date
                      ? 'bg-foreground text-background'
                      : 'hover:bg-muted'
                  } ${!day.isCurrentMonth ? 'opacity-40' : ''}`}
                >
                  <p className='text-xs text-muted-foreground'>{day.date}</p>
                  <p className='text-xs font-medium'>{day.dayName}</p>
                  {day.status === 'closed' ? (
                    <div className='mt-2 flex flex-col items-center gap-1'>
                      <IconEyeOff className='size-4 text-red-500' stroke={1.5} />
                      <span className='text-xs text-red-500'>Closed</span>
                    </div>
                  ) : (
                    <div className='mt-2 flex flex-col items-center gap-1'>
                      <IconEye className='size-4 text-muted-foreground' stroke={1.5} />
                      <span className='text-xs text-muted-foreground'>Taking Orders</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Right Sidebar */}
        <div className='w-80 shrink-0 space-y-4'>
          {/* Additional Calendar Charges */}
          <Card>
            <CardContent className='p-4'>
              <h4 className='mb-4 text-sm font-semibold text-foreground'>
                Additional Calendar Charges
              </h4>
              <div className='space-y-3'>
                <div className='flex items-center justify-between'>
                  <span className='text-sm text-muted-foreground'>Saturday Charge</span>
                  <span className='text-sm font-medium'>$100</span>
                </div>
                <div className='flex items-center justify-between'>
                  <span className='text-sm text-muted-foreground'>Sunday Charge</span>
                  <span className='text-sm font-medium'>$100</span>
                </div>
                <div className='flex items-center justify-between'>
                  <span className='text-sm text-muted-foreground'>Holiday</span>
                  <span className='text-sm font-medium'>$100</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Holiday Options */}
          <Card>
            <CardContent className='p-4'>
              <h4 className='mb-4 text-sm font-semibold text-foreground'>
                Holiday Options
              </h4>
              <div className='max-h-96 space-y-3 overflow-y-auto'>
                {holidays.map((holiday) => (
                  <div key={holiday.id} className='flex items-center gap-3'>
                    <Checkbox
                      id={holiday.id}
                      checked={holiday.checked}
                      onCheckedChange={() => toggleHoliday(holiday.id)}
                    />
                    <label
                      htmlFor={holiday.id}
                      className='cursor-pointer text-sm text-foreground'
                    >
                      {holiday.name} : {holiday.date}
                    </label>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
        </div>
      </div>
    </div>
  );
}
