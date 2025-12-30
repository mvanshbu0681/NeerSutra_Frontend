import React from 'react';
import './DatePicker.css';

const DatePicker = ({ dates, selectedDate, onDateChange, isLoading }) => {
  if (!dates || dates.length === 0) {
    return (
      <div className="date-picker-container">
        <label className="date-picker-label">Select Date</label>
        <div className="date-picker-empty">No dates available</div>
      </div>
    );
  }

  return (
    <div className="date-picker-container">
      <label className="date-picker-label">Select Date</label>
      <select
        className="date-picker-select"
        value={selectedDate || ''}
        onChange={(e) => onDateChange(e.target.value)}
        disabled={isLoading}
      >
        <option value="">Latest Data</option>
        {dates.map((date) => (
          <option key={date.date_key} value={date.date_key}>
            {date.date_iso}
          </option>
        ))}
      </select>
      {isLoading && <div className="date-picker-loader"></div>}
    </div>
  );
};

export default DatePicker;
