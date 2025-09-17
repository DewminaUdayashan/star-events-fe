import { useState, useCallback } from "react";
import { useMutation } from "@tanstack/react-query";
import {
  documentGenerator,
  DocumentPreview,
} from "../lib/services/document-generator.service";
import {
  SalesReport,
  UserReport,
  EventReport,
  RevenueReport,
  ReportFilters,
} from "../lib/types/api";

interface UseDocumentGeneratorOptions {
  reportType: "sales" | "users" | "events" | "revenue";
  data: SalesReport | UserReport | EventReport | RevenueReport;
  filters?: ReportFilters;
}

export const useDocumentGenerator = ({
  reportType,
  data,
  filters,
}: UseDocumentGeneratorOptions) => {
  const [preview, setPreview] = useState<DocumentPreview | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  // PDF Generation Mutation
  const generatePdfMutation = useMutation({
    mutationFn: async ({ chartElement }: { chartElement?: HTMLElement }) => {
      console.log("PDF generation started...");
      setIsGenerating(true);
      try {
        const preview = await documentGenerator.generateReportPDF(
          reportType,
          data,
          filters,
          chartElement
        );
        console.log("PDF generated successfully:", preview.filename);
        setPreview(preview);
        // Automatically download the generated PDF
        console.log("Downloading PDF...");
        documentGenerator.downloadDocument(preview);
        return preview;
      } finally {
        setIsGenerating(false);
      }
    },
    onError: (error) => {
      console.error("PDF generation failed:", error);
      setIsGenerating(false);
    },
  });

  // Excel Generation Mutation
  const generateExcelMutation = useMutation({
    mutationFn: async () => {
      console.log("Excel generation started...");
      setIsGenerating(true);
      try {
        const preview = await documentGenerator.generateReportExcel(
          reportType,
          data,
          filters
        );
        console.log("Excel generated successfully:", preview.filename);
        setPreview(preview);
        // Automatically download the generated Excel
        console.log("Downloading Excel...");
        documentGenerator.downloadDocument(preview);
        return preview;
      } finally {
        setIsGenerating(false);
      }
    },
    onError: (error) => {
      console.error("Excel generation failed:", error);
      setIsGenerating(false);
    },
  });

  // Generate PDF with optional chart capture
  const generatePDF = useCallback(
    (chartElement?: HTMLElement) => {
      generatePdfMutation.mutate({ chartElement });
    },
    [generatePdfMutation]
  );

  // Generate Excel
  const generateExcel = useCallback(() => {
    generateExcelMutation.mutate();
  }, [generateExcelMutation]);

  // Preview document
  const previewDocument = useCallback(
    async (documentPreview?: DocumentPreview) => {
      const targetPreview = documentPreview || preview;
      if (targetPreview) {
        await documentGenerator.previewDocument(targetPreview);
      }
    },
    [preview]
  );

  // Download document
  const downloadDocument = useCallback(
    (documentPreview?: DocumentPreview) => {
      const targetPreview = documentPreview || preview;
      if (targetPreview) {
        documentGenerator.downloadDocument(targetPreview);
      }
    },
    [preview]
  );

  // Clear preview and free memory
  const clearPreview = useCallback(() => {
    if (preview?.url) {
      URL.revokeObjectURL(preview.url);
    }
    setPreview(null);
  }, [preview]);

  return {
    // State
    preview,
    isGenerating:
      isGenerating ||
      generatePdfMutation.isPending ||
      generateExcelMutation.isPending,
    error: generatePdfMutation.error || generateExcelMutation.error,

    // Actions
    generatePDF,
    generateExcel,
    previewDocument,
    downloadDocument,
    clearPreview,

    // Status
    isPdfGenerating: generatePdfMutation.isPending,
    isExcelGenerating: generateExcelMutation.isPending,
    pdfError: generatePdfMutation.error,
    excelError: generateExcelMutation.error,
  };
};

// Standalone hooks for when you don't need state management
export const useGeneratePDF = () => {
  return useMutation({
    mutationFn: async ({
      reportType,
      data,
      filters,
      chartElement,
    }: {
      reportType: "sales" | "users" | "events" | "revenue";
      data: SalesReport | UserReport | EventReport | RevenueReport;
      filters?: ReportFilters;
      chartElement?: HTMLElement;
    }) => {
      return documentGenerator.generateReportPDF(
        reportType,
        data,
        filters,
        chartElement
      );
    },
    onSuccess: (preview) => {
      // Auto-download on success
      documentGenerator.downloadDocument(preview);
    },
  });
};

export const useGenerateExcel = () => {
  return useMutation({
    mutationFn: async ({
      reportType,
      data,
      filters,
    }: {
      reportType: "sales" | "users" | "events" | "revenue";
      data: SalesReport | UserReport | EventReport | RevenueReport;
      filters?: ReportFilters;
    }) => {
      return documentGenerator.generateReportExcel(reportType, data, filters);
    },
    onSuccess: (preview) => {
      // Auto-download on success
      documentGenerator.downloadDocument(preview);
    },
  });
};
