import { Check, Clock, Loader, LucideIcon, X } from "lucide-react";
import { Badge } from "./ui/badge";
import { CaseStatus } from "@/generated/prisma";

interface StatusConfig {
  icon: LucideIcon;
  color: string;
  bg: string;
}

const StatusBadge = ({ status }: { status: CaseStatus }) => {
  const statusConfig: Record<CaseStatus, StatusConfig> = {
    PENDING: {
      icon: Clock,
      color: "text-yellow-600",
      bg: "bg-yellow-100",
    },
    ACTIVE: {
      icon: Loader,
      color: "text-blue-600",
      bg: "bg-blue-100",
    },
    ARCHIVED: {
      icon: Check,
      color: "text-green-600",
      bg: "bg-green-100",
    },
    CLOSED: {
      icon: X,
      color: "text-red-600",
      bg: "bg-red-100",
    },
  };

  const config = statusConfig[status];

  if (!config) {
    return null; // or return a default badge
  }

  const Icon = config.icon;

  return (
    <Badge
      variant="outline"
      className={`${config.color} ${config.bg} px-2 py-1`}
    >
      <Icon className="mr-1 size-3" />
      {status.replace("_", " ")}
    </Badge>
  );
};

export default StatusBadge;
