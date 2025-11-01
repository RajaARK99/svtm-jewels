import { useStore } from "@tanstack/react-form";
import dayjs from "dayjs";
import { CalendarIcon, ChevronDownIcon } from "lucide-react";
import * as React from "react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { ErrorMessages } from "./Error";
import { useFieldContext } from "./hooks";

export interface DatePickerProps {
  label: string;
  placeholder?: string;
  className?: string;
  required?: boolean;
  disabled?: boolean;
  min?: Date;
  max?: Date;
  captionLayout?: "dropdown" | "dropdown-months" | "dropdown-years" | "buttons";
}

export function DatePicker({
  label,
  placeholder = "Select date",
  className,
  required,
  disabled,
  min,
  max,
  captionLayout = "dropdown",
}: DatePickerProps) {
  const field = useFieldContext<Date | null>();
  const errors = useStore(field.store, (state) => state.meta.errors);
  const [open, setOpen] = React.useState(false);

  // Convert ISO string to Date object
  const dateValue = React.useMemo(() => {
    if (!field.state.value) return undefined;
    try {
      return dayjs(field.state.value).toDate();
    } catch {
      return undefined;
    }
  }, [field.state.value]);

  const handleSelect = (date: Date | undefined) => {
    if (date) {
      // Store as ISO string
      field.handleChange(date);
    } else {
      field.handleChange(null);
    }
    setOpen(false);
  };

  const formatDisplayDate = (date: Date | undefined) => {
    if (!date) return "";
    return dayjs(date).format("MMM DD, YYYY");
  };

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
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            id={field.name}
            disabled={disabled}
            className={cn(
              "w-full justify-start text-left font-normal",
              !dateValue && "text-muted-foreground",
              field.state.meta.errors.length > 0 && "border-destructive",
            )}
            aria-invalid={field.state.meta.errors.length > 0}
            aria-describedby={
              field.state.meta.errors.length > 0
                ? `${field.name}-error`
                : undefined
            }
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {dateValue ? (
              <span>{formatDisplayDate(dateValue)}</span>
            ) : (
              <span>{placeholder}</span>
            )}
            <ChevronDownIcon className="ml-auto h-4 w-4 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="single"
            selected={dateValue}
            onSelect={handleSelect}
            captionLayout={
              captionLayout === "buttons" ? "label" : captionLayout
            }
            disabled={disabled}
            hidden={{
              before: min,
              after: max,
              from: undefined,
              dayOfWeek: undefined,
            }}
            autoFocus
          />
        </PopoverContent>
      </Popover>

      {field.state.meta.isTouched && <ErrorMessages errors={errors} />}
    </div>
  );
}
