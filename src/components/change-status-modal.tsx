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
import { useState, useTransition, useEffect } from "react";
import { useRouter } from "next/navigation";
import { updateCaseStatus } from "@/actions/cases";
import { toast } from "sonner";
import { CaseData } from "./case-data-table";
import { IconClock, IconLoader, IconCheck } from "@tabler/icons-react";
import { Archive } from "lucide-react";

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
  "PRETRIAL",
  "TRIAL",
  "DECISION",
];
const allStatuses: CaseData["status"][] = [
  "ARRAIGNMENT",
  "PRETRIAL",
  "TRIAL",
  "PROMULGATION",
  "REMEDIES",
  "PRELIMINARY_CONFERENCE",
  "DECISION",
  "ARCHIVED",
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
  ARCHIVED: {
    icon: Archive,
    color: "text-gray-600",
  },
};

export function ChangeStatusModal({
  caseData,
  isOpen,
  onClose,
}: ChangeStatusModalProps) {
  const router = useRouter();
  const [selectedStatus, setSelectedStatus] = useState<CaseData["status"]>(
    caseData.status
  );
  const [isPending, startTransition] = useTransition();

  // Reset selected status when modal opens or caseData changes
  useEffect(() => {
    if (isOpen) {
      setSelectedStatus(caseData.status);
    }
  }, [isOpen, caseData.status]);

  // Get available statuses based on case type, but always include current status
  const getAvailableStatuses = () => {
    const baseStatuses =
      caseData.type === "CRIMINAL" ? criminalStatuses : otherStatuses;
    
    // Always include the current status if it's not in the base list
    const statusSet = new Set(baseStatuses);
    if (!statusSet.has(caseData.status)) {
      statusSet.add(caseData.status);
    }
    
    // Return as array, sorted to maintain consistency
    return Array.from(statusSet).sort((a, b) => {
      const allIndex = allStatuses.indexOf(a);
      const bIndex = allStatuses.indexOf(b);
      if (allIndex === -1) return 1;
      if (bIndex === -1) return -1;
      return allIndex - bIndex;
    });
  };

  const availableStatuses = getAvailableStatuses();

  const handleSave = () => {
    startTransition(async () => {
      const result = await updateCaseStatus(caseData.id, selectedStatus);
      if (result.success) {
        toast.success("Case status updated successfully");
        router.refresh();
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
                const config = statusConfig[status] || {
                  icon: IconClock,
                  color: "text-gray-600",
                };
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
