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

type CasePageProps = {
  params: Promise<{ id: string }>;
};

async function Case({ params }: CasePageProps) {
  const { id } = await params;

  // const data = await getCaseById(id);

  const caseData = {
    id: "cmfqs40rg0001gied7q78l78p",
    title: "New Case",
    description:
      "Lorem ipsum dolor sit amet consectetur adipisicing elit. Dicta dolorum ducimus eum molestiae, ipsam ipsum aliquid veniam harum, natus, rem alias itaque possimus eos et porro eligendi culpa? Vero aliquid non quo itaque porro dignissimos ipsum, sed enim maiores, molestias beatae mollitia, vel repellat eum placeat ex quod esse earum dolor est. Ipsa molestias dolor hic maxime natus dolorem porro aperiam, rem magnam ipsum veritatis temporibus exercitationem quis sit fugiat earum. Vel ipsum illum maiores laboriosam quos ea neque et? Fugiat esse amet totam quia eum obcaecati ratione reprehenderit quos fuga, minima iste molestias corporis nesciunt accusantium voluptate! Velit, ipsam?",
    status: "PENDING" as const,
    clientId: "FQwDGQBsyHzroNKjjF8siNmRiEw50MuI",
    createdAt: "2025-09-19T11:51:22.563Z",
    updatedAt: "2025-09-19T11:51:22.563Z",
    client: {
      id: "FQwDGQBsyHzroNKjjF8siNmRiEw50MuI",
      name: "Justin Ariem2",
      firstName: null,
      lastName: null,
      middleName: null,
      gender: null,
      birthday: null,
      phone: null,
      email: "justinariem1@gmail.com",
      emailVerified: false,
      role: "CLIENT" as const,
      image: null,
      createdAt: new Date("2025-09-14T06:24:05.308Z"),
      updatedAt: new Date("2025-09-14T06:24:05.308Z"),
    },
  };

  const { client, ...rest } = caseData;
  const caseOnly = {
    ...rest,
    createdAt: new Date(rest.createdAt),
    updatedAt: new Date(rest.updatedAt),
  };

  const mockFiles = {
    documents: [
      {
        id: 1,
        name: "Contract_Agreement.pdf",
        size: "2.4 MB",
        uploadedAt: "2025-09-18",
        type: "pdf",
      },
      {
        id: 2,
        name: "Legal_Brief.docx",
        size: "1.8 MB",
        uploadedAt: "2025-09-17",
        type: "docx",
      },
      {
        id: 3,
        name: "Evidence_Report.pdf",
        size: "3.2 MB",
        uploadedAt: "2025-09-16",
        type: "pdf",
      },
    ],
    images: [
      {
        id: 4,
        name: "Evidence_Photo_1.jpg",
        size: "4.1 MB",
        uploadedAt: "2025-09-18",
        type: "jpg",
      },
      {
        id: 5,
        name: "Property_Image.png",
        size: "2.7 MB",
        uploadedAt: "2025-09-17",
        type: "png",
      },
    ],
  };

  return (
    <div>
      <main className="container mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Case Overview */}
            <CaseOverviewCard caseData={caseOnly} />
            {/* File Management */}
            <CaseFilesCard
              documents={mockFiles.documents}
              images={mockFiles.images}
            />
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Client Information */}
            <CaseClientCard client={caseData.client} />

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
      </main>
    </div>
  );
}

export default Case;
