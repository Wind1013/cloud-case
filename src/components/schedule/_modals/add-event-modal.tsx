"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
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
import { EventFormData, eventSchema, Variant, Event } from "@/types/index";
import { useScheduler } from "@/providers/schedular-provider";
import { createAppointment, updateAppointment } from "@/actions/appointment";
import { toast } from "sonner";
import { AppointmentVariant, User } from "@/generated/prisma";
import { FormControl } from "@/components/ui/form";

export default function AddEventModal({
  CustomAddEventModal,
  clients,
}: {
  CustomAddEventModal?: React.FC<{ register: any; errors: any }>;
  clients: User[];
}) {
  const { setClose, data } = useModal();
  const [isLoading, setIsLoading] = useState(false);

  const [selectedColor, setSelectedColor] = useState<string>(
    getEventColor(data?.variant || "primary")
  );

  const typedData = data as { default: Event };

  const { handlers } = useScheduler();

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
      title: data?.default?.title || "",
      description: data?.default?.description || "",
      startDate: data?.default?.startDate || new Date(),
      endDate: data?.default?.endDate || new Date(),
      variant: (data?.default?.variant?.toLowerCase() as Variant) || "primary",
      color: data?.default?.color || "blue",
      clientId: data?.default?.clientId || "",
    },
  });

  const selectedClientId = watch("clientId");

  const colorOptions = [
    { key: "blue", name: "Blue" },
    { key: "red", name: "Red" },
    { key: "green", name: "Green" },
    { key: "yellow", name: "Yellow" },
  ];

  function getEventColor(variant: Variant) {
    switch (variant) {
      case "primary":
        return "blue";
      case "danger":
        return "red";
      case "success":
        return "green";
      case "warning":
        return "yellow";
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
      case "yellow":
        return "warning";
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
      description: formData.description ?? null,
      startDate: formData.startDate,
      endDate: formData.endDate,
      variant: formData.variant.toUpperCase() as AppointmentVariant,
      clientId: formData.clientId,
    };

    try {
      if (!typedData?.default?.id) {
        await createAppointment(appointmentData);
        toast.success("Appointment created successfully");
      } else {
        await updateAppointment(typedData.default.id, appointmentData);
        toast.success("Appointment updated successfully");
      }
      setClose(); // Close the modal after submission
    } catch (error) {
      toast.error("Failed to save appointment");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form className="flex flex-col gap-4 p-4" onSubmit={handleSubmit(onSubmit)}>
      {CustomAddEventModal ? (
        <CustomAddEventModal register={register} errors={errors} />
      ) : (
        <>
          <div className="grid gap-2">
            <Label htmlFor="title">Event Name</Label>
            <Input
              id="title"
              {...register("title")}
              placeholder="Enter event name"
              className={cn(errors.title && "border-red-500")}
            />
            {errors.title && (
              <p className="text-sm text-red-500">
                {errors.title.message as string}
              </p>
            )}
          </div>

          <div className="grid gap-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              {...register("description")}
              placeholder="Enter event description"
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="clientId">Client</Label>
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

          <SelectDate
            data={{
              startDate: data?.default?.startDate || new Date(),
              endDate: data?.default?.endDate || new Date(),
            }}
            setValue={setValue}
          />

          <div className="grid gap-2">
            <Label>Color</Label>
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
                    <div className="flex items-center">
                      <div
                        style={{
                          backgroundColor: `var(--${color.key})`,
                        }}
                        className={`w-4 h-4 rounded-full mr-2`}
                      />
                      {color.name}
                    </div>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <div className="flex justify-end space-x-2 mt-4 pt-2 border-t">
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
