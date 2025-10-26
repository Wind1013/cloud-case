"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useState, useTransition } from "react";
import { updateCaseStatus } from "@/actions/cases";
import { toast } from "sonner";
import { CaseData } from "./case-data-table";
import { IconClock, IconLoader, IconCheck } from "@tabler/icons-react";

interface ChangeStatusModalProps {
  caseData: CaseData;
  isOpen: boolean;
  onClose: () => void;
}

const criminalStatuses: CaseData["status"][] = [
  "ARRAIGNMENT",
  "PRETRIAL",
  "TRIAL",
  "PROMULGATION",
  "REMEDIES",
];
const otherStatuses: CaseData["status"][] = [
  "PRELIMINARY_CONFERENCE",
  "TRIAL",
  "DECISION",
];

const statusConfig = {
  ARRAIGNMENT: {
    icon: IconClock,
    color: "text-yellow-600",
  },
  PRETRIAL: {
    icon: IconLoader,
    color: "text-blue-600",
  },
  TRIAL: {
    icon: IconLoader,
    color: "text-blue-600",
  },
  PROMULGATION: {
    icon: IconCheck,
    color: "text-green-600",
  },
  REMEDIES: {
    icon: IconCheck,
    color: "text-green-600",
  },
  PRELIMINARY_CONFERENCE: {
    icon: IconClock,
    color: "text-yellow-600",
  },
  DECISION: {
    icon: IconCheck,
    color: "text-green-600",
  },
};

export function ChangeStatusModal({
  caseData,
  isOpen,
  onClose,
}: ChangeStatusModalProps) {
  const [selectedStatus, setSelectedStatus] = useState<CaseData["status"]>(
    caseData.status
  );
  const [isPending, startTransition] = useTransition();

  const availableStatuses =
    caseData.type === "CRIMINAL" ? criminalStatuses : otherStatuses;

  const handleSave = () => {
    startTransition(async () => {
      const result = await updateCaseStatus(caseData.id, selectedStatus);
      if (result.success) {
        toast.success("Case status updated successfully");
        onClose();
      } else {
        toast.error(result.error);
      }
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Change Case Status</DialogTitle>
        </DialogHeader>
        <div>
          <Select
            value={selectedStatus}
            onValueChange={(value: CaseData["status"]) =>
              setSelectedStatus(value)
            }
          >
            <SelectTrigger className="w-full">
              <SelectValue asChild>
                <div className="flex items-center">
                  <span className="text-sm">
                    {selectedStatus
                      .replace(/_/g, " ")
                      .toLowerCase()
                      .replace(/^\w/, c => c.toUpperCase())}
                  </span>
                </div>
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              {availableStatuses.map(status => {
                const config = statusConfig[status];
                const Icon = config.icon;
                return (
                  <SelectItem key={status} value={status}>
                    <div className="flex items-center">
                      <Icon className={`mr-2 size-4 ${config.color}`} />
                      <span className="text-sm">
                        {status
                          .replace(/_/g, " ")
                          .toLowerCase()
                          .replace(/^\w/, c => c.toUpperCase())}
                      </span>
                    </div>
                  </SelectItem>
                );
              })}
            </SelectContent>
          </Select>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={isPending}>
            {isPending ? "Saving..." : "Save"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
