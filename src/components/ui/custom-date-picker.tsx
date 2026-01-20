'use client';

import { useState, useMemo } from 'react';
import { IconChevronLeft, IconChevronRight } from '@tabler/icons-react';
import { cn } from '@/lib/utils';
import {
  format,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  addDays,
  addMonths,
  subMonths,
  isSameMonth,
  isSameDay,
  isBefore,
  startOfDay
} from 'date-fns';

interface CustomDatePickerProps {
  value?: Date | null;
  onChange?: (date: Date) => void;
  minDate?: Date;
  maxDate?: Date;
  holidays?: Date[];
  disabled?: boolean;
  className?: string;
}

export function CustomDatePicker({
  value,
  onChange,
  minDate,
  maxDate,
  holidays = [],
  disabled = false,
  className
}: CustomDatePickerProps) {
  const [currentMonth, setCurrentMonth] = useState(value || new Date());

  const today = startOfDay(new Date());

  // Generate calendar days
  const calendarDays = useMemo(() => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(monthStart);
    const calendarStart = startOfWeek(monthStart, { weekStartsOn: 0 }); // Sunday
    const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 0 });

    const days: Date[] = [];
    let day = calendarStart;

    while (day <= calendarEnd) {
      days.push(day);
      day = addDays(day, 1);
    }

    return days;
  }, [currentMonth]);

  // Check if a date is a holiday
  const isHoliday = (date: Date): boolean => {
    return holidays.some((holiday) => isSameDay(holiday, date));
  };

  // Check if a date is disabled
  const isDateDisabled = (date: Date): boolean => {
    if (minDate && isBefore(date, startOfDay(minDate))) return true;
    if (maxDate && isBefore(startOfDay(maxDate), date)) return true;
    return false;
  };

  // Handle date selection
  const handleDateClick = (date: Date) => {
    if (disabled || isDateDisabled(date)) return;
    onChange?.(date);
  };

  // Navigate months
  const goToPreviousMonth = () => setCurrentMonth(subMonths(currentMonth, 1));
  const goToNextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));

  // Month and year options
  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 10 }, (_, i) => currentYear + i);

  const handleMonthChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newMonth = parseInt(e.target.value, 10);
    const newDate = new Date(currentMonth);
    newDate.setMonth(newMonth);
    setCurrentMonth(newDate);
  };

  const handleYearChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newYear = parseInt(e.target.value, 10);
    const newDate = new Date(currentMonth);
    newDate.setFullYear(newYear);
    setCurrentMonth(newDate);
  };

  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  return (
    <div className={cn('w-full bg-popover rounded-lg', className)}>
      {/* Header with month/year selectors and navigation */}
      <div className='flex items-center justify-between px-4 py-4'>
        <button
          type='button'
          onClick={goToPreviousMonth}
          disabled={disabled}
          className='p-2 hover:bg-muted rounded-full transition-colors disabled:opacity-50'
        >
          <IconChevronLeft className='h-5 w-5 text-muted-foreground' />
        </button>
        
        <div className='flex items-center gap-2'>
          {/* Month selector */}
          <select
            value={currentMonth.getMonth()}
            onChange={handleMonthChange}
            disabled={disabled}
            className='bg-muted border border-border rounded-md px-3 py-1.5 text-sm font-medium text-popover-foreground cursor-pointer hover:bg-muted/80 focus:outline-none focus:ring-2 focus:ring-ring'
          >
            {months.map((month, index) => (
              <option key={month} value={index}>
                {month}
              </option>
            ))}
          </select>
          
          {/* Year selector */}
          <select
            value={currentMonth.getFullYear()}
            onChange={handleYearChange}
            disabled={disabled}
            className='bg-muted border border-border rounded-md px-3 py-1.5 text-sm font-medium text-popover-foreground cursor-pointer hover:bg-muted/80 focus:outline-none focus:ring-2 focus:ring-ring'
          >
            {years.map((year) => (
              <option key={year} value={year}>
                {year}
              </option>
            ))}
          </select>
        </div>
        
        <button
          type='button'
          onClick={goToNextMonth}
          disabled={disabled}
          className='p-2 hover:bg-muted rounded-full transition-colors disabled:opacity-50'
        >
          <IconChevronRight className='h-5 w-5 text-muted-foreground' />
        </button>
      </div>

      {/* Day names header */}
      <div className='grid grid-cols-7 border-b border-border'>
        {dayNames.map((dayName) => (
          <div
            key={dayName}
            className='py-2 text-center text-xs font-medium text-muted-foreground'
          >
            {dayName}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className='grid grid-cols-7'>
        {calendarDays.map((day, index) => {
          const isCurrentMonth = isSameMonth(day, currentMonth);
          const isSelected = value && isSameDay(day, value);
          const isDisabled = isDateDisabled(day);
          const isHolidayDate = isHoliday(day);
          const isPast = isBefore(day, today) && !isSameDay(day, today);
          const isToday = isSameDay(day, today);

          // Hide days from other months
          if (!isCurrentMonth) {
            return (
              <div
                key={index}
                className='py-3 px-1.5 border border-border/50 min-h-[68px]'
              />
            );
          }

          return (
            <button
              key={index}
              type='button'
              onClick={() => handleDateClick(day)}
              disabled={disabled || isDisabled}
              className={cn(
                'relative flex flex-col items-center justify-center py-3 px-1.5 border border-border/50 transition-colors min-h-[68px]',
                // Current month but past
                isPast && 'text-muted-foreground/50',
                // Current month and future
                !isPast && 'text-popover-foreground',
                // Holiday styling - light red/pink
                isHolidayDate && !isSelected && 'bg-red-100/60 text-red-900',
                // Selected styling
                isSelected && 'bg-primary text-primary-foreground',
                // Disabled
                isDisabled && 'cursor-not-allowed opacity-40',
                // Hover (when not selected and not disabled)
                !isSelected && !isDisabled && !isHolidayDate && 'hover:bg-muted/50',
                isHolidayDate && !isSelected && !isDisabled && 'hover:bg-red-100'
              )}
            >
              {/* Green dot for today - top right corner */}
              {isToday && !isSelected && (
                <span className='absolute top-0.5 right-0.5 w-1.5 h-1.5 bg-green-500 rounded-full' />
              )}
              {/* Day name on top */}
              <span className={cn(
                'text-xs font-medium',
                isSelected ? 'text-primary-foreground' : 
                isHolidayDate ? 'text-red-800' :
                isPast ? 'text-muted-foreground/50' : 'text-popover-foreground'
              )}>
                {format(day, 'EEEE')}
              </span>
              {/* Date below */}
              <span className={cn(
                'text-sm font-semibold',
                isSelected && 'text-primary-foreground',
                isHolidayDate && !isSelected && 'text-red-900'
              )}>
                {format(day, 'MM/dd/yy')}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default CustomDatePicker;

