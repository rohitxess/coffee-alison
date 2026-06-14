'use client';

import { Calendar, dateFnsLocalizer } from 'react-big-calendar';
import format from 'date-fns/format';
import parse from 'date-fns/parse';
import startOfWeek from 'date-fns/startOfWeek';
import getDay from 'date-fns/getDay';
import enUS from 'date-fns/locale/en-US';
import 'react-big-calendar/lib/css/react-big-calendar.css';

const locales = { 'en-US': enUS };

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
});

export type CalendarEvent = {
  id: string;
  title: string;
  start: Date;
  end: Date;
  color?: string;
};

export function BigCalendar({
  events,
  onSelectSlot,
  onSelectEvent,
}: {
  events: CalendarEvent[];
  onSelectSlot?: (slot: { start: Date; end: Date }) => void;
  onSelectEvent?: (event: CalendarEvent) => void;
}) {
  return (
    <div style={{ height: '75vh', minHeight: '500px', minWidth: '700px' }}>
      <Calendar
        localizer={localizer}
        events={events}
        startAccessor="start"
        endAccessor="end"
        selectable
        onSelectSlot={onSelectSlot}
        onSelectEvent={onSelectEvent}
        style={{ height: '100%' }}
        eventPropGetter={(event: CalendarEvent) => ({
          style: {
            backgroundColor: event.color || '#2563eb',
            borderRadius: '6px',
            border: 'none',
            color: 'white',
            fontSize: '12px',
            fontWeight: '600',
          },
        })}
      />
    </div>
  );
}