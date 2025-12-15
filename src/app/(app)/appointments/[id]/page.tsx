import { getAppointmentById } from "@/actions/appointment";
import { notFound } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, User, FileText, Video, MapPin } from "lucide-react";
import { format } from "date-fns";
import Link from "next/link";
import { Button } from "@/components/ui/button";

type AppointmentPageProps = {
  params: Promise<{ id: string }>;
};

export default async function AppointmentDetailPage({
  params,
}: AppointmentPageProps) {
  const { id } = await params;
  const result = await getAppointmentById(id);

  if (!result.success || !result.data) {
    notFound();
  }

  const appointment = result.data;

  const getVariantColor = (variant: string) => {
    switch (variant.toLowerCase()) {
      case "primary":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "danger":
        return "bg-red-100 text-red-800 border-red-200";
      case "success":
        return "bg-green-100 text-green-800 border-green-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getVariantLabel = (variant: string) => {
    switch (variant.toLowerCase()) {
      case "primary":
        return "ADMINISTRATIVE";
      case "danger":
        return "CRIMINAL";
      case "success":
        return "CIVIL";
      default:
        return variant.toUpperCase();
    }
  };

  return (
    <div className="container mx-auto px-6 py-8">
      <div className="mb-6">
        <Link href="/appointments">
          <Button variant="ghost" className="mb-4">
            ← Back to Appointments
          </Button>
        </Link>
        <h1 className="text-3xl font-bold">Appointment Details</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Appointment Overview */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-2xl">{appointment.title}</CardTitle>
                <Badge className={getVariantColor(appointment.variant)}>
                  {getVariantLabel(appointment.variant)}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {appointment.description && (
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <FileText className="w-5 h-5 text-muted-foreground" />
                    <span className="font-semibold">Description</span>
                  </div>
                  <p className="text-muted-foreground pl-7">
                    {appointment.description}
                  </p>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t">
                <div className="flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-muted-foreground" />
                  <div>
                    <span className="font-semibold">Start Date:</span>
                    <p className="text-muted-foreground">
                      {format(new Date(appointment.startDate), "PPP 'at' p")}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Clock className="w-5 h-5 text-muted-foreground" />
                  <div>
                    <span className="font-semibold">End Date:</span>
                    <p className="text-muted-foreground">
                      {format(new Date(appointment.endDate), "PPP 'at' p")}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Badge variant="outline">
                    {appointment.type === "ONLINE" ? (
                      <Video className="w-4 h-4 mr-1" />
                    ) : (
                      <MapPin className="w-4 h-4 mr-1" />
                    )}
                    {appointment.type === "ONLINE" ? "Online" : "Face to Face"}
                  </Badge>
                </div>

                {appointment.meetingUrl && (
                  <div className="flex items-center gap-2">
                    <Video className="w-5 h-5 text-muted-foreground" />
                    <div>
                      <span className="font-semibold">Meeting URL:</span>
                      <p className="text-muted-foreground">
                        <a
                          href={appointment.meetingUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary hover:underline"
                        >
                          {appointment.meetingUrl}
                        </a>
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Client Information */}
          {appointment.client && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="w-5 h-5" />
                  Client Information
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div>
                    <span className="font-semibold">Name:</span>
                    <p className="text-muted-foreground">
                      {appointment.client.name}
                    </p>
                  </div>
                  <div>
                    <span className="font-semibold">Email:</span>
                    <p className="text-muted-foreground">
                      {appointment.client.email}
                    </p>
                  </div>
                  {appointment.client.phone && (
                    <div>
                      <span className="font-semibold">Phone:</span>
                      <p className="text-muted-foreground">
                        {appointment.client.phone}
                      </p>
                    </div>
                  )}
                  <div className="pt-4">
                    <Link href={`/clients/${appointment.client.id}`}>
                      <Button variant="outline" className="w-full">
                        View Client Profile
                      </Button>
                    </Link>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Created By */}
          {appointment.createdBy && (
            <Card>
              <CardHeader>
                <CardTitle>Created By</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  {appointment.createdBy.name || appointment.createdBy.email}
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  {format(new Date(appointment.createdAt), "PPP")}
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}

