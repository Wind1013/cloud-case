import { User, Case } from "@/generated/prisma";
import React, { useRef, useState, useEffect, useCallback } from "react";
import { useScheduler } from "@/providers/schedular-provider";
import { Badge } from "@/components/ui/badge";
import { AnimatePresence, motion } from "framer-motion";
import { useModal } from "@/providers/modal-context";
import AddEventModal from "@/components/schedule/_modals/add-event-modal";
import EventStyled from "../event-component/event-styled";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft,
  ArrowRight,
  Maximize2,
  ChevronLeft,
  Maximize,
} from "lucide-react";
import clsx from "clsx";
import { AppointmentEvent, CustomEventModal } from "@/types";
import CustomModal from "@/components/ui/custom-modal";

const hours = Array.from({ length: 24 }, (_, i) => {
  const hour = i % 12 || 12;
  const ampm = i < 12 ? "AM" : "PM";
  return `${hour}:00 ${ampm}`;
});

// Helper function to check if a date is in the past
const isPastDate = (date: Date): boolean => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const compareDate = new Date(date);
  compareDate.setHours(0, 0, 0, 0);
  return compareDate < today;
};

// Animation Variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 5 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.12 } },
};

const pageTransitionVariants = {
  enter: (direction: number) => ({
    opacity: 0,
  }),
  center: {
    opacity: 1,
  },
};

