import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Converts base64 string to Blob - compatible with all browsers
 */
export function base64ToBlob(base64: string, mimeType: string = "application/pdf"): Blob {
  const byteCharacters = atob(base64);
  const byteNumbers = new Array(byteCharacters.length);
  for (let i = 0; i < byteCharacters.length; i++) {
    byteNumbers[i] = byteCharacters.charCodeAt(i);
  }
  const byteArray = new Uint8Array(byteNumbers);
  return new Blob([byteArray], { type: mimeType });
}

/**
 * Opens PDF in new window with fallback to download if popup is blocked
 * Compatible with all modern browsers (Chrome, Firefox, Safari, Edge)
 */
export function openPdfInNewWindow(blob: Blob, filename: string): void {
  const fileURL = URL.createObjectURL(blob);
  const newWindow = window.open(fileURL, "_blank");
  
  // If popup was blocked, trigger download instead
  if (!newWindow || newWindow.closed || typeof newWindow.closed === "undefined") {
    // Popup blocked, use download fallback
    downloadPdf(blob, filename);
    // Clean up after a delay to ensure download starts
    setTimeout(() => {
      URL.revokeObjectURL(fileURL);
    }, 100);
  } else {
    // Clean up when window is closed
    newWindow.addEventListener("beforeunload", () => {
      URL.revokeObjectURL(fileURL);
    });
  }
}

/**
 * Triggers PDF download - compatible with all browsers
 * Works in Chrome, Firefox, Safari, Edge, and mobile browsers
 */
export function downloadPdf(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.style.display = "none";
  link.setAttribute("download", filename); // Ensure download attribute is set
  
  // Append to body (required for Firefox)
  document.body.appendChild(link);
  
  // Trigger download
  link.click();
  
  // Clean up
  setTimeout(() => {
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }, 100);
}

/**
 * Handles PDF response from API - converts base64 to blob and opens/downloads
 * Compatible with all browsers
 */
export function handlePdfResponse(base64Pdf: string, filename: string, openInNewWindow: boolean = false): void {
  const blob = base64ToBlob(base64Pdf, "application/pdf");
  
  if (openInNewWindow) {
    openPdfInNewWindow(blob, filename);
  } else {
    downloadPdf(blob, filename);
  }
}
