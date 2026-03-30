"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight, Calendar, X } from "lucide-react";

interface DateRangePickerProps {
  isOpen: boolean;
  onClose: () => void;
  onApply: (from: string, to: string) => void;
  initialFrom?: string;
  initialTo?: string;
}

const DAYS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];
const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

function toDateStr(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function CalendarMonth({
  year,
  month,
  from,
  to,
  hovering,
  onSelect,
  onHover,
}: {
  year: number;
  month: number;
  from: string;
  to: string;
  hovering: string;
  onSelect: (date: string) => void;
  onHover: (date: string) => void;
}) {
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const today = toDateStr(new Date());

  const cells: (number | null)[] = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let i = 1; i <= daysInMonth; i++) cells.push(i);

  const getDateStr = (day: number) =>
    `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;

  const isInRange = (dateStr: string) => {
    const end = to || hovering;
    if (!from || !end) return false;
    const [a, b] = from <= end ? [from, end] : [end, from];
    return dateStr >= a && dateStr <= b;
  };

  return (
    <div className="flex-1">
      <h4 className="text-sm font-semibold text-gray-800 text-center mb-3">
        {MONTHS[month]} {year}
      </h4>
      <div className="grid grid-cols-7 gap-0">
        {DAYS.map((d) => (
          <div key={d} className="text-[10px] font-medium text-gray-400 text-center py-1">
            {d}
          </div>
        ))}
        {cells.map((day, i) => {
          if (!day) return <div key={`e-${i}`} />;
          const dateStr = getDateStr(day);
          const isFrom = dateStr === from;
          const isTo = dateStr === (to || hovering);
          const inRange = isInRange(dateStr);
          const isToday = dateStr === today;

          return (
            <button
              key={dateStr}
              type="button"
              onClick={() => onSelect(dateStr)}
              onMouseEnter={() => onHover(dateStr)}
              className={`relative h-9 text-sm transition-colors ${
                isFrom || isTo
                  ? "bg-[#6FB644] text-white font-semibold"
                  : inRange
                    ? "bg-[#6FB644]/10 text-[#6FB644]"
                    : "text-gray-700 hover:bg-gray-100"
              } ${isFrom ? "rounded-l" : ""} ${isTo ? "rounded-r" : ""}`}
            >
              {day}
              {isToday && !isFrom && !isTo && (
                <span className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-[#6FB644]" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default function DateRangePicker({
  isOpen,
  onClose,
  onApply,
  initialFrom = "",
  initialTo = "",
}: DateRangePickerProps) {
  const now = new Date();
  const [viewMonth, setViewMonth] = useState(now.getMonth());
  const [viewYear, setViewYear] = useState(now.getFullYear());
  const [from, setFrom] = useState(initialFrom);
  const [to, setTo] = useState(initialTo);
  const [hovering, setHovering] = useState("");
  const [selectingEnd, setSelectingEnd] = useState(false);

  if (!isOpen) return null;

  const prevMonth = () => {
    if (viewMonth === 0) { setViewMonth(11); setViewYear(viewYear - 1); }
    else setViewMonth(viewMonth - 1);
  };

  const nextMonth = () => {
    if (viewMonth === 11) { setViewMonth(0); setViewYear(viewYear + 1); }
    else setViewMonth(viewMonth + 1);
  };

  const nextMonthIdx = viewMonth === 11 ? 0 : viewMonth + 1;
  const nextMonthYear = viewMonth === 11 ? viewYear + 1 : viewYear;

  const handleSelect = (dateStr: string) => {
    if (!selectingEnd) {
      setFrom(dateStr);
      setTo("");
      setSelectingEnd(true);
    } else {
      if (dateStr < from) {
        setTo(from);
        setFrom(dateStr);
      } else {
        setTo(dateStr);
      }
      setSelectingEnd(false);
    }
  };

  const applyPreset = (days: number) => {
    const end = new Date();
    const start = new Date();
    start.setDate(end.getDate() - days);
    setFrom(toDateStr(start));
    setTo(toDateStr(end));
    setSelectingEnd(false);
  };

  const handleApply = () => {
    if (from && to) {
      onApply(from, to);
      onClose();
    }
  };

  return (
    <>
      <div className="fixed inset-0 bg-black/30 z-50" onClick={onClose} />
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl">
          {/* Header */}
          <div className="flex items-center justify-between px-5 py-4">
            <h3 className="font-semibold text-gray-800">Select Date Range</h3>
            <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded">
              <X className="w-5 h-5 text-gray-400" />
            </button>
          </div>

          {/* Selected range display */}
          <div className="px-5 pb-3 flex items-center gap-3">
            <div className={`flex-1 px-3 py-2 border rounded-lg text-sm ${from ? "border-[#6FB644] text-gray-800" : "border-gray-200 text-gray-400"}`}>
              {from || "Start date"}
            </div>
            <span className="text-gray-400 text-sm">→</span>
            <div className={`flex-1 px-3 py-2 border rounded-lg text-sm ${to ? "border-[#6FB644] text-gray-800" : "border-gray-200 text-gray-400"}`}>
              {to || "End date"}
            </div>
          </div>

          {/* Navigation */}
          <div className="flex items-center justify-between px-5 py-2">
            <button onClick={prevMonth} className="p-1.5 hover:bg-gray-100 rounded">
              <ChevronLeft className="w-4 h-4 text-gray-600" />
            </button>
            <button onClick={nextMonth} className="p-1.5 hover:bg-gray-100 rounded">
              <ChevronRight className="w-4 h-4 text-gray-600" />
            </button>
          </div>

          {/* Two month calendars */}
          <div className="px-5 pb-4 flex gap-6">
            <CalendarMonth
              year={viewYear}
              month={viewMonth}
              from={from}
              to={to}
              hovering={selectingEnd ? hovering : ""}
              onSelect={handleSelect}
              onHover={setHovering}
            />
            <CalendarMonth
              year={nextMonthYear}
              month={nextMonthIdx}
              from={from}
              to={to}
              hovering={selectingEnd ? hovering : ""}
              onSelect={handleSelect}
              onHover={setHovering}
            />
          </div>

          {/* Quick presets */}
          <div className="px-5 pb-4 flex flex-wrap gap-2">
            {[
              { label: "Today", days: 0 },
              { label: "Last 7 days", days: 7 },
              { label: "Last 14 days", days: 14 },
              { label: "Last 30 days", days: 30 },
              { label: "Last 90 days", days: 90 },
            ].map(({ label, days }) => (
              <button
                key={label}
                type="button"
                onClick={() => applyPreset(days)}
                className="px-3 py-1.5 text-xs font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
              >
                {label}
              </button>
            ))}
          </div>

          {/* Footer */}
          <div className="px-5 py-4 flex justify-end gap-3 border-t border-gray-100">
            <button onClick={onClose} className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg">
              Cancel
            </button>
            <button
              onClick={handleApply}
              disabled={!from || !to}
              className="px-5 py-2 text-sm font-medium text-white bg-[#6FB644] rounded-lg hover:bg-[#5a9636] disabled:opacity-40"
            >
              Apply Range
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
