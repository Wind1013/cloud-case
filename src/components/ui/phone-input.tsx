"use client";

import * as React from "react";
import dynamic from "next/dynamic";
import { cn } from "@/lib/utils";

// Dynamically import to avoid Node.js module issues with Turbopack
const PhoneNumberInput = dynamic(
  () => {
    // Only import on client side
    if (typeof window === "undefined") {
      return Promise.resolve(() => null);
    }
    
    return import("react-phone-number-input")
      .then((mod) => mod.default)
      .catch((error) => {
        console.error("Failed to load phone input:", error);
        // Return a fallback component
        return () => (
          <div className="flex h-10 rounded-md border border-input bg-background px-3 py-2">
            <span className="text-muted-foreground">Phone input unavailable</span>
          </div>
        );
      });
  },
  {
    ssr: false,
    loading: () => (
      <div className="flex h-10 rounded-md border border-input bg-background px-3 py-2">
        <span className="text-muted-foreground">Loading...</span>
      </div>
    ),
  }
);

interface PhoneInputProps {
  value?: string;
  onChange?: (value: string) => void;
  defaultCountry?: string;
  international?: boolean;
  className?: string;
  placeholder?: string;
  maxLength?: number;
  [key: string]: any;
}

const PhoneInput = React.forwardRef<HTMLDivElement, PhoneInputProps>(
  ({ className, onChange, maxLength, value, ...props }, ref) => {
    const containerRef = React.useRef<HTMLDivElement>(null);
    const lastValidValueRef = React.useRef<string>(value || "");

    // Update ref when value prop changes
    React.useEffect(() => {
      if (value !== undefined) {
        lastValidValueRef.current = value;
      }
    }, [value]);

    // Intercept input events on the actual input element
    React.useEffect(() => {
      if (!containerRef.current || !maxLength) return;

      const findInput = (): HTMLInputElement | null => {
        return containerRef.current?.querySelector('input[type="tel"]') as HTMLInputElement || null;
      };

      const handleBeforeInput = (e: InputEvent) => {
        const target = e.target as HTMLInputElement;
        if (!target) return;

        // Get what the value would be after this input
        const currentValue = target.value || "";
        let newValue = currentValue;
        
        if (e.inputType === "insertText" || e.inputType === "insertCompositionText") {
          newValue = currentValue + (e.data || "");
        } else if (e.inputType === "deleteContentBackward" || e.inputType === "deleteContentForward") {
          // Allow deletion
          return;
        } else {
          // For other input types, allow and check in handleInput
          return;
        }

        const digits = newValue.replace(/\D/g, "");
        if (digits.length > maxLength) {
          e.preventDefault();
          e.stopImmediatePropagation();
          return false;
        }
      };

      const handleInput = (e: Event) => {
        const target = e.target as HTMLInputElement;
        if (!target) return;

        const inputValue = target.value || "";
        const digits = inputValue.replace(/\D/g, "");

        if (digits.length > maxLength) {
          // Restore the last valid value
          const lastValid = lastValidValueRef.current;
          if (lastValid) {
            target.value = lastValid;
            // Trigger change event to sync with React state
            const changeEvent = new Event("change", { bubbles: true });
            target.dispatchEvent(changeEvent);
          }
        }
      };

      // Use MutationObserver to watch for input element being added
      const observer = new MutationObserver(() => {
        const input = findInput();
        if (input) {
          input.addEventListener("beforeinput", handleBeforeInput, { capture: true });
          input.addEventListener("input", handleInput, { capture: true });
        }
      });

      observer.observe(containerRef.current, {
        childList: true,
        subtree: true,
      });

      // Also try to attach immediately
      const input = findInput();
      if (input) {
        input.addEventListener("beforeinput", handleBeforeInput, { capture: true });
        input.addEventListener("input", handleInput, { capture: true });
      }

      return () => {
        observer.disconnect();
        const input = findInput();
        if (input) {
          input.removeEventListener("beforeinput", handleBeforeInput, { capture: true });
          input.removeEventListener("input", handleInput, { capture: true });
        }
      };
    }, [maxLength, value]);

    const handleChange = (newValue: string | undefined) => {
      if (!newValue) {
        lastValidValueRef.current = "";
        onChange?.(newValue ?? "");
        return;
      }

      // Extract digits to check length
      const digits = newValue.replace(/\D/g, "");
      
      // If maxLength is set and digits exceed it, restore last valid value
      if (maxLength && digits.length > maxLength) {
        // Restore the last valid value to prevent the change
        onChange?.(lastValidValueRef.current);
        return;
      }

      // Update the last valid value and allow the change
      lastValidValueRef.current = newValue;
      onChange?.(newValue);
    };

    return (
      <div ref={containerRef} className={className}>
        <PhoneNumberInput
          className={cn(
            "flex h-10 rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm"
          )}
          value={value}
          onChange={handleChange}
          {...props}
        />
      </div>
    );
  }
);

PhoneInput.displayName = "PhoneInput";

export { PhoneInput };
