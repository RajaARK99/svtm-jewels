import { revalidateLogic } from "@tanstack/react-form";
import { useEffect } from "react";
import z from "zod";
import { useAppForm } from "@/components/form/hooks";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { User } from "@/db/schema";
import { Button } from "../ui/button";

const roleOptions = [
  { value: "admin", label: "Admin" },
  { value: "employee", label: "Employee" },
];

const EditUserDialog = ({
  open,
  onOpenChange,
  user,
  onSubmit,
  isLoading,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: User;
  onSubmit: (data: {
    id: string;
    name?: string;
    email?: string;
    role?: "admin" | "employee";
    password?: string;
  }) => void;
  isLoading: boolean;
}) => {
  const form = useAppForm({
    defaultValues: {
      name: user.name,
      email: user.email,
      role: (user.role || "employee") as "admin" | "employee",
    },
    onSubmit: async ({ value }) => {
      const updateData: {
        id: string;
        name?: string;
        email?: string;
        role?: "admin" | "employee";
      } = { id: user.id };

      // Only include changed fields
      if (value.name !== user.name) updateData.name = value.name;
      if (value.email !== user.email) updateData.email = value.email;
      if (value.role !== user.role) updateData.role = value.role;

      onSubmit(updateData);
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
      }),
    },
  });

  // Reset form when dialog closes or user changes
  useEffect(() => {
    if (!open) {
      form.reset();
    } else {
      // Update form values when user prop changes
      form.setFieldValue("name", user.name);
      form.setFieldValue("email", user.email);
      form.setFieldValue(
        "role",
        (user.role || "employee") as "admin" | "employee",
      );
    }
  }, [open, user, form]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
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
              <DialogTitle>Edit User</DialogTitle>
              <DialogDescription>
                Update user information. Leave password empty to keep the
                current password.
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
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>
              <form.SubscribeButton>
                {({ isSubmitting }) =>
                  isLoading || isSubmitting ? "Updating..." : "Update User"
                }
              </form.SubscribeButton>
            </DialogFooter>
          </form>
        </form.AppForm>
      </DialogContent>
    </Dialog>
  );
};

export default EditUserDialog;
