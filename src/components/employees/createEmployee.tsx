import { revalidateLogic } from "@tanstack/react-form";
import { useQuery } from "@tanstack/react-query";
import { PlusIcon } from "lucide-react";
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
  DialogTrigger,
} from "@/components/ui/dialog";
import { api } from "@/lib/orpc/client";
import { Button } from "../ui/button";

interface CreateEmployeeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: {
    userId: string;
    dateOfJoining: string;
    jobTitleId: string;
    businessUnitId: string;
    departmentId: string;
    locationId: string;
    legalEntityId: string;
    reportingToUserId: string;
    salesIncentiveTypeId?: string;
  }) => void;
  isLoading: boolean;
}

const CreateEmployeeDialog = ({
  open,
  onOpenChange,
  onSubmit,
  isLoading,
}: CreateEmployeeDialogProps) => {
  // Fetch options data
  const { data: optionsData } = useQuery(
    api.getOptions.queryOptions({
      input: {
        type: [
          "jobTitle",
          "businessUnit",
          "department",
          "location",
          "legalEntity",
          "salesIncentiveType",
        ],
      },
    }),
  );

  // Fetch users for userId and reportingToUserId dropdowns
  const { data: usersData } = useQuery(
    api.userRouter.getUsers.queryOptions({
      input: {
        pagination: { page: 1, limit: 1000 },
        filter: {
          role: "employee",
        },
      },
    }),
  );

  const jobTitles =
    optionsData?.find((opt) => opt.type === "jobTitle")?.data ?? [];
  const businessUnits =
    optionsData?.find((opt) => opt.type === "businessUnit")?.data ?? [];
  const departments =
    optionsData?.find((opt) => opt.type === "department")?.data ?? [];
  const locations =
    optionsData?.find((opt) => opt.type === "location")?.data ?? [];
  const legalEntities =
    optionsData?.find((opt) => opt.type === "legalEntity")?.data ?? [];
  const salesIncentiveTypes =
    optionsData?.find((opt) => opt.type === "salesIncentiveType")?.data ?? [];
  const users = usersData?.data ?? [];

  const form = useAppForm({
    defaultValues: {
      userId: "",
      dateOfJoining: null as Date | null,
      jobTitleId: "",
      businessUnitId: "",
      departmentId: "",
      locationId: "",
      legalEntityId: "",
      reportingToUserId: "",
      salesIncentiveTypeId: "",
    },
    onSubmit: async ({ value }) => {
      if (!value.dateOfJoining) {
        return;
      }
      onSubmit({
        userId: value.userId,
        dateOfJoining: value.dateOfJoining.toISOString(),
        jobTitleId: value.jobTitleId,
        businessUnitId: value.businessUnitId,
        departmentId: value.departmentId,
        locationId: value.locationId,
        legalEntityId: value.legalEntityId,
        reportingToUserId: value.reportingToUserId,
        salesIncentiveTypeId: value.salesIncentiveTypeId || undefined,
      });
    },
    validationLogic: revalidateLogic({
      mode: "submit",
      modeAfterSubmission: "change",
    }),
    validators: {
      onDynamic: z.object({
        userId: z.string().min(1, "User is required"),
        dateOfJoining: z.date("Date of joining is required"),
        jobTitleId: z.string().min(1, "Job title is required"),
        businessUnitId: z.string().min(1, "Business unit is required"),
        departmentId: z.string().min(1, "Department is required"),
        locationId: z.string().min(1, "Location is required"),
        legalEntityId: z.string().min(1, "Legal entity is required"),
        reportingToUserId: z.string().min(1, "Reporting to user is required"),
        salesIncentiveTypeId: z.string(),
      }),
    },
  });

  // Reset form when dialog closes
  useEffect(() => {
    if (!open) {
      form.reset();
    }
  }, [open, form]);

  const userOptions = users.map((user) => ({
    value: user.id,
    label: `${user.name} (${user.email})`,
  }));

  const jobTitleOptions = jobTitles.map((item) => ({
    value: item.id,
    label: item.name,
  }));

  const businessUnitOptions = businessUnits.map((item) => ({
    value: item.id,
    label: item.name,
  }));

  const departmentOptions = departments.map((item) => ({
    value: item.id,
    label: item.name,
  }));

  const locationOptions = locations.map((item) => ({
    value: item.id,
    label: item.name,
  }));

  const legalEntityOptions = legalEntities.map((item) => ({
    value: item.id,
    label: item.name,
  }));

  const salesIncentiveTypeOptions = salesIncentiveTypes.map((item) => ({
    value: item.id,
    label: item.name,
  }));

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button>
          <PlusIcon className="mr-2 size-4" />
          Create Employee
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-[1000px] lg:max-w-[1000px]">
        <form.AppForm>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              e.stopPropagation();
              form.handleSubmit();
            }}
          >
            <DialogHeader>
              <DialogTitle>Create New Employee</DialogTitle>
              <DialogDescription>
                Add a new employee to the system. All fields are required except
                Sales Incentive Type.
              </DialogDescription>
            </DialogHeader>
            <div className="grid grid-cols-[repeat(auto-fill,minmax(250px,1fr))] gap-4 space-y-4 py-4">
              <form.AppField name="userId">
                {(field) => (
                  <field.Combobox label="User" options={userOptions} required />
                )}
              </form.AppField>

              <form.AppField name="dateOfJoining">
                {(field) => (
                  <field.DatePicker label="Date of Joining" required />
                )}
              </form.AppField>

              <form.AppField name="jobTitleId">
                {(field) => (
                  <field.Combobox
                    label="Job Title"
                    options={jobTitleOptions}
                    required
                  />
                )}
              </form.AppField>

              <form.AppField name="businessUnitId">
                {(field) => (
                  <field.Combobox
                    label="Business Unit"
                    options={businessUnitOptions}
                    required
                  />
                )}
              </form.AppField>

              <form.AppField name="departmentId">
                {(field) => (
                  <field.Combobox
                    label="Department"
                    options={departmentOptions}
                    required
                  />
                )}
              </form.AppField>

              <form.AppField name="locationId">
                {(field) => (
                  <field.Combobox
                    label="Location"
                    options={locationOptions}
                    required
                  />
                )}
              </form.AppField>

              <form.AppField name="legalEntityId">
                {(field) => (
                  <field.Combobox
                    label="Legal Entity"
                    options={legalEntityOptions}
                    required
                  />
                )}
              </form.AppField>

              <form.AppField name="reportingToUserId">
                {(field) => (
                  <field.Combobox
                    label="Reporting To"
                    options={userOptions}
                    required
                  />
                )}
              </form.AppField>

              <form.AppField name="salesIncentiveTypeId">
                {(field) => (
                  <field.Combobox
                    label="Sales Incentive Type"
                    options={salesIncentiveTypeOptions}
                    placeholder="Select sales incentive type"
                    required
                  />
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
                  isLoading || isSubmitting ? "Creating..." : "Create Employee"
                }
              </form.SubscribeButton>
            </DialogFooter>
          </form>
        </form.AppForm>
      </DialogContent>
    </Dialog>
  );
};

export default CreateEmployeeDialog;
