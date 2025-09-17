import React, { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { DocumentPreviewModal } from "@/components/ui/document-preview-modal";
import { Download, FileText, Table, ChevronDown, Eye } from "lucide-react";
import { useDocumentGenerator } from "@/hooks/useDocumentGenerator";
import {
  SalesReport,
  UserReport,
  EventReport,
  RevenueReport,
  ReportFilters,
} from "@/lib/types/api";

interface ReportExportActionsProps {
  reportType: "sales" | "users" | "events" | "revenue";
  data: SalesReport | UserReport | EventReport | RevenueReport;
  filters?: ReportFilters;
  chartContainerRef?: React.RefObject<HTMLElement>;
  className?: string;
}

export const ReportExportActions: React.FC<ReportExportActionsProps> = ({
  reportType,
  data,
  filters,
  chartContainerRef,
  className = "",
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [exportType, setExportType] = useState<"pdf" | "excel" | null>(null);

  const {
    preview,
    isGenerating,
    generatePDF,
    generateExcel,
    previewDocument,
    downloadDocument,
    clearPreview,
  } = useDocumentGenerator({ reportType, data, filters });

  const handleGeneratePDF = () => {
    setExportType("pdf");
    setIsModalOpen(true);
    clearPreview();

    // Get the chart element if ref is provided
    const chartElement = chartContainerRef?.current || undefined;
    generatePDF(chartElement);
  };

  const handleGenerateExcel = () => {
    setExportType("excel");
    setIsModalOpen(true);
    clearPreview();
    generateExcel();
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setExportType(null);
    clearPreview();
  };

  const handleDownload = () => {
    downloadDocument();
    handleCloseModal();
  };

  const handlePreview = () => {
    previewDocument();
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" className={className}>
            <Download className="h-4 w-4 mr-2" />
            Export
            <ChevronDown className="h-4 w-4 ml-2" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          <DropdownMenuItem onClick={handleGeneratePDF}>
            <FileText className="h-4 w-4 mr-2 text-red-500" />
            <div className="flex flex-col">
              <span>Export as PDF</span>
              <span className="text-xs text-muted-foreground">
                With charts and formatting
              </span>
            </div>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={handleGenerateExcel}>
            <Table className="h-4 w-4 mr-2 text-green-500" />
            <div className="flex flex-col">
              <span>Export as Excel</span>
              <span className="text-xs text-muted-foreground">
                Detailed data tables
              </span>
            </div>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem disabled className="text-xs">
            <Eye className="h-4 w-4 mr-2" />
            Preview before download
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <DocumentPreviewModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        preview={preview}
        onDownload={handleDownload}
        onPreview={handlePreview}
        isGenerating={isGenerating}
      />
    </>
  );
};

// Simplified version for quick export without preview
export const QuickExportButtons: React.FC<ReportExportActionsProps> = ({
  reportType,
  data,
  filters,
  chartContainerRef,
  className = "",
}) => {
  const {
    generatePDF,
    generateExcel,
    downloadDocument,
    isGenerating,
    preview,
  } = useDocumentGenerator({ reportType, data, filters });

  const handleQuickPDF = () => {
    const chartElement = chartContainerRef?.current || undefined;
    generatePDF(chartElement);
  };

  const handleQuickExcel = () => {
    generateExcel();
  };

  // Auto-download when preview is ready
  React.useEffect(() => {
    if (preview && !isGenerating) {
      downloadDocument();
    }
  }, [preview, isGenerating, downloadDocument]);

  return (
    <div className={`flex gap-2 ${className}`}>
      <Button
        variant="outline"
        size="sm"
        onClick={handleQuickPDF}
        disabled={isGenerating}
      >
        {isGenerating ? (
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2" />
        ) : (
          <FileText className="h-4 w-4 mr-2 text-red-500" />
        )}
        PDF
      </Button>
      <Button
        variant="outline"
        size="sm"
        onClick={handleQuickExcel}
        disabled={isGenerating}
      >
        {isGenerating ? (
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2" />
        ) : (
          <Table className="h-4 w-4 mr-2 text-green-500" />
        )}
        Excel
      </Button>
    </div>
  );
};
