import { Label } from "@/components/ui/label";
import { Textarea as UITextarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { useFieldContext } from "./hooks";
import { useStore } from "@tanstack/react-form";
import { ErrorMessages } from "./Error";

export interface TextAreaProps {
  label: string;
  placeholder?: string;
  className?: string;
  required?: boolean;
  disabled?: boolean;
  rows?: number;
}

export function TextArea({
  label,
  placeholder,
  className,
  required,
  disabled,
  rows,
}: TextAreaProps) {
  const field = useFieldContext<string>();
  const errors = useStore(field.store, (state) => state.meta.errors)
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
      <UITextarea
        id={field.name}
        name={field.name}
        value={field.state.value}
        onChange={(e) => field.handleChange(e.target.value)}
        onBlur={field.handleBlur}
        placeholder={placeholder}
        required={required}
        disabled={disabled}
        rows={rows}
        aria-invalid={field.state.meta.errors.length > 0}
        aria-describedby={
          field.state.meta.errors.length > 0 ? `${field.name}-error` : undefined
        }
      />
      {field.state.meta.isTouched && <ErrorMessages errors={errors} />}
    </div>
  );
}
