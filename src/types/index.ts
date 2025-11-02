import { Dispatch, SVGProps } from "react";
import { z } from "zod";

export type IconSvgProps = SVGProps<SVGSVGElement> & {
  size?: number;
};

// SchedulerTypes.ts

// Define event type
export type AppointmentEvent = {
  id: string;
  title: string;
  description?: string;
  startDate: Date;
  endDate: Date;
  variant?: Variant;
  clientId?: string;
  type: "ONLINE" | "FACE_TO_FACE";
  meetingUrl?: string;
};

// Define the state interface for the scheduler
export interface SchedulerState {
  events: AppointmentEvent[];
}

// Define actions for reducer
export type Action =
  | { type: "ADD_EVENT"; payload: AppointmentEvent }
  | { type: "REMOVE_EVENT"; payload: { id: string } }
  | { type: "UPDATE_EVENT"; payload: AppointmentEvent }
  | { type: "SET_EVENTS"; payload: AppointmentEvent[] };

// Define handlers interface
export interface Handlers {
  handleEventStyling: (
    event: AppointmentEvent,
    dayEvents: AppointmentEvent[],
    periodOptions?: {
      eventsInSamePeriod?: number;
      periodIndex?: number;
      adjustForPeriod?: boolean;
    }
  ) => {
    height: string;
    left: string;
    maxWidth: string;
    minWidth: string;
    top: string;
    zIndex: number;
  };
  handleAddEvent: (event: AppointmentEvent) => void;
  handleUpdateEvent: (event: AppointmentEvent, id: string) => void;
  handleDeleteEvent: (id: string) => void;
}

// Define getters interface
export interface Getters {
  getDaysInMonth: (
    month: number,
    year: number
  ) => { day: number; events: AppointmentEvent[] }[];
  getEventsForDay: (day: number, currentDate: Date) => AppointmentEvent[];
  getDaysInWeek: (week: number, year: number) => Date[];
  getWeekNumber: (date: Date) => number;
  getDayName: (day: number) => string;
}

// Define the context value interface
export interface SchedulerContextType {
  events: SchedulerState;
  dispatch: Dispatch<Action>;
  getters: Getters;
  handlers: Handlers;
  weekStartsOn: startOfWeek;
}

// Define the variant options
export const variants = [
  "success",
  "primary",
  "default",
  "warning",
  "danger",
] as const;

export type Variant = (typeof variants)[number];

// Define Zod schema for form validation
export const eventSchema = z.object({
  title: z.string().nonempty("Event name is required"),
  description: z.string().optional(),
  startDate: z.date(),
  endDate: z.date(),
  variant: z.enum(["primary", "danger", "success", "warning", "default"]),
  color: z.string().nonempty("Color selection is required"),
  clientId: z.string().nonempty("Client is required"),
  type: z.enum(["ONLINE", "FACE_TO_FACE"]),
  meetingUrl: z.string().optional(),
});

export type EventFormData = z.infer<typeof eventSchema>;

export type Views = {
  mobileViews?: string[];
  views?: string[];
};

export type startOfWeek = "sunday" | "monday";

export interface CustomEventModal {
  CustomAddEventModal?: {
    title?: string;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    CustomForm?: React.FC<{ register: any; errors: any }>;
  };
}

export interface CustomComponents {
  customButtons?: {
    CustomAddEventButton?: React.ReactNode;
    CustomPrevButton?: React.ReactNode;
    CustomNextButton?: React.ReactNode;
  };

  customTabs?: {
    CustomDayTab?: React.ReactNode;
    CustomWeekTab?: React.ReactNode;
    CustomMonthTab?: React.ReactNode;
  };
  CustomEventComponent?: React.FC<AppointmentEvent>; // Using custom event type
  CustomEventModal?: CustomEventModal;
}

export interface ButtonClassNames {
  prev?: string;
  next?: string;
  addEvent?: string;
}

export interface TabClassNames {
  view?: string;
}

export interface TabsClassNames {
  cursor?: string;
  panel?: string;
  tab?: string;
  tabContent?: string;
  tabList?: string;
  wrapper?: string;
}

export interface ViewClassNames {
  dayView?: string;
  weekView?: string;
  monthView?: string;
}

export interface ClassNames {
  event?: string;
  buttons?: ButtonClassNames;
  tabs?: TabsClassNames;
  views?: ViewClassNames;
}
