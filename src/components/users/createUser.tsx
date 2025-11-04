import { revalidateLogic } from "@tanstack/react-form";
import { Eye, EyeOff, PlusIcon } from "lucide-react";
import { useEffect, useState } from "react";
import z from "zod";
import { useAppForm } from "@/components/form/hooks";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "../ui/button";
import { Field, FieldError, FieldLabel } from "../ui/field";
import { InputGroup, InputGroupAddon, InputGroupButton, InputGroupInput } from "../ui/input-group";

const roleOptions = [
  { value: "admin", label: "Admin" },
  { value: "employee", label: "Employee" },
];

const CreateUserDialog = ({
  open,
  onOpenChange,
  onSubmit,
  isLoading,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: {
    name: string;
    email: string;
    role: "admin" | "employee";
    password: string;
  }) => void;
  isLoading: boolean;
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const form = useAppForm({
    defaultValues: {
      name: "",
      email: "",
      role: "employee" as "admin" | "employee",
      password: "",
    },
    onSubmit: async ({ value }) => {
      onSubmit(value);
      form.reset();
      onOpenChange(false);
    },
    validationLogic: revalidateLogic({
      mode: "submit",
      modeAfterSubmission: "change",
    }),
    validators: {
      onDynamic: z.object({
        name: z.string().min(1, "Name is required"),
        email: z.email("Please enter a valid email address"),
        role: z.union([z.literal("admin"), z.literal("employee")]),
        password: z.string().min(6, "Password must be at least 6 characters"),
      }),
    },
  });

  // Reset form when dialog closes
  useEffect(() => {
    if (!open) {
      form.reset();
    }
  }, [open, form]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button>
          <PlusIcon className="mr-2 size-4" />
          Create User
        </Button>
      </DialogTrigger>
      <DialogContent>
        <form.AppForm>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              e.stopPropagation();
              form.handleSubmit();
            }}
          >
            <DialogHeader>
              <DialogTitle>Create New User</DialogTitle>
              <DialogDescription>
                Add a new user to the system. All fields are required.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <form.AppField name="name">
                {(field) => <field.Input label="Name" required />}
              </form.AppField>

              <form.AppField name="email">
                {(field) => <field.Input label="Email" type="email" required />}
              </form.AppField>

              <form.AppField name="role">
                {(field) => (
                  <field.Combobox label="Role" options={roleOptions} required />
                )}
              </form.AppField>
               <form.AppField name="password">
              {(field) => (
                <Field>
                  <FieldLabel htmlFor="password">Password</FieldLabel>

                  <InputGroup>
                    <InputGroupInput
                      autoComplete="off"
                      id="password"
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(e.target.value)}
                      placeholder="••••••••"
                      type={showPassword ? "text" : "password"}
                      value={field.state.value}
                    />
                    <InputGroupAddon align="inline-end">
                      <InputGroupButton
                        aria-label={
                          showPassword ? "Hide password" : "Show password"
                        }
                        onClick={() => setShowPassword(!showPassword)}
                        size="icon-xs"
                        variant="ghost"
                      >
                        {showPassword ? (
                          <EyeOff className="text-muted-foreground" />
                        ) : (
                          <Eye className="text-muted-foreground" />
                        )}
                      </InputGroupButton>
                    </InputGroupAddon>
                  </InputGroup>

                  {field.state.meta.isTouched && !field.state.meta.isValid ? (
                    <FieldError errors={field.state.meta.errors} />
                  ) : null}
                </Field>
              )}
            </form.AppField>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>
              <form.SubscribeButton disabled={isLoading}>
                {({ isSubmitting }) =>
                  isLoading || isSubmitting ? "Creating..." : "Create User"
                }
              </form.SubscribeButton>
            </DialogFooter>
          </form>
        </form.AppForm>
      </DialogContent>
    </Dialog>
  );
};

export default CreateUserDialog;
