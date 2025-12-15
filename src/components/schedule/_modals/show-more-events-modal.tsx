import EventStyled from "@/components/schedule/_components/view/event-component/event-styled";
import { useModal } from "@/providers/modal-context";
import { AppointmentEvent } from "@/types";
import React, { useEffect, useState } from "react";
import { CalendarIcon } from "lucide-react";
import { Case } from "@/generated/prisma";

export default function ShowMoreEventsModal() {
  const { data } = useModal();
  // Access data from the default modal (modalId defaults to "default")
  const modalData = data?.default || (data && Object.keys(data).length > 0 ? data[Object.keys(data)[0]] : null);
  
  console.log("Modal data:", data);
  console.log("Modal data (default):", modalData);
  console.log("Day events:", modalData?.dayEvents);
  
  const dayEvents = React.useMemo(
    () => {
      const events = modalData?.dayEvents;
      if (Array.isArray(events) && events.length > 0) {
        return events;
      }
      return [];
    },
    [modalData?.dayEvents]
  );
  const clients = modalData?.clients || [];
  const cases = modalData?.cases || [];

  const [events, setEvents] = useState<AppointmentEvent[]>(dayEvents);

  useEffect(() => {
    if (dayEvents && dayEvents.length > 0) {
      setEvents(dayEvents);
    }
  }, [dayEvents]);

  return (
    <div className="flex flex-col gap-2">
      {events.length > 0 ? (
        events.map((event: AppointmentEvent) => (
          <EventStyled
            clients={clients}
            cases={cases}
            onDelete={id => {
              setEvents(events.filter(event => event.id !== id));
            }}
            key={event.id}
            event={{
              ...event,
            }}
          />
        ))
      ) : (
        <div className="flex flex-col items-center justify-center py-6 text-center">
          <CalendarIcon className="h-12 w-12 text-primary mb-2" />
          <p className="text-lg font-medium text-primary">No events found</p>
          <p className="text-sm text-muted-foreground">
            There are no events scheduled for this day.
          </p>
        </div>
      )}
    </div>
  );
}
