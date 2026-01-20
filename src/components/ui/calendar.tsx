'use client';

import * as React from 'react';
import Calendar from 'react-calendar';
import type { CalendarProps } from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import './calendar.css';
import { cn } from '@/lib/utils';

type CalendarValue = Date | Date[] | null | [Date | null, Date | null];

export interface HolidayDate {
  date: Date;
  name?: string;
}

interface CustomCalendarProps extends Omit<CalendarProps, 'onChange' | 'value' | 'tileContent' | 'tileClassName'> {
  // React-calendar API
  onChange?: (value: Date | null) => void;
  value?: Date | null;
  // Legacy react-day-picker API support
  mode?: 'single' | 'range' | 'multiple';
  selected?: Date | Date[] | { from?: Date; to?: Date } | undefined;
  onSelect?: (date: Date | Date[] | { from?: Date; to?: Date } | undefined) => void;
  className?: string;
  showDayNames?: boolean;
  // Holiday dates to highlight
  holidays?: HolidayDate[] | Date[];
}

function CustomCalendar({
  className,
  onChange,
  value,
  selected,
  onSelect,
  mode,
  minDate,
  showDayNames = true,
  holidays = [],
  ...props
}: CustomCalendarProps) {
  // Support legacy react-day-picker API
  const isLegacyAPI = mode !== undefined || selected !== undefined || onSelect !== undefined;
  
  const handleChange = (date: CalendarValue, event: React.MouseEvent<HTMLButtonElement>) => {
    void event; // Acknowledge the event parameter
    if (isLegacyAPI && onSelect) {
      // Legacy API: handle range or single selection
      if (mode === 'range' && Array.isArray(date)) {
        const firstDate = date[0] instanceof Date ? date[0] : undefined;
        const secondDate = date[1] instanceof Date ? date[1] : undefined;
        onSelect({ from: firstDate, to: secondDate });
      } else if (mode === 'multiple' && Array.isArray(date)) {
        const filteredDates = (date as (Date | null)[]).filter((d): d is Date => d !== null && d instanceof Date);
        onSelect(filteredDates);
      } else if (date instanceof Date) {
        onSelect(date);
      } else {
        onSelect(undefined);
      }
    } else if (onChange) {
      // New API: simple date selection
      if (Array.isArray(date)) {
        const firstDate = date[0] instanceof Date ? date[0] : null;
        onChange(firstDate);
      } else if (date instanceof Date) {
        onChange(date);
      } else {
        onChange(null);
      }
    }
  };

  // Determine the calendar value
  const calendarValue = React.useMemo(() => {
    if (isLegacyAPI) {
      if (selected) {
        if (Array.isArray(selected)) {
          return selected[0] || null;
        }
        if (typeof selected === 'object' && 'from' in selected) {
          return selected.from || null;
        }
        if (selected instanceof Date) {
          return selected;
        }
      }
      return null;
    }
    
    if (!value) return null;
    if (value instanceof Date) return value;
    return new Date(value);
  }, [value, selected, isLegacyAPI]);

  // Determine if we should use selectRange for range mode
  const selectRange = mode === 'range';

  // Disable past dates - using react-calendar's tileDisabled prop
  const tileDisabled = React.useCallback(({ date, view }: { date: Date; view: string }) => {
    // Only disable dates in month view
    if (view !== 'month') return false;
    
    if (!minDate) {
      // If no minDate provided, disable dates before today
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const dateToCheck = new Date(date);
      dateToCheck.setHours(0, 0, 0, 0);
      return dateToCheck < today;
    }
    
    const dateToCheck = new Date(date);
    dateToCheck.setHours(0, 0, 0, 0);
    const minDateToCheck = new Date(minDate);
    minDateToCheck.setHours(0, 0, 0, 0);
    return dateToCheck < minDateToCheck;
  }, [minDate]);

  // Check if a date is a holiday
  const isHoliday = React.useCallback((date: Date): boolean => {
    const dateToCheck = new Date(date);
    dateToCheck.setHours(0, 0, 0, 0);
    
    return holidays.some((holiday) => {
      const holidayDate = holiday instanceof Date ? holiday : new Date(holiday.date);
      holidayDate.setHours(0, 0, 0, 0);
      return dateToCheck.getTime() === holidayDate.getTime();
    });
  }, [holidays]);

  // Custom tile class names for holidays
  const tileClassName = React.useCallback(({ date, view }: { date: Date; view: string }) => {
    if (view !== 'month') return null;
    
    const classes: string[] = [];
    
    if (isHoliday(date)) {
      classes.push('react-calendar__tile--holiday');
    }
    
    return classes.length > 0 ? classes.join(' ') : null;
  }, [isHoliday]);

  // Custom tile content to show date number and day name
  const tileContent = React.useCallback(({ date, view }: { date: Date; view: string }) => {
    if (view === 'month' && showDayNames) {
      const dayNumber = date.getDate();
      const dayName = date.toLocaleDateString('en-US', { weekday: 'long' });
      
      return (
        <div className='calendar-tile-content'>
          <div className='calendar-date-number'>{dayNumber}</div>
          <div className='calendar-day-name'>{dayName}</div>
        </div>
      );
    }
    return null;
  }, [showDayNames]);

  return (
    <div className={cn('react-calendar-wrapper', className)}>
      <Calendar
        onChange={handleChange}
        value={calendarValue}
        minDate={minDate}
        tileDisabled={tileDisabled}
        tileClassName={tileClassName}
        selectRange={selectRange}
        tileContent={tileContent}
        showNeighboringMonth={false}
        className='custom-calendar'
        {...props}
      />
    </div>
  );
}

export { CustomCalendar as Calendar };
