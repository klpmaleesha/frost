'use client';
import { DayPicker, type DayPickerProps } from 'react-day-picker';
import 'react-day-picker/style.css';
export function Calendar(props:DayPickerProps){return <div className="av-calendar"><DayPicker showOutsideDays {...props}/></div>;}