export default function WeeklyView({
  prevButton,
  nextButton,
  CustomEventComponent,
  CustomEventModal,
  classNames,
  clients,
  cases,
}: {
  prevButton?: React.ReactNode;
  nextButton?: React.ReactNode;
  CustomEventComponent?: React.FC<AppointmentEvent>;
  CustomEventModal?: CustomEventModal;
  classNames?: { prev?: string; next?: string; addEvent?: string };
  clients: User[];
  cases: Case[];
}) {
  const { getters, handlers } = useScheduler();
  const hoursColumnRef = useRef<HTMLDivElement>(null);
  const [detailedHour, setDetailedHour] = useState<string | null>(null);
  const [timelinePosition, setTimelinePosition] = useState<number>(0);
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [colWidth, setColWidth] = useState<number[]>(Array(7).fill(1));
  const [isResizing, setIsResizing] = useState<boolean>(false);
  const [direction, setDirection] = useState<number>(0);
  const { setOpen } = useModal();

  const daysOfWeek = getters?.getDaysInWeek(
    getters?.getWeekNumber(currentDate),
    currentDate.getFullYear()
  );

  // Reset column widths when the date changes
  useEffect(() => {
    setColWidth(Array(7).fill(1));
  }, [currentDate]);

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
      if (!hoursColumnRef.current) return;
      const rect = hoursColumnRef.current.getBoundingClientRect();
      const y = e.clientY - rect.top;
      const hourHeight = rect.height / 24;
      const hour = Math.max(0, Math.min(23, Math.floor(y / hourHeight)));
      const minuteFraction = (y % hourHeight) / hourHeight;
      const minutes = Math.floor(minuteFraction * 60);

      const hour12 = hour % 12 || 12;
      const ampm = hour < 12 ? "AM" : "PM";
      setDetailedHour(
        `${hour12}:${minutes.toString().padStart(2, "0")} ${ampm}`
      );

      const headerOffset = 83;
      const position =
        Math.max(0, Math.min(rect.height, Math.round(y))) + headerOffset;
      setTimelinePosition(position);
    },
    []
  );

  function handleAddEvent(event?: AppointmentEvent) {
    const startDate = event?.startDate || new Date();
    const endDate = event?.endDate || new Date();

    setOpen(
      <CustomModal title="Add Cases">
        <AddEventModal
          clients={clients}
          cases={cases}
          CustomAddEventModal={
            CustomEventModal?.CustomAddEventModal?.CustomForm
          }
        />
      </CustomModal>,
      async () => {
        return {
          ...event,
          startDate,
          endDate,
        };
      }
    );
  }

  const handleNextWeek = useCallback(() => {
    setDirection(1);
    const nextWeek = new Date(currentDate);
    nextWeek.setDate(currentDate.getDate() + 7);
    setCurrentDate(nextWeek);
  }, [currentDate]);

  const handlePrevWeek = useCallback(() => {
    setDirection(-1);
    const prevWeek = new Date(currentDate);
    prevWeek.setDate(currentDate.getDate() - 7);
    setCurrentDate(prevWeek);
  }, [currentDate]);

  function handleAddEventWeek(dayIndex: number, detailedHour: string) {
    if (!detailedHour) {
      console.error("Detailed hour not provided.");
      return;
    }

    const [timePart, ampm] = detailedHour.split(" ");
    const [hourStr, minuteStr] = timePart.split(":");
    let hours = parseInt(hourStr);
    const minutes = parseInt(minuteStr);

    if (ampm === "PM" && hours < 12) {
      hours += 12;
    } else if (ampm === "AM" && hours === 12) {
      hours = 0;
    }

    const chosenDay = daysOfWeek[dayIndex % 7].getDate();

    if (chosenDay < 1 || chosenDay > 31) {
      console.error("Invalid day selected:", chosenDay);
      return;
    }

    const date = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth(),
      chosenDay,
      hours,
      minutes
    );

    // Prevent creating appointments on past dates
    if (isPastDate(date)) {
      console.warn("Cannot create appointment on a past date");
      return;
    }

    handleAddEvent({
      startDate: date,
      endDate: new Date(date.getTime() + 60 * 60 * 1000),
      title: "",
      id: "",
      variant: "primary",
      type: "FACE_TO_FACE",
    });
  }

  const groupEventsByTimePeriod = (events: AppointmentEvent[] | undefined) => {
    if (!events || events.length === 0) return [];

    const sortedEvents = [...events].sort(
      (a, b) =>
        new Date(a.startDate).getTime() - new Date(b.startDate).getTime()
    );

    const eventsOverlap = (
      event1: AppointmentEvent,
      event2: AppointmentEvent
    ) => {
      const start1 = new Date(event1.startDate).getTime();
      const end1 = new Date(event1.endDate).getTime();
      const start2 = new Date(event2.startDate).getTime();
      const end2 = new Date(event2.endDate).getTime();

      return start1 < end2 && start2 < end1;
    };

    const graph: Record<string, Set<string>> = {};

    for (const event of sortedEvents) {
      graph[event.id] = new Set<string>();
    }

    for (let i = 0; i < sortedEvents.length; i++) {
      for (let j = i + 1; j < sortedEvents.length; j++) {
        if (eventsOverlap(sortedEvents[i], sortedEvents[j])) {
          graph[sortedEvents[i].id].add(sortedEvents[j].id);
          graph[sortedEvents[j].id].add(sortedEvents[i].id);
        }
      }
    }

    const visited = new Set<string>();
    const groups: AppointmentEvent[][] = [];

    for (const event of sortedEvents) {
      if (!visited.has(event.id)) {
        const group: AppointmentEvent[] = [];
        const stack: AppointmentEvent[] = [event];
        visited.add(event.id);

        while (stack.length > 0) {
          const current = stack.pop()!;
          group.push(current);

          for (const neighborId of graph[current.id]) {
            if (!visited.has(neighborId)) {
              const neighbor = sortedEvents.find(e => e.id === neighborId);
              if (neighbor) {
                stack.push(neighbor);
                visited.add(neighborId);
              }
            }
          }
        }

        group.sort(
          (a, b) =>
            new Date(a.startDate).getTime() - new Date(b.startDate).getTime()
        );

        groups.push(group);
      }
    }

    return groups;
  };

  return (
    <div className="flex flex-col gap-4 pb-6">
      <div className="flex justify-between items-center mb-2">
        <div className="flex ml-auto gap-3">
          {prevButton ? (
            <div onClick={handlePrevWeek}>{prevButton}</div>
          ) : (
            <Button
              variant="outline"
              className={classNames?.prev}
              onClick={handlePrevWeek}
            >
              <ArrowLeft />
              Prev
            </Button>
          )}
          {nextButton ? (
            <div onClick={handleNextWeek}>{nextButton}</div>
          ) : (
            <Button
              variant="outline"
              className={classNames?.next}
              onClick={handleNextWeek}
            >
              Next
              <ArrowRight />
            </Button>
          )}
        </div>
      </div>

      <AnimatePresence initial={false} custom={direction} mode="wait">
        <motion.div
          key={currentDate.toISOString()}
          custom={direction}
          variants={pageTransitionVariants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{
            opacity: { duration: 0.2 },
          }}
          className="use-automation-zoom-in"
        >
          <div className="grid grid-cols-8 gap-0">
            {/* Month Header - Sticky */}
            <div className="sticky top-0 left-0 z-30 bg-default-100 rounded-tl-lg h-[83px] border-0 flex items-center justify-center bg-primary-200">
              <span className="text-xl tracking-tight font-semibold">
                {currentDate.toLocaleString("default", { month: "long" })}
              </span>
            </div>

            {/* Days of Week Header - Sticky */}
            <div className="col-span-7 sticky top-0 z-20">
              <div
                className="grid gap-0 bg-primary-200 rounded-r-lg"
                style={{
                  gridTemplateColumns: colWidth.map(w => `${w}fr`).join(" "),
                  transition: isResizing
                    ? "none"
                    : "grid-template-columns 0.3s ease-in-out",
                }}
              >
                {daysOfWeek.map((day, idx) => (
                  <div key={idx} className="relative group flex flex-col">
                    <div className="bg-default-100 flex-grow flex items-center justify-center h-[83px]">
                      <div className="text-center p-4">
                        <div className="text-lg font-semibold">
                          {getters.getDayName(day.getDay())}
                        </div>
                        <div
                          className={clsx(
                            "text-lg font-semibold",
                            isPastDate(day)
                              ? "text-red-500"
                              : new Date().getDate() === day.getDate() &&
                                new Date().getMonth() ===
                                  currentDate.getMonth() &&
                                new Date().getFullYear() ===
                                  currentDate.getFullYear()
                              ? "text-secondary-500"
                              : ""
                          )}
                        >
                          {day.getDate()}
                        </div>

                        <div
                          className={clsx(
                            "absolute top-5 right-10 transition-opacity",
                            isPastDate(day)
                              ? "cursor-not-allowed opacity-30"
                              : "cursor-pointer opacity-0 group-hover:opacity-100"
                          )}
                          onClick={e => {
                            if (isPastDate(day)) {
                              e.stopPropagation();
                              return;
                            }
                            e.stopPropagation();

                            const selectedDay = new Date(
                              currentDate.getFullYear(),
                              currentDate.getMonth(),
                              day.getDate()
                            );

                            const dayEvents = getters.getEventsForDay(
                              day.getDate(),
                              currentDate
                            );

                            setOpen(
                              <CustomModal
                                title={`${getters.getDayName(
                                  day.getDay()
                                )} ${day.getDate()}, ${selectedDay.getFullYear()}`}
                              >
                                <div className="flex flex-col space-y-4 p-4">
                                  <div className="flex items-center mb-4">
                                    <ChevronLeft
                                      className="cursor-pointer hover:text-primary mr-2"
                                      onClick={() => setOpen(null)}
                                    />
                                    <h2 className="text-2xl font-bold">
                                      {selectedDay.toDateString()}
                                    </h2>
                                  </div>

                                  {dayEvents && dayEvents.length > 0 ? (
                                    <div className="space-y-4">
                                      <div className="relative bg-default-50 rounded-lg p-4 min-h-[500px]">
                                        <div className="grid grid-cols-[100px_1fr] h-full">
                                          <div className="flex flex-col">
                                            {hours.map((hour, index) => (
                                              <div
                                                key={`hour-${index}`}
                                                className="h-16 p-2 text-sm text-muted-foreground border-r border-b border-default-200"
                                              >
                                                {hour}
                                              </div>
                                            ))}
                                          </div>

                                          <div className="relative">
                                            {Array.from({ length: 24 }).map(
                                              (_, index) => (
                                                <div
                                                  key={`grid-${index}`}
                                                  className="h-16 border-b border-default-200"
                                                />
                                              )
                                            )}

                                            {dayEvents.map(event => {
                                              const timeGroups =
                                                groupEventsByTimePeriod(
                                                  dayEvents
                                                );

                                              let eventsInSamePeriod = 1;
                                              let periodIndex = 0;

                                              for (
                                                let i = 0;
                                                i < timeGroups.length;
                                                i++
                                              ) {
                                                const groupIndex = timeGroups[
                                                  i
                                                ].findIndex(
                                                  e => e.id === event.id
                                                );
                                                if (groupIndex !== -1) {
                                                  eventsInSamePeriod =
                                                    timeGroups[i].length;
                                                  periodIndex = groupIndex;
                                                  break;
                                                }
                                              }

                                              const {
                                                height,
                                                top,
                                                left,
                                                maxWidth,
                                                minWidth,
                                              } = handlers.handleEventStyling(
                                                event,
                                                dayEvents,
                                                {
                                                  eventsInSamePeriod,
                                                  periodIndex,
                                                  adjustForPeriod: true,
                                                }
                                              );

                                              return (
                                                <div
                                                  key={event.id}
                                                  style={{
                                                    position: "absolute",
                                                    height,
                                                    top,
                                                    left,
                                                    maxWidth,
                                                    minWidth,
                                                    padding: "0 2px",
                                                    boxSizing: "border-box",
                                                  }}
                                                >
                                                  <EventStyled
                                                    clients={clients}
                                                    cases={cases}
                                                    event={{
                                                      ...event,
                                                      CustomEventComponent,
                                                      minmized: true,
                                                    }}
                                                    CustomEventModal={
                                                      CustomEventModal
                                                    }
                                                  />
                                                </div>
                                              );
                                            })}
                                          </div>
                                        </div>
                                      </div>

                                      <div className="bg-card rounded-lg p-4">
                                        <h3 className="text-lg font-semibold mb-4">
                                          All Events
                                        </h3>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                          {dayEvents.map(event => (
                                            <div
                                              key={event.id}
                                              className={`p-4 rounded-lg shadow-sm border-l-4 border-${event.variant} hover:shadow-md transition-shadow`}
                                            >
                                              <EventStyled
                                                clients={clients}
                                                cases={cases}
                                                event={{
                                                  ...event,
                                                  CustomEventComponent,
                                                  minmized: false,
                                                }}
                                                CustomEventModal={
                                                  CustomEventModal
                                                }
                                              />
                                            </div>
                                          ))}
                                        </div>
                                      </div>
                                    </div>
                                  ) : (
                                    <div className="text-center py-10 text-muted-foreground">
                                      <p>No events scheduled for this day</p>
                                      {!isPastDate(day) && (
                                        <Button
                                          variant="outline"
                                          className="mt-4"
                                          onClick={() => {
                                            handleAddEventWeek(
                                              idx,
                                              detailedHour || "12:00 PM"
                                            );
                                          }}
                                        >
                                          Add Cases
                                        </Button>
                                      )}
                                      {isPastDate(day) && (
                                        <p className="mt-4 text-sm text-red-500">
                                          Cannot add appointments to past dates
                                        </p>
                                      )}
                                    </div>
                                  )}
                                </div>
                              </CustomModal>
                            );
                          }}
                        >
                          <Maximize
                            size={16}
                            className="text-muted-foreground hover:text-primary"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Hours and Events Grid */}
            <div
              ref={hoursColumnRef}
              onMouseMove={handleMouseMove}
              onMouseLeave={() => setDetailedHour(null)}
              className="relative grid grid-cols-8 col-span-8"
            >
              <div className="col-span-1 bg-default-50 hover:bg-default-100 transition duration-400">
                {hours.map((hour, index) => (
                  <motion.div
                    key={`hour-${index}`}
                    variants={itemVariants}
                    className="cursor-pointer border-b border-default-200 p-[16px] h-[64px] text-center text-sm text-muted-foreground border-r"
                  >
                    {hour}
                  </motion.div>
                ))}
              </div>

              <div
                className="col-span-7 bg-default-50 grid h-full relative"
                style={{
                  gridTemplateColumns: colWidth.map(w => `${w}fr`).join(" "),
                  transition: isResizing
                    ? "none"
                    : "grid-template-columns 0.3s ease-in-out",
                }}
              >
                {detailedHour && (
                  <div
                    className="absolute flex z-50 left-0 w-full h-[2px] bg-primary/40 rounded-full pointer-events-none"
                    style={{ top: `${timelinePosition - 83}px` }}
                  >
                    <Badge
                      variant="outline"
                      className="absolute -translate-y-1/2 bg-white z-50 left-[5px] text-xs"
                    >
                      {detailedHour}
                    </Badge>
                  </div>
                )}

                {Array.from({ length: 7 }, (_, dayIndex) => {
                  const dayEvents = getters.getEventsForDay(
                    daysOfWeek[dayIndex % 7].getDate(),
                    currentDate
                  );

                  const timeGroups = groupEventsByTimePeriod(dayEvents);

                  const eventsCount = dayEvents?.length || 0;
                  const maxEventsToShow = 10;
                  const hasMoreEvents = eventsCount > maxEventsToShow;

                  const visibleEvents = hasMoreEvents
                    ? dayEvents?.slice(0, maxEventsToShow - 1)
                    : dayEvents;

                  const dayDate = daysOfWeek[dayIndex % 7];
                  const isPast = isPastDate(dayDate);

                  return (
                    <div
                      key={`day-${dayIndex}`}
                      className={clsx(
                        "col-span-1 border-default-200 z-20 relative transition duration-300 border-r border-b text-center text-sm text-muted-foreground overflow-hidden",
                        isPast ? "cursor-not-allowed opacity-50 bg-red-50" : "cursor-pointer"
                      )}
                      onClick={() => {
                        if (isPast) return;
                        handleAddEventWeek(dayIndex, detailedHour as string);
                      }}
                    >
                      <AnimatePresence initial={false}>
                        {visibleEvents?.map((event, eventIndex) => {
                          let eventsInSamePeriod = 1;
                          let periodIndex = 0;

                          for (let i = 0; i < timeGroups.length; i++) {
                            const groupIndex = timeGroups[i].findIndex(
                              e => e.id === event.id
                            );
                            if (groupIndex !== -1) {
                              eventsInSamePeriod = timeGroups[i].length;
                              periodIndex = groupIndex;
                              break;
                            }
                          }

                          const {
                            height,
                            left,
                            maxWidth,
                            minWidth,
                            top,
                            zIndex,
                          } = handlers.handleEventStyling(event, dayEvents, {
                            eventsInSamePeriod,
                            periodIndex,
                            adjustForPeriod: true,
                          });

                          return (
                            <motion.div
                              key={event.id}
                              style={{
                                minHeight: height,
                                height,
                                top: top,
                                left: left,
                                maxWidth: maxWidth,
                                minWidth: minWidth,
                                padding: "0 2px",
                                boxSizing: "border-box",
                              }}
                              className="flex transition-all duration-1000 flex-grow flex-col z-50 absolute"
                              initial={{ opacity: 0, scale: 0.9 }}
                              animate={{ opacity: 1, scale: 1 }}
                              exit={{ opacity: 0, scale: 0.9 }}
                              transition={{ duration: 0.2 }}
                            >
                              <EventStyled
                                clients={clients}
                                cases={cases}
                                event={{
                                  ...event,
                                  CustomEventComponent,
                                  minmized: true,
                                }}
                                CustomEventModal={CustomEventModal}
                              />
                            </motion.div>
                          );
                        })}

                        {hasMoreEvents && (
                          <motion.div
                            key={`more-events-${dayIndex}`}
                            style={{
                              bottom: "10px",
                              right: "10px",
                              position: "absolute",
                            }}
                            className="z-50"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                          >
                            <Badge
                              variant="secondary"
                              className="cursor-pointer hover:bg-accent"
                              onClick={e => {
                                e.stopPropagation();
                                setOpen(
                                  <CustomModal
                                    title={`Events for ${daysOfWeek[
                                      dayIndex
                                    ].toDateString()}`}
                                  >
                                    <div className="space-y-2 p-2 max-h-[80vh] overflow-y-auto">
                                      {dayEvents?.map(event => (
                                        <EventStyled
                                          key={event.id}
                                          clients={clients}
                                          cases={cases}
                                          event={{
                                            ...event,
                                            CustomEventComponent,
                                            minmized: false,
                                          }}
                                          CustomEventModal={CustomEventModal}
                                        />
                                      ))}
                                    </div>
                                  </CustomModal>
                                );
                              }}
                            >
                              +{eventsCount - (maxEventsToShow - 1)} more
                            </Badge>
                          </motion.div>
                        )}
                      </AnimatePresence>

                      {Array.from({ length: 24 }, (_, hourIndex) => (
                        <div
                          key={`day-${dayIndex}-hour-${hourIndex}`}
                          className="col-span-1 border-default-200 h-[64px] relative transition duration-300 cursor-pointer border-r border-b text-center text-sm text-muted-foreground"
                        >
                          <div className="absolute bg-accent z-40 flex items-center justify-center text-xs opacity-0 transition duration-250 hover:opacity-100 w-full h-full">
                            Add Cases
                          </div>
                        </div>
                      ))}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
