"use client";

import React, { useMemo, useState } from "react";
import {
  Listbox,
  ListboxButton,
  ListboxOptions,
  ListboxOption,
} from "@headlessui/react";
import {
  defaultCountries,
  usePhoneInput,
  type CountryData,
  type CountryIso2,
  type ParsedCountry,
} from "react-international-phone";
import { isValidPhoneNumber } from "libphonenumber-js";
import clsx from "clsx";

interface CountrySelectProps {
  value: ParsedCountry;
  onChange: (country: ParsedCountry) => void;
  options: CountryData[];
  disabled?: boolean;
  error?: boolean;
}

export const CountrySelect: React.FC<CountrySelectProps> = ({
  value,
  onChange,
  options,
  disabled,
  error,
}) => {
  const [query, setQuery] = useState("");

  const filteredOptions = useMemo(() => {
    return query === ""
      ? options
      : options.filter((c) =>
          c[0].toLowerCase().includes(query.toLowerCase()) ||
          c[2].includes(query)
        );
  }, [options, query]);

  const parseCountryData = (data: CountryData): ParsedCountry => ({
    name: data[0],
    iso2: data[1],
    dialCode: data[2],
    format: data[3],
    priority: data[4],
    areaCodes: data[5],
  });

  return (
    <div className="relative shrink-0">
      <Listbox value={value} onChange={onChange} disabled={disabled}>
        <ListboxButton
          className={clsx(
            "relative flex h-full w-[100px] items-center gap-2 rounded-l-lg border bg-gray-50 px-3 py-2.5 text-left text-sm transition-colors",
            "focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:z-10",
            "dark:bg-gray-800 dark:text-white",
            error
              ? "border-red-500 focus:border-red-500"
              : "border-gray-300 dark:border-gray-600 focus:border-brand-500",
            disabled && "cursor-not-allowed opacity-60"
          )}
        >
          <span className="flex h-4 w-6 shrink-0 overflow-hidden rounded-sm bg-gray-100 object-cover">
            <img
              src={`https://flagcdn.com/w40/${value.iso2}.png`}
              alt={value.name}
              className="h-full w-full object-cover"
            />
          </span>
          <span className="block truncate">+{value.dialCode}</span>
          <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2 text-gray-400">
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </span>
        </ListboxButton>

        <ListboxOptions
          transition
          className={clsx(
            "absolute z-50 mt-1 max-h-60 w-64 overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-gray-300 focus:outline-none sm:text-sm",
            "dark:bg-gray-800 dark:ring-gray-600",
            "transition duration-100 ease-in data-leave:opacity-0"
          )}
        >
          <div className="sticky top-0 z-10 border-b border-gray-100 bg-white p-2 dark:bg-gray-800 dark:border-gray-700">
            <input
              type="text"
              className="w-full rounded-md border border-gray-300 bg-gray-50 px-2 py-1 text-sm focus:border-brand-500 focus:outline-none dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              placeholder="Search..."
              onChange={(e) => setQuery(e.target.value)}
              onClick={(e) => e.stopPropagation()}
            />
          </div>

          {filteredOptions.map((country) => {
            const parsed = parseCountryData(country);
            return (
              <ListboxOption
                key={parsed.iso2}
                value={parsed}
                className={({ focus }) =>
                  clsx(
                    "relative cursor-default select-none py-2 pl-3 pr-9",
                    focus ? "bg-brand-50 text-brand-900 dark:bg-gray-700 dark:text-white" : "text-gray-900 dark:text-gray-300"
                  )
                }
              >
                {({ selected }) => (
                  <div className="flex items-center">
                    <span className="mr-3 flex h-4 w-6 shrink-0 overflow-hidden rounded-sm bg-gray-100">
                      <img
                        src={`https://flagcdn.com/w40/${parsed.iso2}.png`}
                        alt={parsed.name}
                        className="h-full w-full object-cover"
                      />
                    </span>
                    <span className={clsx("block truncate", selected ? "font-semibold" : "font-normal")}>
                      {parsed.name} (+{parsed.dialCode})
                    </span>
                  </div>
                )}
              </ListboxOption>
            );
          })}
        </ListboxOptions>
      </Listbox>
    </div>
  );
};

interface CountryCode {
  code: string;
  label?: string;
}

type CountryOption = CountryCode | CountryIso2;

interface PhoneInputProps {
  value?: string;
  onChange?: (phoneNumber: string, isValid?: boolean) => void;
  defaultCountry?: CountryIso2;
  countries?: CountryOption[];
  disabled?: boolean;
  error?: boolean;
  className?: string;
  id?: string;
  name?: string;
  placeholder?: string;
  onValidationChange?: (isValid: boolean) => void;
  showValidation?: boolean;
}

const resolveCountries = (countries?: CountryOption[]): CountryData[] | undefined => {
  if (!countries || countries.length === 0) return undefined;
  const countryMap = new Map<string, CountryData>(defaultCountries.map((c) => [c[1], c]));
  return countries
    .map((c) => {
      const iso2 = typeof c === "string" ? c.toLowerCase() : c.code.toLowerCase();
      return countryMap.get(iso2);
    })
    .filter(Boolean) as CountryData[];
};

const PhoneInput: React.FC<PhoneInputProps> = ({
  value,
  onChange,
  defaultCountry = "hk",
  countries,
  disabled,
  error,
  className,
  id,
  name,
  placeholder,
  showValidation,
  onValidationChange,
}) => {
  const resolvedCountries = useMemo(
    () => resolveCountries(countries) || defaultCountries,
    [countries]
  );

  const {
    inputValue,
    handlePhoneValueChange,
    country,
    setCountry,
    phone,
  } = usePhoneInput({
    defaultCountry,
    value,
    countries: resolvedCountries,
    disableDialCodeAndPrefix: true,
    disableCountryGuess: true,
    onChange: (data) => {
      const currentPhone = data.phone;
      let validationResult: boolean | undefined = undefined;

      if (showValidation && currentPhone) {
        try {
          validationResult = isValidPhoneNumber(currentPhone);
        } catch {
          validationResult = false;
        }
        onValidationChange?.(validationResult);
      }

      onChange?.(currentPhone, validationResult);
    },
  });

  const hasError = !!error || (showValidation && !!phone && phone.length > 5 && !isValidPhoneNumber(phone));
  const isValid = showValidation && phone && isValidPhoneNumber(phone);

  return (
    <div className={clsx("flex w-full", className)}>
      <CountrySelect
        value={country}
        onChange={(newCountry) => setCountry(newCountry.iso2)}
        options={resolvedCountries}
        disabled={!!disabled}
        error={hasError}
      />

      <div className="relative w-full">
        <input
          id={id}
          name={name}
          type="tel"
          value={inputValue}
          onChange={handlePhoneValueChange}
          placeholder={placeholder || "Phone number"}
          disabled={disabled}
          className={clsx(
            "block w-full rounded-r-lg border border-l-0 bg-transparent px-4 py-2.5 text-sm text-gray-900 placeholder-gray-400 transition-colors focus:z-10 focus:outline-none focus:ring-2",
            "dark:text-white dark:bg-gray-900 dark:placeholder-gray-500",
            hasError
              ? "border-red-500 focus:border-red-500 focus:ring-red-500/20"
              : "border-gray-300 dark:border-gray-600 focus:border-brand-500 focus:ring-brand-500/20",
            disabled && "cursor-not-allowed opacity-60"
          )}
        />

        {showValidation && phone && hasError && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
            <svg className="h-5 w-5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
        )}
      </div>
    </div>
  );
};

export default PhoneInput;
