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
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Textarea } from "@/components/ui/textarea";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { User, Document } from "@/generated/prisma";
import { FileText, Scale, Type, UserCheck, Users, ChevronDown as IconChevronDown, Search, Upload, X } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useTransition, useEffect, useState, useRef, useMemo } from "react";
import { useRouter } from "next/navigation";
import { UploadDropzone } from "@/components/ui/upload-dropzone";
import { useUploadFiles } from "better-upload/client";
import { toast } from "sonner";
import CaseFilesList from "./components/CaseFilesList";
import EditableCaseFilesList from "./components/EditableCaseFilesList";

const caseSchema = z.object({
  title: z.string().min(1, { message: "Title is required" }),
  description: z.string().min(1, { message: "Description is required" }),
  clientId: z.string().min(1, { message: "Client is required" }),
  type: z.enum(["ADMINISTRATIVE", "CIVIL", "CRIMINAL"]),
  status: z.enum([
    "ARRAIGNMENT",
    "PRETRIAL",
    "TRIAL",
    "PROMULGATION",
    "REMEDIES",
    "PRELIMINARY_CONFERENCE",
    "DECISION",
    "ARCHIVED",
  ]),
  // document: z.string().optional(),
});

export type CaseFormValues = z.infer<typeof caseSchema>;

