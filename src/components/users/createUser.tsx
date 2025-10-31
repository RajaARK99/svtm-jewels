import { useEffect } from "react";
import { Button } from "../ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { PlusIcon } from "lucide-react";
import { useAppForm } from "@/components/form/hooks";
import { revalidateLogic } from "@tanstack/react-form";
import z from "zod";

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
    role:  "admin" | "employee";
    password: string;
  }) => void;
  isLoading: boolean;
}) => {
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
    }
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
          <PlusIcon className="size-4 mr-2" />
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
            <form.AppField
              name="name"
            >
              {(field) => <field.Input label="Name" required />}
            </form.AppField>

            <form.AppField
              name="email"
            >
              {(field) => <field.Input label="Email" type="email" required />}
            </form.AppField>

            <form.AppField
              name="role"
            >
              {(field) => (
                <field.Combobox label="Role" options={roleOptions} required />
              )}
            </form.AppField>

            <form.AppField
              name="password"
            >
              {(field) => (
                <field.Input label="Password" type="password" required />
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
            <form.SubscribeButton
              disabled={isLoading}
            >
              {({isSubmitting}) => isLoading || isSubmitting ? "Creating..." : "Create User"}
            </form.SubscribeButton>
          </DialogFooter>
        </form>

        </form.AppForm>
      </DialogContent>
    </Dialog>
  );
}

export default CreateUserDialog;