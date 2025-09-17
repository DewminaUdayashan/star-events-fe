import React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Download, Eye, FileText, Table, X } from "lucide-react";
import { DocumentPreview } from "@/lib/services/document-generator.service";

interface DocumentPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  preview: DocumentPreview | null;
  onDownload: () => void;
  onPreview: () => void;
  isGenerating?: boolean;
}

export const DocumentPreviewModal: React.FC<DocumentPreviewModalProps> = ({
  isOpen,
  onClose,
  preview,
  onDownload,
  onPreview,
  isGenerating = false,
}) => {
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const getFileIcon = (type: "pdf" | "excel") => {
    return type === "pdf" ? (
      <FileText className="h-8 w-8 text-red-500" />
    ) : (
      <Table className="h-8 w-8 text-green-500" />
    );
  };

  const getFileTypeColor = (type: "pdf" | "excel") => {
    return type === "pdf"
      ? "bg-red-100 text-red-800 border-red-200"
      : "bg-green-100 text-green-800 border-green-200";
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {isGenerating ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary" />
                Generating Document...
              </>
            ) : (
              <>
                {preview && getFileIcon(preview.type)}
                Document Ready
              </>
            )}
          </DialogTitle>
          <DialogDescription>
            {isGenerating
              ? "Please wait while your document is being generated..."
              : "Your document has been generated and is ready for preview or download."}
          </DialogDescription>
        </DialogHeader>

        {preview && !isGenerating && (
          <div className="space-y-4">
            {/* File Info Card */}
            <div className="border rounded-lg p-4 space-y-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  {getFileIcon(preview.type)}
                  <div>
                    <h3
                      className="font-medium text-sm truncate max-w-[200px]"
                      title={preview.filename}
                    >
                      {preview.filename}
                    </h3>
                    <p className="text-xs text-muted-foreground">
                      {formatFileSize(preview.blob.size)}
                    </p>
                  </div>
                </div>
                <Badge
                  variant="outline"
                  className={getFileTypeColor(preview.type)}
                >
                  {preview.type.toUpperCase()}
                </Badge>
              </div>
            </div>

            {/* Preview Section */}
            {preview.type === "pdf" && (
              <div className="border rounded-lg p-4">
                <h4 className="text-sm font-medium mb-2">Preview Options</h4>
                <p className="text-xs text-muted-foreground mb-3">
                  PDF documents can be previewed in a new tab before
                  downloading.
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onPreview}
                  className="w-full"
                >
                  <Eye className="h-4 w-4 mr-2" />
                  Preview PDF
                </Button>
              </div>
            )}

            {preview.type === "excel" && (
              <div className="border rounded-lg p-4">
                <h4 className="text-sm font-medium mb-2">Excel File Ready</h4>
                <p className="text-xs text-muted-foreground">
                  Excel files contain multiple sheets with detailed data and can
                  be opened in spreadsheet applications.
                </p>
              </div>
            )}
          </div>
        )}

        {isGenerating && (
          <div className="flex items-center justify-center py-8">
            <div className="space-y-4 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto" />
              <div className="space-y-2">
                <p className="text-sm font-medium">Generating your document</p>
                <p className="text-xs text-muted-foreground">
                  This may take a few moments...
                </p>
              </div>
            </div>
          </div>
        )}

        <DialogFooter className="flex justify-between sm:justify-between">
          <Button variant="outline" onClick={onClose} disabled={isGenerating}>
            <X className="h-4 w-4 mr-2" />
            Close
          </Button>

          {preview && !isGenerating && (
            <Button onClick={onDownload} className="ml-auto">
              <Download className="h-4 w-4 mr-2" />
              Download
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