export default function CaseFilingForm({
  clients,
  onSubmit,
  initialData,
  caseId,
  documents,
}: {
  clients: User[];
  onSubmit: (data: CaseFormValues, pendingFiles?: File[]) => void | Promise<void>;
  initialData?: CaseFormValues;
  caseId?: string;
  documents?: Document[];
}) {
  const router = useRouter();
  const isEditMode = !!initialData;
  const form = useForm<CaseFormValues>({
    resolver: zodResolver(caseSchema),
    defaultValues: initialData || {
      title: "",
      description: "",
      clientId: "",
      type: "CIVIL",
      status: "PRELIMINARY_CONFERENCE",
    },
    values: initialData, // Use values prop for reactive updates
  });
  const [isPending, startTransition] = useTransition();
  const [clientSearchQuery, setClientSearchQuery] = useState("");
  const [clientPopoverOpen, setClientPopoverOpen] = useState(false);
  const [pendingFiles, setPendingFiles] = useState<File[]>([]);
  const [pendingEditFiles, setPendingEditFiles] = useState<File[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // File upload configuration - only used for immediate uploads (not in edit mode)
  const { control } = useUploadFiles({
    route: "demo",
    onError: ({ message }) => {
      toast.error(message);
      setIsUploading(false);
    },
    onUploadComplete: () => {
      // This callback is handled in onPrepareSubmit for edit mode
      // For non-edit mode, show success and refresh
      if (!isEditMode) {
        toast.success("Upload successful");
        setIsUploading(false);
        router.refresh();
      }
    },
  });

  const caseType = form.watch("type");
  const watchedClientId = form.watch("clientId");

  // Get the current clientId value from form (with fallbacks)
  const currentClientId = watchedClientId || form.getValues("clientId") || initialData?.clientId || "";
  
  // Memoize selected client to ensure it updates reactively
  const selectedClient = useMemo(() => {
    if (!currentClientId) return null;
    return clients.find(client => client.id === currentClientId) || null;
  }, [currentClientId, clients]);

  // Reset form when initialData changes (when editing)
  useEffect(() => {
    if (initialData && initialData.clientId) {
      // Explicitly set the clientId to ensure it's set
      form.reset(initialData, { keepDefaultValues: false });
      // Double-check by setting it explicitly
      if (form.getValues("clientId") !== initialData.clientId) {
        form.setValue("clientId", initialData.clientId, { shouldValidate: false, shouldDirty: false });
      }
    }
  }, [initialData, form]);

  // Auto-set status based on case type only when creating new case
  useEffect(() => {
    if (!isEditMode) {
      if (caseType === "CRIMINAL") {
        form.setValue("status", "ARRAIGNMENT");
      } else {
        form.setValue("status", "PRELIMINARY_CONFERENCE");
      }
    }
  }, [caseType, form, isEditMode]);

  // Clear search query when popover closes
  useEffect(() => {
    if (!clientPopoverOpen) {
      setClientSearchQuery("");
    }
  }, [clientPopoverOpen]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0) {
      // Validate file size (10MB)
      const maxSize = 10 * 1024 * 1024; // 10MB in bytes
      const validFiles = files.filter(file => {
        if (file.size > maxSize) {
          toast.error(`${file.name} exceeds 10MB limit`);
          return false;
        }
        return true;
      });
      setPendingFiles(prev => [...prev, ...validFiles]);
    }
    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleRemoveFile = (index: number) => {
    setPendingFiles(prev => prev.filter((_, i) => i !== index));
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  // Function to fetch updated documents
  const fetchDocuments = async () => {
    if (!caseId) return;
    try {
      const response = await fetch(`/api/cases/${caseId}/documents`, {
        credentials: "include",
      });
      
      if (!response.ok) {
        throw new Error("Failed to fetch documents");
      }
      
      const result = await response.json();
      if (result.success && result.documents) {
        // Update documents prop by refreshing the page
        router.refresh();
      }
    } catch (error) {
      console.error("Error fetching documents:", error);
    }
  };

  async function onPrepareSubmit(values: CaseFormValues) {
    startTransition(async () => {
      // If in edit mode and there are pending files, upload them first
      if (isEditMode && caseId && pendingEditFiles.length > 0) {
        setIsUploading(true);
        try {
          // Upload all pending files
          const uploadPromises = pendingEditFiles.map(file => 
            control.upload([file], { 
              metadata: { caseId } 
            })
          );
          
          // Wait for all uploads to complete
          await Promise.all(uploadPromises);
          
          // Verify files were saved with retry logic
          const uploadedFileNames = pendingEditFiles.map(f => f.name);
          let savedFiles: Document[] = [];
          let retryCount = 0;
          const maxRetries = 5;
          
          // Retry verification up to 5 times with increasing delays
          while (retryCount < maxRetries && savedFiles.length < pendingEditFiles.length) {
            // Wait before checking (first check after 1s, then 500ms intervals)
            await new Promise(resolve => setTimeout(resolve, retryCount === 0 ? 1000 : 500));
            
            try {
              const response = await fetch(`/api/cases/${caseId}/documents`, {
                credentials: "include",
              });
              
              if (response.ok) {
                const result = await response.json();
                if (result.success && result.documents) {
                  // Find files that match our uploaded file names
                  savedFiles = result.documents.filter((doc: Document) => 
                    uploadedFileNames.includes(doc.name)
                  );
                  
                  // If all files are saved, break out of retry loop
                  if (savedFiles.length === pendingEditFiles.length) {
                    break;
                  }
                }
              }
            } catch (fetchError) {
              console.error(`Error verifying uploaded files (attempt ${retryCount + 1}):`, fetchError);
            }
            
            retryCount++;
          }
          
          // Show appropriate success message based on verification results
          if (savedFiles.length === pendingEditFiles.length) {
            toast.success(`Case updated and ${pendingEditFiles.length} file(s) uploaded successfully`);
            setPendingEditFiles([]); // Clear pending files only after confirmation
          } else if (savedFiles.length > 0) {
            console.warn(`Expected ${pendingEditFiles.length} files, but only ${savedFiles.length} were saved`);
            toast.success(`Case updated. ${savedFiles.length} of ${pendingEditFiles.length} file(s) uploaded successfully`);
            setPendingEditFiles([]); // Clear pending files even if not all were verified
          } else {
            // If no files were verified, still clear pending files but show warning
            console.warn("Could not verify file uploads, but proceeding with case update");
            toast.success(`Case updated. Files are being processed (${pendingEditFiles.length} file(s) pending verification)`);
            setPendingEditFiles([]);
          }
        } catch (uploadError) {
          console.error("Error uploading files:", uploadError);
          toast.error("Case updated but some files failed to upload");
        } finally {
          setIsUploading(false);
        }
      }
      
      // Proceed with case update (this will redirect after success)
      await onSubmit(values, pendingFiles);
      setPendingFiles([]); // Clear pending files after submission
    });
  }

  function handleCancel() {
    // Clear pending files when canceling
    setPendingFiles([]);
    setPendingEditFiles([]);
    
    if (isEditMode) {
      router.back();
    } else {
      router.push("/cases");
    }
  }

  // Filter clients based on search query
  const filteredClients = clients.filter(client =>
    client.name.toLowerCase().includes(clientSearchQuery.toLowerCase()) ||
    client.email?.toLowerCase().includes(clientSearchQuery.toLowerCase())
  );


  return (
    <div className="mx-auto p-6">
      <div className="mb-8 text-center">
        <div className="flex items-center justify-center mb-4">
          <Scale className="h-8 w-8 text-primary mr-3" />
          <h1 className="text-3xl font-bold text-foreground">
            {isEditMode ? "Edit Case" : "Legal Case Filing"}
          </h1>
        </div>
        <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
          {isEditMode
            ? "Update case information and ensure all fields are accurate."
            : "Submit a new legal case with all required documentation and client information. Please ensure all fields are completed accurately."}
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
                        <FormLabel>
                          <Type className="h-4 w-4 mr-1 text-accent" />
                          Case Title *
                        </FormLabel>
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
                    name="type"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Case Type *</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          value={field.value}
                        >
                          <FormControl>
                            <SelectTrigger className="w-full">
                              <SelectValue placeholder="Select a case type" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="ADMINISTRATIVE">
                              Administrative
                            </SelectItem>
                            <SelectItem value="CIVIL">Civil</SelectItem>
                            <SelectItem value="CRIMINAL">Criminal</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="status"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Status</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          value={field.value}
                        >
                          <FormControl>
                            <SelectTrigger className="w-full">
                              <SelectValue placeholder="Select a status" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {(() => {
                              const currentStatus = field.value;
                              const currentType = form.watch("type");
                              
                              // When editing, show all statuses to allow any status to be selected
                              // Otherwise, show statuses based on case type
                              if (isEditMode) {
                                return (
                                  <>
                                    <SelectItem value="PRELIMINARY_CONFERENCE">
                                      Preliminary Conference
                                    </SelectItem>
                                    <SelectItem value="ARRAIGNMENT">
                                      Arraignment
                                    </SelectItem>
                                    <SelectItem value="PRETRIAL">
                                      Pretrial
                                    </SelectItem>
                                    <SelectItem value="TRIAL">Trial</SelectItem>
                                    <SelectItem value="PROMULGATION">
                                      Promulgation
                                    </SelectItem>
                                    <SelectItem value="REMEDIES">
                                      Remedies
                                    </SelectItem>
                                    <SelectItem value="DECISION">
                                      Decision
                                    </SelectItem>
                                    <SelectItem value="ARCHIVED">
                                      Archived
                                    </SelectItem>
                                  </>
                                );
                              }
                              
                              // For new cases, show statuses based on case type
                              if (currentType === "CRIMINAL") {
                                return (
                                  <>
                                    <SelectItem value="ARRAIGNMENT">
                                      Arraignment
                                    </SelectItem>
                                    <SelectItem value="PRETRIAL">
                                      Pretrial
                                    </SelectItem>
                                    <SelectItem value="TRIAL">Trial</SelectItem>
                                    <SelectItem value="PROMULGATION">
                                      Promulgation
                                    </SelectItem>
                                    <SelectItem value="REMEDIES">
                                      Remedies
                                    </SelectItem>
                                  </>
                                );
                              } else {
                                return (
                                  <>
                                    <SelectItem value="PRELIMINARY_CONFERENCE">
                                      Preliminary Conference
                                    </SelectItem>
                                    <SelectItem value="PRETRIAL">
                                      Pretrial
                                    </SelectItem>
                                    <SelectItem value="TRIAL">Trial</SelectItem>
                                    <SelectItem value="DECISION">
                                      Decision
                                    </SelectItem>
                                  </>
                                );
                              }
                            })()}
                          </SelectContent>
                        </Select>
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
                    <h3 className="text-lg font-semibold text-foreground mb-0.5">
                      Case Assignment
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      Assign client and legal representation
                    </p>
                  </div>

                  <FormField
                    control={form.control}
                    name="clientId"
                    render={({ field }) => {
                      const currentSelectedClient = field.value 
                        ? clients.find(client => client.id === field.value) 
                        : null;

                      // In edit mode, show read-only display
                      if (isEditMode) {
                        return (
                          <FormItem className="w-full">
                            <FormLabel className="flex items-center">
                              <Users className="h-4 w-4 mr-1 text-accent" />
                              Client *
                            </FormLabel>
                            <FormControl>
                              <div className="flex items-center justify-between w-full rounded-md border border-border bg-muted/50 px-3 py-2 h-auto min-h-[2.75rem]">
                                <span className="flex items-center gap-2 truncate flex-1">
                                  <UserCheck className="h-4 w-4 text-primary flex-shrink-0" />
                                  <span className="flex flex-col items-start min-w-0 flex-1">
                                    <span className="text-sm font-medium truncate w-full">
                                      {currentSelectedClient?.name || "Client not found"}
                                      </span>
                                    {currentSelectedClient?.email && (
                                      <span className="text-xs text-muted-foreground truncate w-full">
                                        {currentSelectedClient.email}
                                        </span>
                                      )}
                                    </span>
                                  </span>
                                <span className="text-xs text-muted-foreground ml-2 flex-shrink-0">Assigned</span>
                                </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        );
                      }

                      // In create mode, show interactive popover
                      return (
                        <FormItem className="w-full">
                          <FormLabel className="flex items-center">
                            <Users className="h-4 w-4 mr-1 text-accent" />
                            Client *
                          </FormLabel>
                          <Popover 
                            open={clientPopoverOpen} 
                            onOpenChange={setClientPopoverOpen}
                          >
                            <PopoverTrigger asChild>
                              <FormControl>
                                  <Button
                                    variant="outline"
                                    role="combobox"
                                  className="w-full justify-between h-auto min-h-[2.75rem] py-2"
                                    type="button"
                                  >
                                  <span className="truncate flex-1 text-left">
                                    {currentSelectedClient ? (
                                        <span className="flex items-center gap-2">
                                        <UserCheck className="h-4 w-4 text-primary flex-shrink-0" />
                                        <span className="flex flex-col items-start min-w-0">
                                          <span className="text-sm font-medium truncate w-full">
                                            {currentSelectedClient.name}
                                          </span>
                                          {currentSelectedClient.email && (
                                            <span className="text-xs text-muted-foreground truncate w-full">
                                              {currentSelectedClient.email}
                                            </span>
                                          )}
                                        </span>
                                        </span>
                                      ) : (
                                        "Select a client"
                                      )}
                                    </span>
                                    <IconChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                  </Button>
                              </FormControl>
                            </PopoverTrigger>
                            <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0" align="start">
                              <div className="p-2 border-b">
                                <div className="relative">
                                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                                  <Input
                                    placeholder="Search clients..."
                                    value={clientSearchQuery}
                                    onChange={(e) => setClientSearchQuery(e.target.value)}
                                    className="pl-8"
                                    autoFocus
                                  />
                                </div>
                              </div>
                              <div className="max-h-[300px] overflow-y-auto">
                                {filteredClients.length === 0 ? (
                                  <div className="p-4 text-center text-sm text-muted-foreground">
                                    No clients found.
                                  </div>
                                ) : (
                                  filteredClients.map(client => (
                                    <div
                                      key={client.id}
                                      className={`px-3 py-2 cursor-pointer hover:bg-accent hover:text-accent-foreground text-sm transition-colors ${
                                        field.value === client.id ? "bg-accent" : ""
                                      }`}
                                      onClick={() => {
                                        field.onChange(client.id);
                                        setClientPopoverOpen(false);
                                        setClientSearchQuery("");
                                      }}
                                    >
                                      <div className="font-medium">{client.name}</div>
                                      {client.email && (
                                        <div className="text-xs text-muted-foreground">{client.email}</div>
                                      )}
                                    </div>
                                  ))
                                )}
                              </div>
                            </PopoverContent>
                          </Popover>
                          <FormMessage />
                        </FormItem>
                      );
                    }}
                  />
                </div>
              </div>

              {/* Case Files Section */}
              <div className="space-y-6 pt-6 border-t border-border">
                <div className="border-l-4 border-primary pl-4">
                  <h3 className="text-lg font-semibold text-foreground mb-1">
                    Case Files
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {caseId 
                      ? "Manage documents and images related to this case"
                      : "Upload documents and images after creating the case. You can add files once the case is created."}
                  </p>
                </div>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Upload className="h-5 w-5" />
                      Case Files
                    </CardTitle>
                    <CardDescription>
                      Manage documents and images related to this case
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {caseId ? (
                      <>
                        <div
                          onClick={() => fileInputRef.current?.click()}
                          className="p-8 text-center border border-dashed rounded-lg bg-muted/50 cursor-pointer hover:bg-muted/70 transition-colors"
                        >
                          <Upload className="h-8 w-8 mx-auto mb-4 text-muted-foreground" />
                          <p className="text-sm text-muted-foreground mb-2">
                            Click to select files or drag and drop
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Each up to 10MB. Files will be uploaded when you click "Update Case".
                          </p>
                        </div>
                        <input
                          ref={fileInputRef}
                          type="file"
                          multiple
                          accept="image/*,application/pdf,.pdf,application/msword,.doc,application/vnd.openxmlformats-officedocument.wordprocessingml.document,.docx,application/vnd.ms-excel,.xls,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,.xlsx,text/plain,.txt"
                          onChange={(e) => {
                            const files = Array.from(e.target.files || []);
                            if (files.length > 0) {
                              const maxSize = 10 * 1024 * 1024; // 10MB
                              const validFiles = files.filter(file => {
                                if (file.size > maxSize) {
                                  toast.error(`${file.name} exceeds 10MB limit`);
                                  return false;
                                }
                                return true;
                              });
                              setPendingEditFiles(prev => [...prev, ...validFiles]);
                            }
                            if (fileInputRef.current) {
                              fileInputRef.current.value = "";
                            }
                          }}
                          className="hidden"
                        />
                        
                        {pendingEditFiles.length > 0 && (
                          <div className="space-y-2 mt-4">
                            <p className="text-sm font-medium">
                              Files to Upload ({pendingEditFiles.length})
                            </p>
                            <div className="space-y-2 max-h-48 overflow-y-auto">
                              {pendingEditFiles.map((file, index) => (
                                <div
                                  key={index}
                                  className="flex items-center justify-between p-3 border rounded-lg bg-card"
                                >
                                  <div className="flex items-center gap-3 flex-1 min-w-0">
                                    <FileText className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                                    <div className="flex-1 min-w-0">
                                      <p className="text-sm font-medium truncate">{file.name}</p>
                                      <p className="text-xs text-muted-foreground">
                                        {formatFileSize(file.size)}
                                      </p>
                                    </div>
                                  </div>
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => setPendingEditFiles(prev => prev.filter((_, i) => i !== index))}
                                    className="h-8 w-8 flex-shrink-0"
                                  >
                                    <X className="h-4 w-4" />
                                  </Button>
                                </div>
                              ))}
                            </div>
                            <p className="text-xs text-muted-foreground">
                              Files will be uploaded when you click "Update Case"
                            </p>
                          </div>
                        )}
                        
                        <EditableCaseFilesList 
                          key={`files-${documents?.length || 0}-${documents?.map(d => d.id).join('-') || ''}`} 
                          documents={documents}
                          onDelete={fetchDocuments}
                        />
                      </>
                    ) : (
                      <div className="space-y-4">
                        <div
                          onClick={() => fileInputRef.current?.click()}
                          className="p-8 text-center border border-dashed rounded-lg bg-muted/50 cursor-pointer hover:bg-muted/70 transition-colors"
                        >
                          <Upload className="h-8 w-8 mx-auto mb-4 text-muted-foreground" />
                          <p className="text-sm text-muted-foreground mb-2">
                            Click to select files or drag and drop
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Each up to 10MB. Accepted JPEG, PNG, GIF, PDF, DOC, TXT.
                          </p>
                        </div>
                        <input
                          ref={fileInputRef}
                          type="file"
                          multiple
                          accept="image/*,application/pdf,.pdf,application/msword,.doc,application/vnd.openxmlformats-officedocument.wordprocessingml.document,.docx,application/vnd.ms-excel,.xls,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,.xlsx,text/plain,.txt"
                          onChange={handleFileSelect}
                          className="hidden"
                        />
                        
                        {pendingFiles.length > 0 && (
                          <div className="space-y-2">
                            <p className="text-sm font-medium">
                              Selected Files ({pendingFiles.length})
                            </p>
                            <div className="space-y-2 max-h-48 overflow-y-auto">
                              {pendingFiles.map((file, index) => (
                                <div
                                  key={index}
                                  className="flex items-center justify-between p-3 border rounded-lg bg-card"
                                >
                                  <div className="flex items-center gap-3 flex-1 min-w-0">
                                    <FileText className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                                    <div className="flex-1 min-w-0">
                                      <p className="text-sm font-medium truncate">{file.name}</p>
                                      <p className="text-xs text-muted-foreground">
                                        {formatFileSize(file.size)}
                                      </p>
                                    </div>
                                  </div>
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => handleRemoveFile(index)}
                                    className="h-8 w-8 flex-shrink-0"
                                  >
                                    <X className="h-4 w-4" />
                                  </Button>
                                </div>
                              ))}
                            </div>
                            <p className="text-xs text-muted-foreground">
                              Files will be uploaded after the case is created
                            </p>
                          </div>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t border-border">
                  <Button
                  type="submit"
                  className="flex-1 sm:flex-none sm:min-w-[200px] h-12 bg-primary hover:bg-primary/90 text-primary-foreground font-medium"
                  loading={isPending || isUploading}
                  disabled={isPending || isUploading}
                >
                  {isUploading 
                    ? "Uploading files..." 
                    : isEditMode 
                      ? `Update Case${pendingEditFiles.length > 0 ? ` (${pendingEditFiles.length} file${pendingEditFiles.length > 1 ? 's' : ''} pending)` : ''}` 
                      : "Submit Case Filing"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleCancel}
                  className="flex-1 sm:flex-none sm:min-w-[120px] h-12 border-border hover:bg-muted bg-transparent"
                  disabled={isPending}
                >
                  Cancel
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
