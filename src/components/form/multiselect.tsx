import type * as React from "react";
import { Label } from "@/components/ui/label";
import MultipleSelector, { type Option } from "@/components/ui/multiselect";
import { cn } from "@/lib/utils";
import { ErrorMessages } from "./Error";
import { useFieldContext } from "./hooks";

export interface MultiselectProps {
  label: string;
  options: Option[];
  placeholder?: string;
  className?: string;
  required?: boolean;
  disabled?: boolean;
  /** Limit the maximum number of selected options. */
  maxSelected?: number;
  /** When the number of selected options exceeds the limit, the onMaxSelected will be called. */
  onMaxSelected?: (maxLimit: number) => void;
  /** Hide the placeholder when there are options selected. */
  hidePlaceholderWhenSelected?: boolean;
  /** Group the options base on provided key. */
  groupBy?: string;
  /** Allow user to create option when there is no option matched. */
  creatable?: boolean;
  /** async search */
  onSearch?: (value: string) => Promise<Option[]>;
  /** sync search */
  onSearchSync?: (value: string) => Option[];
  /** Debounce time for async search. Only work with `onSearch`. */
  delay?: number;
  /** Trigger search when `onFocus`. */
  triggerSearchOnFocus?: boolean;
  /** Loading component. */
  loadingIndicator?: React.ReactNode;
  /** Empty component. */
  emptyIndicator?: React.ReactNode;
}

export function Multiselect({
  label,
  options,
  placeholder = "Select options...",
  className,
  required,
  disabled,
  maxSelected,
  onMaxSelected,
  hidePlaceholderWhenSelected,
  groupBy,
  creatable,
  onSearch,
  onSearchSync,
  delay,
  triggerSearchOnFocus,
  loadingIndicator,
  emptyIndicator,
}: MultiselectProps) {
  const field = useFieldContext<Option[]>();
  const value = field.state.value || [];

  return (
    <div className={cn("space-y-2", className)}>
      <Label
        htmlFor={field.name}
        className={
          required
            ? 'after:ml-0.5 after:text-destructive after:content-["*"]'
            : ""
        }
      >
        {label}
      </Label>
      <MultipleSelector
        value={value}
        options={options}
        onChange={(selectedOptions) => {
          field.handleChange(selectedOptions);
        }}
        inputProps={{
          onBlur: field.handleBlur,
          "aria-invalid": field.state.meta.errors.length > 0,
          "aria-describedby":
            field.state.meta.errors.length > 0
              ? `${field.name}-error`
              : undefined,
        }}
        placeholder={placeholder}
        disabled={disabled}
        maxSelected={maxSelected}
        onMaxSelected={onMaxSelected}
        hidePlaceholderWhenSelected={hidePlaceholderWhenSelected}
        groupBy={groupBy}
        creatable={creatable}
        onSearch={onSearch}
        onSearchSync={onSearchSync}
        delay={delay}
        triggerSearchOnFocus={triggerSearchOnFocus}
        loadingIndicator={loadingIndicator}
        emptyIndicator={emptyIndicator}
        className={cn(
          "w-full",
          field.state.meta.errors.length > 0 &&
            "border-destructive focus-within:ring-destructive",
        )}
      />
      {field.state.meta.isTouched && (
        <ErrorMessages errors={field.state.meta.errors} />
      )}
    </div>
  );
}
