import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Case } from "@/generated/prisma";
import { formatDate } from "@/utils";
import { Separator } from "@/components/ui/separator";
import { FileText, CalendarDays, Clock } from "lucide-react";
import React from "react";
import { Badge } from "@/components/ui/badge";
import StatusBadge from "@/components/status-badge";

const CaseOverviewCard = ({ caseData }: { caseData: Case }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          Case Overview
        </CardTitle>
        <CardDescription>
          Detailed information about this legal case
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-muted-foreground">
              Case Title
            </label>
            <p className="text-sm font-medium">{caseData.title}</p>
          </div>
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-muted-foreground">
              Status
            </label>
            <StatusBadge status={caseData.status} />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-muted-foreground">
              Created Date
            </label>
            <div className="flex items-center gap-2 text-sm">
              <CalendarDays className="h-4 w-4 text-muted-foreground" />
              {formatDate(caseData.createdAt)}
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-muted-foreground">
              Last Updated
            </label>
            <div className="flex items-center gap-2 text-sm">
              <Clock className="h-4 w-4 text-muted-foreground" />
              {formatDate(caseData.updatedAt)}
            </div>
          </div>
        </div>
        <Separator />
        <div className="">
          <p className="text-sm font-medium text-muted-foreground mb-4">
            Case Description
          </p>
          <p className="text-sm leading-relaxed bg-muted/50 p-4 rounded-lg">
            {caseData.description}
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default CaseOverviewCard;
