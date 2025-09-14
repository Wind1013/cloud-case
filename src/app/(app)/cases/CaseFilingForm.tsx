"use client";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { User } from "@/generated/prisma";
import { FileText, Scale, UserCheck, Users } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const caseSchema = z.object({
  title: z.string().min(1, { message: "Title is required" }),
  description: z.string().min(1, { message: "Description is required" }),
  clientId: z.string().min(1, { message: "Client is required" }),
  lawyerId: z.string().min(1, { message: "Lawyer is required" }),
  // document: z.string().optional(),
});

export type CaseFormValues = z.infer<typeof caseSchema>;

export default function CaseFilingForm({
  clients,
  lawyers,
  onSubmit,
  initialData,
}: {
  clients: User[];
  lawyers: User[];
  onSubmit: (data: CaseFormValues) => void;
  initialData?: CaseFormValues;
}) {
  const form = useForm<CaseFormValues>({
    resolver: zodResolver(caseSchema),
    defaultValues: initialData || {
      title: "",
      description: "",
      clientId: "",
      lawyerId: "",
    },
  });

  async function onPrepareSubmit(values: CaseFormValues) {
    onSubmit(values);
  }

  function handleReset() {
    form.reset();
    form.clearErrors();
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-8 text-center">
        <div className="flex items-center justify-center mb-4">
          <Scale className="h-8 w-8 text-primary mr-3" />
          <h1 className="text-3xl font-bold text-foreground">
            Legal Case Filing
          </h1>
        </div>
        <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
          Submit a new legal case with all required documentation and client
          information. Please ensure all fields are completed accurately.
        </p>
      </div>

      <Card className="shadow-lg border-border">
        <CardHeader className="bg-card border-b border-border">
          <CardTitle className="text-xl font-semibold flex items-center">
            <FileText className="h-5 w-5 mr-2 text-primary" />
            Case Information
          </CardTitle>
          <CardDescription>
            Provide detailed information about the case and assign the
            appropriate legal team.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-8">
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onPrepareSubmit)}
              className="space-y-8"
            >
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Case Details Section */}
                <div className="space-y-6">
                  <div className="border-l-4 border-primary pl-4">
                    <h3 className="text-lg font-semibold text-foreground mb-1">
                      Case Details
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      Basic information about the legal case
                    </p>
                  </div>

                  <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Case Title *</FormLabel>
                        <Input
                          placeholder="Enter a descriptive case title"
                          {...field}
                        />
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Case Description *</FormLabel>
                        <Textarea
                          placeholder="Provide a detailed description of the case, including key facts and circumstances"
                          className="min-h-[120px] resize-none"
                          {...field}
                        />
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Assignment Section */}
                <div className="space-y-6">
                  <div className="border-l-4 border-accent pl-4">
                    <h3 className="text-lg font-semibold text-foreground mb-1">
                      Case Assignment
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      Assign client and legal representation
                    </p>
                  </div>

                  <FormField
                    control={form.control}
                    name="clientId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center">
                          <Users className="h-4 w-4 mr-2 text-accent" />
                          Client *
                        </FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          value={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select a client" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {clients.map(client => (
                              <SelectItem key={client.id} value={client.id}>
                                {client.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="lawyerId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center">
                          <UserCheck className="h-4 w-4 mr-2 text-accent" />
                          Assigned Lawyer *
                        </FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          value={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select an attorney" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {lawyers.map(lawyer => (
                              <SelectItem key={lawyer.id} value={lawyer.id}>
                                {lawyer.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="bg-muted/50 border border-border rounded-lg p-4">
                    <p className="text-sm text-muted-foreground">
                      <strong>Note:</strong> The assigned lawyer will be
                      notified immediately upon case submission and will have
                      full access to case details and documentation.
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t border-border">
                <Button
                  type="submit"
                  className="flex-1 sm:flex-none sm:min-w-[200px] h-12 bg-primary hover:bg-primary/90 text-primary-foreground font-medium"
                >
                  Submit Case Filing
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleReset}
                  className="flex-1 sm:flex-none sm:min-w-[120px] h-12 border-border hover:bg-muted bg-transparent"
                >
                  Reset
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>

      <div className="mt-8 text-center">
        <p className="text-xs text-muted-foreground max-w-2xl mx-auto">
          By submitting this form, you confirm that all information provided is
          accurate and complete. This case filing will be processed according to
          our standard legal procedures and timelines.
        </p>
      </div>
    </div>
  );
}
