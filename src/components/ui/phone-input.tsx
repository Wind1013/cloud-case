"use client";

import * as React from "react";
import PhoneNumberInput, {
  type Props as LibPhoneNumberInputProps,
} from "react-phone-number-input";
import "react-phone-number-input/style.css";
import { cn } from "@/lib/utils";

interface PhoneInputProps
  extends Omit<LibPhoneNumberInputProps<string | undefined>, "onChange"> {
  onChange?: (value: string) => void;
}

// Instead we create a simple wrapper that handles className and onChange properly
const PhoneInput = React.forwardRef<HTMLDivElement, PhoneInputProps>(
  ({ className, onChange, ...props }, ref) => (
    <div ref={ref} className={className}>
      <PhoneNumberInput
        className={cn(
          "flex h-10 rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm"
        )}
        onChange={value => onChange?.(value ?? "")}
        {...props}
      />
    </div>
  )
);

PhoneInput.displayName = "PhoneInput";

export { PhoneInput };
