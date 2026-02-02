"use client";

import React, { useRef, useImperativeHandle, forwardRef } from "react";

export interface OtpInputProps {
  value: string[];
  onChange: (value: string[]) => void;
  length?: number;
  disabled?: boolean;
  autoFocus?: boolean;
}

export interface OtpInputRef {
  focus: () => void;
  clear: () => void;
}

export const OtpInput = forwardRef<OtpInputRef, OtpInputProps>(
  ({ value, onChange, length = 6, disabled = false, autoFocus = false }, ref) => {
    const inputsRef = useRef<(HTMLInputElement | null)[]>([]);

    useImperativeHandle(ref, () => ({
      focus: () => {
        inputsRef.current[0]?.focus();
      },
      clear: () => {
        onChange(Array(length).fill(""));
        inputsRef.current[0]?.focus();
      },
    }));

    const handleChange = (inputValue: string, index: number) => {
      if (!/^\d*$/.test(inputValue)) return;

      const updatedOtp = [...value];
      updatedOtp[index] = inputValue;
      onChange(updatedOtp);

      if (inputValue && index < length - 1) {
        inputsRef.current[index + 1]?.focus();
      }
    };

    const handleKeyDown = (
      event: React.KeyboardEvent<HTMLInputElement>,
      index: number
    ) => {
      if (event.key === "Backspace") {
        const updatedOtp = [...value];

        if (!value[index] && index > 0) {
          inputsRef.current[index - 1]?.focus();
        }

        updatedOtp[index] = "";
        onChange(updatedOtp);
      }

      if (event.key === "ArrowLeft" && index > 0) {
        inputsRef.current[index - 1]?.focus();
      }

      if (event.key === "ArrowRight" && index < length - 1) {
        inputsRef.current[index + 1]?.focus();
      }
    };

    const handlePaste = (event: React.ClipboardEvent<HTMLInputElement>) => {
      event.preventDefault();

      const pasteData = event.clipboardData
        .getData("text")
        .replace(/\D/g, "")
        .slice(0, length)
        .split("");

      const updatedOtp = [...value];
      pasteData.forEach((char, idx) => {
        if (idx < updatedOtp.length) {
          updatedOtp[idx] = char;
        }
      });

      onChange(updatedOtp);

      const filledIndex = Math.min(pasteData.length - 1, length - 1);
      if (inputsRef.current[filledIndex]) {
        inputsRef.current[filledIndex]?.focus();
      }
    };

    return (
      <div className="flex gap-2 sm:gap-3">
        {value.map((digit, index) => (
          <input
            key={index}
            type="text"
            inputMode="numeric"
            maxLength={1}
            value={digit}
            onChange={(e) => handleChange(e.target.value, index)}
            onKeyDown={(e) => handleKeyDown(e, index)}
            onPaste={handlePaste}
            ref={(el) => {
              inputsRef.current[index] = el;
            }}
            autoFocus={autoFocus && index === 0}
            className="h-12 w-full rounded-lg border border-gray-300 bg-transparent text-center text-xl font-semibold text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/20 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90"
            disabled={disabled}
          />
        ))}
      </div>
    );
  }
);

OtpInput.displayName = "OtpInput";
