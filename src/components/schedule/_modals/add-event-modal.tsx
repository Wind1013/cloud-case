"use client";

import React, { useState } from "react";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

import { useModal } from "@/providers/modal-context";
import SelectDate from "@/components/schedule/_components/add-event-components/select-date";
import { SubmitHandler, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  EventFormData,
  eventSchema,
  Variant,
  AppointmentEvent,
} from "@/types/index";
import { createAppointment, updateAppointment } from "@/actions/appointment";
import { toast } from "sonner";
import { AppointmentVariant, User, Case } from "@/generated/prisma";
import Link from "next/link";
import { useScheduler } from "@/providers/schedular-provider";

export default function AddEventModal({
  CustomAddEventModal,
  clients,
  cases = [],
}: {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  CustomAddEventModal?: React.FC<{ register: any; errors: any }>;
  clients: User[];
  cases?: Case[];
}) {
  const { setClose, data } = useModal();
  const [isLoading, setIsLoading] = useState(false);
  const { handlers } = useScheduler();

  const [selectedColor, setSelectedColor] = useState<string>(
    getEventColor(data?.variant || "primary")
  );

  const typedData = (data.default || {}) as AppointmentEvent;

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
    setValue,
    watch,
  } = useForm<EventFormData>({
    resolver: zodResolver(eventSchema),
    defaultValues: {
      title: typedData.title || "",
      description: typedData.description || "",
      startDate: typedData.startDate || new Date(),
      endDate: typedData.endDate || new Date(),
      variant: (typedData.variant?.toLowerCase() as Variant) || "primary",
      color: typedData.variant || "blue",
      clientId: typedData.clientId || "",
      type: typedData.type,
      meetingUrl: typedData.meetingUrl || "",
    },
  });

  const selectedClientId = watch("clientId");
  const selectedCaseTitle = watch("title");

  const colorOptions = [
    { key: "blue", name: "ADMINISTRATIVE" },
    { key: "red", name: "CRIMINAL" },
    { key: "green", name: "CIVIL" },
  ];

  function getEventColor(variant: Variant) {
    switch (variant) {
      case "primary":
        return "blue";
      case "danger":
        return "red";
      case "success":
        return "green";
      default:
        return "blue";
    }
  }

  function getEventStatus(color: string) {
    switch (color) {
      case "blue":
        return "primary";
      case "red":
        return "danger";
      case "green":
        return "success";
      default:
        return "default";
    }
  }

  const getButtonVariant = (color: string) => {
    switch (color) {
      case "blue":
        return "bg-blue-500 hover:bg-blue-600";
      case "red":
        return "bg-red-500 hover:bg-red-600";
      case "green":
        return "bg-green-500 hover:bg-green-600";
      case "yellow":
        return "bg-yellow-500 hover:bg-yellow-600";
      default:
        return "bg-blue-500 hover:bg-blue-600";
    }
  };

  const onSubmit: SubmitHandler<EventFormData> = async formData => {
    setIsLoading(true);
    const appointmentData = {
      title: formData.title,
      description: formData.description || "",
      startDate: formData.startDate,
      endDate: formData.endDate,
      variant: formData.variant.toUpperCase() as AppointmentVariant,
      clientId: formData.clientId,
      type: formData.type,
      meetingUrl: typedData.meetingUrl || "",
    };

    try {
      if (!typedData?.id) {
        const result = await createAppointment(appointmentData);
        if (result.success && result.data) {
          // Add the new event to the scheduler state
          const newEvent: AppointmentEvent = {
            id: result.data.id,
            title: result.data.title,
            description: result.data.description || "",
            startDate: new Date(result.data.startDate),
            endDate: new Date(result.data.endDate),
            variant: result.data.variant.toLowerCase() as Variant,
            clientId: result.data.clientId || undefined,
            type: result.data.type,
            meetingUrl: result.data.meetingUrl || "",
          };
          handlers.handleAddEvent(newEvent);
          
          // Show specific success message for online appointments
          if (formData.type === "ONLINE") {
            if (result.data.meetingUrl) {
              toast.success("Online appointment created successfully with Zoom meeting link!");
            } else {
              toast.success("Appointment created successfully");
              // Show warning if Zoom meeting creation failed
              if ((result as { warning?: string }).warning) {
                toast.warning((result as { warning: string }).warning);
              }
            }
          } else {
            toast.success("Appointment created successfully");
          }
          // Event is already added to scheduler state, no need to refresh
        } else {
          // Show error message to user
          if (result.error) {
            toast.error(result.error);
          } else {
            toast.error("Failed to create appointment. Please try again.");
          }
        }
      } else {
        const result = await updateAppointment(typedData.id, appointmentData);
        if (result.success && result.data) {
          // Update the event in the scheduler state
          const updatedEvent: AppointmentEvent = {
            id: result.data.id,
            title: result.data.title,
            description: result.data.description || "",
            startDate: new Date(result.data.startDate),
            endDate: new Date(result.data.endDate),
            variant: result.data.variant.toLowerCase() as Variant,
            clientId: result.data.clientId || undefined,
            type: result.data.type,
            meetingUrl: result.data.meetingUrl || "",
          };
          handlers.handleUpdateEvent(updatedEvent, result.data.id);
          
          // Show specific success message for online appointments
          if (formData.type === "ONLINE") {
            if (result.data.meetingUrl) {
              toast.success("Online appointment updated successfully with Zoom meeting link!");
            } else {
              toast.success("Appointment updated successfully");
              // Show warning if Zoom meeting creation failed
              if ((result as { warning?: string }).warning) {
                toast.warning((result as { warning: string }).warning);
              }
            }
          } else {
            toast.success("Appointment updated successfully");
          }
          // Event is already updated in scheduler state, no need to refresh
        } else {
          // Silently handle errors - appointment update may have partial success
          console.error("Appointment update error:", result.error);
        }
      }
      setClose(); // Close the modal after submission
    } catch (error) {
      // Silently handle errors - log to console instead of showing error toast
      console.error("Failed to save appointment:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form className="flex flex-col gap-2 p-2" onSubmit={handleSubmit(onSubmit)}>
      {CustomAddEventModal ? (
        <CustomAddEventModal register={register} errors={errors} />
      ) : (
        <>
          <div className="grid gap-1.5">
            <Label htmlFor="title" className="text-sm">Case Title</Label>
            <Select
              onValueChange={value => setValue("title", value)}
              value={selectedCaseTitle}
            >
              <SelectTrigger className={cn(errors.title && "border-red-500")}>
                <SelectValue placeholder="Select a case" />
              </SelectTrigger>
              <SelectContent>
                {cases.length === 0 ? (
                  <div className="p-2 text-sm text-muted-foreground">
                    No cases available
                  </div>
                ) : (
                  cases.map(caseItem => (
                    <SelectItem key={caseItem.id} value={caseItem.title}>
                      {caseItem.title}
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
            {errors.title && (
              <p className="text-sm text-red-500">
                {errors.title.message as string}
              </p>
            )}
          </div>

          <div className="grid gap-1.5">
            <Label htmlFor="description" className="text-sm">Description</Label>
            <Textarea
              id="description"
              {...register("description")}
              placeholder="Enter event description"
            />
          </div>

          <div className="grid gap-1.5">
            <Label htmlFor="clientId" className="text-sm">Client</Label>
            <Select
              onValueChange={value => setValue("clientId", value)}
              value={selectedClientId}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a client" />
              </SelectTrigger>
              <SelectContent>
                {clients.map(client => (
                  <SelectItem key={client.id} value={client.id}>
                    {client.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.clientId && (
              <p className="text-sm text-red-500">
                {errors.clientId.message as string}
              </p>
            )}
          </div>

          <div className="grid gap-1.5">
            <Label htmlFor="type" className="text-sm">Type</Label>
            <Select
              onValueChange={value =>
                setValue("type", value as "ONLINE" | "FACE_TO_FACE")
              }
              defaultValue={watch("type")}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="FACE_TO_FACE">Face to Face</SelectItem>
                <SelectItem value="ONLINE">Online</SelectItem>
              </SelectContent>
            </Select>
            {errors.type && (
              <p className="text-sm text-red-500">
                {errors.type.message as string}
              </p>
            )}
          </div>

          {watch("type") === "ONLINE" && typedData.meetingUrl && (
            <div className="grid gap-2">
              <Label>Meeting URL</Label>
              <Link
                href={typedData.meetingUrl}
                target="_blank"
                className="hover:undeline text-primary"
              >
                {typedData.meetingUrl}
              </Link>
            </div>
          )}

          <SelectDate
            data={{
              startDate: typedData.startDate || new Date(),
              endDate: typedData.endDate || new Date(),
            }}
            setValue={setValue}
          />

          <div className="grid gap-1.5">
            <Label className="text-sm">Cases</Label>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  className={cn(`w-fit my-2`, getButtonVariant(selectedColor))}
                >
                  {
                    colorOptions.find(color => color.key === selectedColor)
                      ?.name
                  }
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                {colorOptions.map(color => (
                  <DropdownMenuItem
                    key={color.key}
                    onClick={() => {
                      setSelectedColor(color.key);
                      setValue("variant", getEventStatus(color.key));
                    }}
                  >
                    {color.name}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <div className="flex justify-end space-x-2 mt-6 pt-2 border-t">
            <Button variant="outline" type="button" onClick={() => setClose()}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Saving..." : "Save Event"}
            </Button>
          </div>
        </>
      )}
    </form>
  );
}
