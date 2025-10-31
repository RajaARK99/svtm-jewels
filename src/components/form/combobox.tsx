import { Check, ChevronDownIcon } from "lucide-react";
import * as React from "react";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { ErrorMessages } from "./Error";
import { useFieldContext } from "./hooks";

export interface ComboboxOption {
  value: string;
  label: string;
}

export interface ComboboxProps {
  label: string;
  options: ComboboxOption[];
  placeholder?: string;
  searchPlaceholder?: string;
  className?: string;
  required?: boolean;
  disabled?: boolean;
}

export function Combobox({
  label,
  options,
  placeholder = "Select an option...",
  searchPlaceholder = "Search...",
  className,
  required,
  disabled,
}: ComboboxProps) {
  const field = useFieldContext<string>();
  const [open, setOpen] = React.useState(false);

  const value = field.state.value;

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
            id={field.name}
            variant="outline"
            role="combobox"
            aria-expanded={open}
            disabled={disabled}
            className="w-full justify-between border-input bg-background px-3 font-normal outline-none outline-offset-0 hover:bg-background focus-visible:outline-[3px]"
          >
            <span className={cn("truncate", !value && "text-muted-foreground")}>
              {value
                ? options.find((option) => option.value === value)?.label
                : placeholder}
            </span>
            <ChevronDownIcon
              size={16}
              className="shrink-0 text-muted-foreground/80"
              aria-hidden="true"
            />
          </Button>
        </PopoverTrigger>
        <PopoverContent
          className="w-full min-w-(--radix-popper-anchor-width) border-input p-0"
          align="start"
          side="bottom"
        >
          <Command>
            <CommandInput placeholder={searchPlaceholder} />
            <CommandList>
              <CommandEmpty>No options found.</CommandEmpty>
              <CommandGroup>
                {options.map((option) => (
                  <CommandItem
                    key={option.value}
                    value={option.value}
                    onSelect={(currentValue) => {
                      field.handleChange(
                        currentValue === value ? "" : currentValue,
                      );
                      setOpen(false);
                    }}
                  >
                    {option.label}
                    {value === option.value && (
                      <Check size={16} className="ml-auto" />
                    )}
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>

      {field.state.meta.isTouched && (
        <ErrorMessages errors={field.state.meta.errors} />
      )}
    </div>
  );
}
