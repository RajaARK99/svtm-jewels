import { useStore } from "@tanstack/react-form";
import { Input as UIInput } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { ErrorMessages } from "./Error";
import { useFieldContext } from "./hooks";

export interface NumberInputProps {
  label: string;
  placeholder?: string;
  className?: string;
  required?: boolean;
  disabled?: boolean;
  min?: number;
  max?: number;
  step?: number;
}

export function NumberInput({
  label,
  placeholder,
  className,
  required,
  disabled,
  min,
  max,
  step,
}: NumberInputProps) {
  const field = useFieldContext<number>();
  const errors = useStore(field.store, (state) => state.meta.errors);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value === "" || value === "-") {
      // Set to 0 when empty - validation will catch if a positive value is required
      field.handleChange(0);
      return;
    }
    const numValue = Number(value);
    if (!Number.isNaN(numValue)) {
      field.handleChange(numValue);
    }
  };

  const displayValue =
    field.state.value !== undefined && field.state.value !== null
      ? String(field.state.value)
      : "";

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
      <UIInput
        id={field.name}
        type="number"
        name={field.name}
        value={displayValue}
        onChange={handleChange}
        onBlur={field.handleBlur}
        placeholder={placeholder}
        required={required}
        disabled={disabled}
        min={min}
        max={max}
        step={step}
        aria-invalid={field.state.meta.errors.length > 0}
        aria-describedby={
          field.state.meta.errors.length > 0 ? `${field.name}-error` : undefined
        }
      />
      {field.state.meta.isTouched && <ErrorMessages errors={errors} />}
    </div>
  );
}
