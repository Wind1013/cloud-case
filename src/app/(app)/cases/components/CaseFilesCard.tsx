import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Upload, FileText, ImageIcon, Eye, Download } from "lucide-react";
import React from "react";

// Base file interface with common properties
interface BaseFile {
  id: number;
  name: string;
  size: string;
  uploadedAt: string;
}

// Document-specific types
type DocumentType = "pdf" | "docx";

interface Document extends BaseFile {
  type: DocumentType;
}

// Image-specific types
type ImageType = "jpg" | "jpeg" | "png" | "gif" | "webp";

interface Image extends BaseFile {
  type: ImageType;
}

// Main data structure type
interface FileData {
  documents: Document[];
  images: Image[];
}

// Union type for all file types
type File = Document | Image;

// Alternative: More flexible approach with string literal unions
interface FlexibleFile {
  id: number;
  name: string;
  size: string;
  uploadedAt: string;
  type: string;
  // type: "pdf" | "docx" | "jpg" | "jpeg" | "png" | "gif" | "webp";
}

interface FlexibleFileData {
  documents: FlexibleFile[];
  images: FlexibleFile[];
}

const CaseFilesCard = ({ documents, images }: FlexibleFileData) => {
  return (
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
        <Tabs defaultValue="documents" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger
              value="documents"
              className="flex items-center gap-2 justify-center"
            >
              <FileText className="h-4 w-4" />
              Documents ({documents.length})
            </TabsTrigger>
            <TabsTrigger value="images" className="flex items-center gap-2">
              <ImageIcon className="h-4 w-4" />
              Images ({images.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="documents" className="space-y-4">
            <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 text-center bg-muted/20 hover:bg-muted/30 transition-colors cursor-pointer">
              <Upload className="h-8 w-8 mx-auto mb-4 text-muted-foreground" />
              <p className="text-sm font-medium mb-2">
                Drop documents here or click to upload
              </p>
              <p className="text-xs text-muted-foreground">
                Supports PDF, DOC, DOCX files up to 10MB
              </p>
            </div>

            <div className="space-y-2">
              {documents.map(file => (
                <div
                  key={file.id}
                  className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <FileText className="h-5 w-5 text-primary" />
                    <div>
                      <p className="text-sm font-medium">{file.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {file.size} • Uploaded {file.uploadedAt}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="ghost" size="sm">
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm">
                      <Download className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="images" className="space-y-4">
            <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 text-center bg-muted/20 hover:bg-muted/30 transition-colors cursor-pointer">
              <ImageIcon className="h-8 w-8 mx-auto mb-4 text-muted-foreground" />
              <p className="text-sm font-medium mb-2">
                Drop images here or click to upload
              </p>
              <p className="text-xs text-muted-foreground">
                Supports JPG, PNG, GIF files up to 5MB
              </p>
            </div>

            <div className="space-y-2">
              {images.map(file => (
                <div
                  key={file.id}
                  className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <ImageIcon className="h-5 w-5 text-secondary" />
                    <div>
                      <p className="text-sm font-medium">{file.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {file.size} • Uploaded {file.uploadedAt}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="ghost" size="sm">
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm">
                      <Download className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default CaseFilesCard;
