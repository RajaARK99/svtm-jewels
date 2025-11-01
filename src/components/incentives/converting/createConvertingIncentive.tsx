import { revalidateLogic } from "@tanstack/react-form";
import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import z from "zod";
import { useAppForm } from "@/components/form/hooks";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { api } from "@/lib/orpc/client";

interface CreateConvertingIncentiveDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: {
    employeeId: string;
    date: string;
    typeId: string;
    weight: number;
    visit: number;
    amount: number;
  }) => void;
  isLoading: boolean;
}

const CreateConvertingIncentiveDialog = ({
  open,
  onOpenChange,
  onSubmit,
  isLoading,
}: CreateConvertingIncentiveDialogProps) => {
  // Fetch options data
  const { data: optionsData } = useQuery(
    api.getOptions.queryOptions({
      input: {
        type: ["convertingType"],
      },
    }),
  );

  // Fetch employees
  const { data: employeesData } = useQuery(
    api.employeeRouter.getEmployee.queryOptions({
      input: {
        pagination: { page: 1, limit: 1000 },
      },
    }),
  );

  const convertingTypes =
    optionsData?.find((opt) => opt.type === "convertingType")?.data ?? [];
  const employees = employeesData?.data ?? [];

  const form = useAppForm({
    defaultValues: {
      employeeId: "",
      date: null as Date | null,
      typeId: "",
      weight: 0,
      visit: 0,
      amount: 0,
    },
    onSubmit: async ({ value }) => {
      if (!value.date) {
        return;
      }
      onSubmit({
        employeeId: value.employeeId,
        date: value.date.toISOString(),
        typeId: value.typeId,
        weight: value.weight,
        visit: value.visit,
        amount: value.amount,
      });
    },
    validationLogic: revalidateLogic({
      mode: "submit",
      modeAfterSubmission: "change",
    }),
    validators: {
      onDynamic: z.object({
        employeeId: z.string().min(1, "Employee is required"),
        date: z.date("Date is required"),
        typeId: z.string().min(1, "Type is required"),
        weight: z.number().min(1, "Weight is required"),
        visit: z.number().min(1, "Visit is required"),
        amount: z.number().min(1, "Amount is required"),
      }),
    },
  });

  // Reset form when dialog closes
  useEffect(() => {
    if (!open) {
      form.reset();
    }
  }, [open, form]);

  const employeeOptions = employees.map((employee) => ({
    value: employee.id,
    label: `${employee.user?.name || "N/A"} (${employee.user?.email || "N/A"})`,
  }));

  const convertingTypeOptions = convertingTypes.map((type) => ({
    value: type.id,
    label: type.name,
  }));

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <form.AppForm>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              e.stopPropagation();
              form.handleSubmit();
            }}
          >
            <DialogHeader>
              <DialogTitle>Create Converting Incentive</DialogTitle>
              <DialogDescription>
                Add a new converting incentive record.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <form.AppField name="employeeId">
                {(field) => {
                  return (
                    <field.Combobox
                      options={employeeOptions}
                      label="Employee"
                      required
                    />
                  );
                }}
              </form.AppField>
              <form.AppField name="date">
                {(field) => {
                  return <field.DatePicker label="Date" required />;
                }}
              </form.AppField>
              <form.AppField name="typeId">
                {(field) => {
                  return (
                    <field.Combobox
                      options={convertingTypeOptions}
                      label="Type"
                      required
                    />
                  );
                }}
              </form.AppField>
              <form.AppField name="weight">
                {(field) => {
                  return (
                    <field.NumberInput
                      label="Weight"
                      placeholder="Enter weight"
                      required
                    />
                  );
                }}
              </form.AppField>
              <form.AppField name="visit">
                {(field) => {
                  return (
                    <field.NumberInput
                      label="Visit"
                      placeholder="Enter visit count"
                      required
                    />
                  );
                }}
              </form.AppField>
              <form.AppField name="amount">
                {(field) => {
                  return (
                    <field.NumberInput
                      label="Amount"
                      placeholder="Enter amount"
                      required
                    />
                  );
                }}
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
                  isLoading || isSubmitting
                    ? "Creating..."
                    : "Create Converting Incentive"
                }
              </form.SubscribeButton>
            </DialogFooter>
          </form>
        </form.AppForm>
      </DialogContent>
    </Dialog>
  );
};

export default CreateConvertingIncentiveDialog;
