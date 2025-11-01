import { useStore } from "@tanstack/react-form";
import { Input as UIInput } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { ErrorMessages } from "./Error";
import { useFieldContext } from "./hooks";

export interface InputProps {
  label: string;
  type?: string;
  placeholder?: string;
  className?: string;
  required?: boolean;
  disabled?: boolean;
}

export function Input({
  label,
  type = "text",
  placeholder,
  className,
  required,
  disabled,
}: InputProps) {
  const field = useFieldContext<string>();
  const errors = useStore(field.store, (state) => state.meta.errors);

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
        type={type}
        name={field.name}
        value={field.state.value}
        onChange={(e) => field.handleChange(e.target.value)}
        onBlur={field.handleBlur}
        placeholder={placeholder}
        required={required}
        disabled={disabled}
        aria-invalid={field.state.meta.errors.length > 0}
        aria-describedby={
          field.state.meta.errors.length > 0 ? `${field.name}-error` : undefined
        }
      />
      {field.state.meta.isTouched && <ErrorMessages errors={errors} />}
    </div>
  );
}
