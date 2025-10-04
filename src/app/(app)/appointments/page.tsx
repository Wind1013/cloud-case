"use client";

import SchedulerWrapper from "@/components/schedule/_components/wrapper/schedular-wrapper";
import { SchedulerProvider } from "@/providers/schedular-provider";

const Appointment = () => {
  return (
    <div className="pt-4 px-8">
      <SchedulerProvider weekStartsOn="monday">
        <SchedulerWrapper
        // stopDayEventSummary={true}
        // classNames={{
        //   tabs: {
        //     panel: "p-0",
        //   },
        // }}
        />
      </SchedulerProvider>
    </div>
  );
};
export default Appointment;
