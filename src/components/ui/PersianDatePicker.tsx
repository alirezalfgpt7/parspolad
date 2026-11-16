import React from 'react';
import DatePicker, { DateObject } from 'react-multi-date-picker';
import persian from 'react-date-object/calendars/persian';
import gregorian from 'react-date-object/calendars/gregorian';
import persian_fa from 'react-date-object/locales/persian_fa';
import gregorian_en from 'react-date-object/locales/gregorian_en';

interface PersianDatePickerProps {
  value: string;
  onChange: (value: string) => void;
  className?: string;
  placeholder?: string;
}

const normalizeDigits = (value: string): string => value.replace(/[۰-۹]/g, (digit) =>
  String(digit.charCodeAt(0) - '۰'.charCodeAt(0)));

export const jalaliToGregorian = (value: string): string => {
  if (!value.trim()) {
    throw new Error('تاریخ شمسی را انتخاب کنید.');
  }

  const date = new DateObject({
    date: normalizeDigits(value),
    format: 'YYYY/MM/DD',
    calendar: persian,
    locale: persian_fa,
  });

  if (!date.isValid) {
    throw new Error('تاریخ شمسی نامعتبر است.');
  }

  return date.convert(gregorian, gregorian_en).format('YYYY-MM-DD');
};

export const gregorianToJalali = (value: string): string => {
  if (!value.trim()) return '';

  const date = new DateObject({
    date: value,
    format: 'YYYY-MM-DD',
    calendar: gregorian,
    locale: gregorian_en,
  });

  return date.isValid
    ? normalizeDigits(date.convert(persian, persian_fa).format('YYYY/MM/DD'))
    : '';
};

export const PersianDatePicker: React.FC<PersianDatePickerProps> = ({
  value,
  onChange,
  className = '',
  placeholder = 'انتخاب تاریخ شمسی',
}) => {
  const selectedDate = value
    ? new DateObject({
      date: normalizeDigits(value),
      format: 'YYYY/MM/DD',
      calendar: persian,
      locale: persian_fa,
    })
    : null;

  return (
    <DatePicker
      value={selectedDate?.isValid ? selectedDate : ''}
      onChange={(date: DateObject | null) => onChange(date?.isValid ? normalizeDigits(date.format('YYYY/MM/DD')) : '')}
      calendar={persian}
      locale={persian_fa}
      format="YYYY/MM/DD"
      calendarPosition="bottom-right"
      inputClass={`w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800 ${className}`}
      placeholder={placeholder}
    />
  );
};
