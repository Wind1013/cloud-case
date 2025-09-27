import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { getCaseById } from "@/data/cases";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  CalendarDays,
  Clock,
  Download,
  Eye,
  FileText,
  ImageIcon,
  Mail,
  Phone,
  Upload,
  User,
} from "lucide-react";
import React from "react";
import CaseClientCard from "../components/CaseClientCard";
import CaseOverviewCard from "../components/CaseOverviewCard";
import CaseFilesCard from "../components/CaseFilesCard";
import type { Case } from "@/generated/prisma";
import { notFound } from "next/navigation";

type CasePageProps = {
  params: Promise<{ id: string }>;
};

async function Case({ params }: CasePageProps) {
  const { id } = await params;

  const data = await getCaseById(id);

  if (!data.data) notFound();

  return (
    <div>
      <pre className="w-full">{JSON.stringify(data, null, 2)}</pre>
      <div className="container mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Case Overview */}
            <CaseOverviewCard caseData={data.data as Case} />
            {/* File Management */}
            <CaseFilesCard
              caseId={data.data.id}
              documents={data.data?.documents ?? []}
            />
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Client Information */}
            <CaseClientCard client={data.data?.client} />

            {/* Quick Actions */}
            {/* <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button
                  className="w-full justify-start gap-2 bg-transparent"
                  variant="outline"
                >
                  <FileText className="h-4 w-4" />
                  Generate Report
                </Button>
                <Button
                  className="w-full justify-start gap-2 bg-transparent"
                  variant="outline"
                >
                  <CalendarDays className="h-4 w-4" />
                  Schedule Meeting
                </Button>
                <Button
                  className="w-full justify-start gap-2 bg-transparent"
                  variant="outline"
                >
                  <Upload className="h-4 w-4" />
                  Upload Evidence
                </Button>
                <Separator />
                <Button className="w-full" variant="destructive">
                  Close Case
                </Button>
              </CardContent>
            </Card> */}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Case;
