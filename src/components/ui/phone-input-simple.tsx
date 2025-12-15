"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";

interface PhoneInputSimpleProps {
  value?: string;
  onChange?: (value: string) => void;
  defaultCountry?: string;
  international?: boolean;
  className?: string;
  placeholder?: string;
  maxLength?: number;
  [key: string]: any;
}

export const PhoneInputSimple = React.forwardRef<HTMLInputElement, PhoneInputSimpleProps>(
  ({ className, onChange, maxLength, value, defaultCountry = "PH", international = true, placeholder, ...props }, ref) => {
    const [displayValue, setDisplayValue] = React.useState<string>(value || "");
    const inputRef = React.useRef<HTMLInputElement>(null);

    React.useEffect(() => {
      setDisplayValue(value || "");
    }, [value]);

    const formatPhoneNumber = (input: string): string => {
      if (!input || input.trim() === "") return "";

      const digits = input.replace(/\D/g, "");
      
      // If no digits, return empty string
      if (digits.length === 0) return "";
      
      if (defaultCountry === "PH") {
        if (international) {
          // Format as +63 9XX XXX XXXX
          if (digits.startsWith("63")) {
            const numberPart = digits.slice(2);
            if (numberPart.length === 0) return ""; // Don't show "+63" if no number after
            if (numberPart.length <= 3) return `+63 ${numberPart}`;
            if (numberPart.length <= 6) return `+63 ${numberPart.slice(0, 3)} ${numberPart.slice(3)}`;
            return `+63 ${numberPart.slice(0, 3)} ${numberPart.slice(3, 6)} ${numberPart.slice(6, 10)}`;
          } else if (digits.startsWith("0")) {
            // Local format: 09XX XXX XXXX
            if (digits.length <= 4) return digits;
            if (digits.length <= 7) return `${digits.slice(0, 4)} ${digits.slice(4)}`;
            return `${digits.slice(0, 4)} ${digits.slice(4, 7)} ${digits.slice(7, 11)}`;
          } else if (digits.length > 0) {
            // Assume international if starts with number
            return formatPhoneNumber(`63${digits}`);
          }
        } else {
          // Local format only
          if (digits.startsWith("0")) {
            if (digits.length <= 4) return digits;
            if (digits.length <= 7) return `${digits.slice(0, 4)} ${digits.slice(4)}`;
            return `${digits.slice(0, 4)} ${digits.slice(4, 7)} ${digits.slice(7, 10)}`;
          }
        }
      }

      return input;
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      let inputValue = e.target.value;
      
      // Extract digits to check length
      const digits = inputValue.replace(/\D/g, "");
      
      // Apply maxLength limit
      if (maxLength && digits.length > maxLength) {
        // Truncate to maxLength
        const truncated = digits.slice(0, maxLength);
        inputValue = formatPhoneNumber(truncated);
        setDisplayValue(inputValue);
        onChange?.(inputValue);
        return;
      }

      // Format the phone number
      const formatted = formatPhoneNumber(inputValue);
      setDisplayValue(formatted);
      onChange?.(formatted);
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
      // Allow: backspace, delete, tab, escape, enter, and arrow keys
      if ([8, 9, 27, 13, 46, 37, 38, 39, 40].indexOf(e.keyCode) !== -1 ||
        (e.keyCode === 65 && e.ctrlKey === true) || // Allow: Ctrl+A
        (e.keyCode >= 35 && e.keyCode <= 40)) { // Allow: home, end, left, right
        return;
      }
      // Ensure that it is a number and stop the keypress
      if ((e.shiftKey || (e.keyCode < 48 || e.keyCode > 57)) && (e.keyCode < 96 || e.keyCode > 105)) {
        // Allow + at the start
        if (e.keyCode === 187 && (e.target as HTMLInputElement).value.length === 0) {
          return;
        }
        e.preventDefault();
      }
    };

    // Extract the number part (without +63) for display in the input
    const isInternationalFormat = displayValue.startsWith("+63");
    const numberPart = isInternationalFormat ? displayValue.replace(/^\+63\s*/, "") : displayValue;

    const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const inputValue = e.target.value;
      // If international format, prepend +63 to the value
      if (defaultCountry === "PH" && international) {
        const digits = inputValue.replace(/\D/g, "");
        if (digits.length > 0) {
          // Format with +63 prefix
          const formatted = formatPhoneNumber(`63${digits}`);
          setDisplayValue(formatted);
          onChange?.(formatted);
        } else {
          setDisplayValue("");
          onChange?.("");
        }
      } else {
        handleChange(e);
      }
    };

    return (
      <div className="flex items-center gap-2">
        {defaultCountry === "PH" && international && (
          <div className="flex items-center h-10 px-3 rounded-md border border-input bg-muted text-muted-foreground text-sm font-medium whitespace-nowrap">
            +63
          </div>
        )}
        <Input
          ref={ref || inputRef}
          type="tel"
          value={numberPart}
          onChange={handleNumberChange}
          onKeyDown={handleKeyDown}
          className={cn(
            "flex h-10 rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm flex-1",
            className
          )}
          placeholder={placeholder || (international ? "912 345 6789" : "0912 345 6789")}
          {...props}
        />
      </div>
    );
  }
);

PhoneInputSimple.displayName = "PhoneInputSimple";

