import { revalidateLogic } from "@tanstack/react-form";
import { useQuery } from "@tanstack/react-query";
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
import { api } from "@/lib/orpc/client";
import { Button } from "../ui/button";

type Employee = {
  id: string;
  userId: string;
  dateOfJoining: string | Date;
  jobTitleId: string;
  businessUnitId: string;
  departmentId: string;
  locationId: string;
  legalEntityId: string;
  reportingToUserId: string;
  salesIncentiveTypeId?: string | null;
};

interface UpdateEmployeeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  employee: Employee;
  onSubmit: (data: {
    id: string;
    userId?: string;
    dateOfJoining?: string;
    jobTitleId?: string;
    businessUnitId?: string;
    departmentId?: string;
    locationId?: string;
    legalEntityId?: string;
    reportingToUserId?: string;
    salesIncentiveTypeId?: string;
  }) => void;
  isLoading: boolean;
}

const UpdateEmployeeDialog = ({
  open,
  onOpenChange,
  employee,
  onSubmit,
  isLoading,
}: UpdateEmployeeDialogProps) => {
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

  // Convert dateOfJoining to Date object
  const dateOfJoiningDate =
    employee.dateOfJoining instanceof Date
      ? employee.dateOfJoining
      : new Date(employee.dateOfJoining);

  const form = useAppForm({
    defaultValues: {
      userId: employee.userId,
      dateOfJoining: dateOfJoiningDate,
      jobTitleId: employee.jobTitleId,
      businessUnitId: employee.businessUnitId,
      departmentId: employee.departmentId,
      locationId: employee.locationId,
      legalEntityId: employee.legalEntityId,
      reportingToUserId: employee.reportingToUserId,
      salesIncentiveTypeId: employee.salesIncentiveTypeId || "",
    },
    onSubmit: async ({ value }) => {
      const updateData: {
        id: string;
        userId?: string;
        dateOfJoining?: string;
        jobTitleId?: string;
        businessUnitId?: string;
        departmentId?: string;
        locationId?: string;
        legalEntityId?: string;
        reportingToUserId?: string;
        salesIncentiveTypeId?: string;
      } = { id: employee.id };

      // Only include changed fields
      if (value.userId !== employee.userId) updateData.userId = value.userId;
      if (
        value.dateOfJoining &&
        value.dateOfJoining.getTime() !== dateOfJoiningDate.getTime()
      )
        updateData.dateOfJoining = value.dateOfJoining.toISOString();
      if (value.jobTitleId !== employee.jobTitleId)
        updateData.jobTitleId = value.jobTitleId;
      if (value.businessUnitId !== employee.businessUnitId)
        updateData.businessUnitId = value.businessUnitId;
      if (value.departmentId !== employee.departmentId)
        updateData.departmentId = value.departmentId;
      if (value.locationId !== employee.locationId)
        updateData.locationId = value.locationId;
      if (value.legalEntityId !== employee.legalEntityId)
        updateData.legalEntityId = value.legalEntityId;
      if (value.reportingToUserId !== employee.reportingToUserId)
        updateData.reportingToUserId = value.reportingToUserId;
      if (value.salesIncentiveTypeId !== (employee.salesIncentiveTypeId || ""))
        updateData.salesIncentiveTypeId =
          value.salesIncentiveTypeId || undefined;

      onSubmit(updateData);
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

  // Reset form when dialog closes or employee changes
  useEffect(() => {
    if (!open) {
      form.reset();
    } else {
      const dateOfJoining =
        employee.dateOfJoining instanceof Date
          ? employee.dateOfJoining
          : new Date(employee.dateOfJoining);
      // Update form values when employee prop changes
      form.setFieldValue("userId", employee.userId);
      form.setFieldValue("dateOfJoining", dateOfJoining);
      form.setFieldValue("jobTitleId", employee.jobTitleId);
      form.setFieldValue("businessUnitId", employee.businessUnitId);
      form.setFieldValue("departmentId", employee.departmentId);
      form.setFieldValue("locationId", employee.locationId);
      form.setFieldValue("legalEntityId", employee.legalEntityId);
      form.setFieldValue("reportingToUserId", employee.reportingToUserId);
      form.setFieldValue(
        "salesIncentiveTypeId",
        employee.salesIncentiveTypeId || "",
      );
    }
  }, [open, employee, form]);

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
              <DialogTitle>Edit Employee</DialogTitle>
              <DialogDescription>
                Update employee information. All fields are required.
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
                  isLoading || isSubmitting ? "Updating..." : "Update Employee"
                }
              </form.SubscribeButton>
            </DialogFooter>
          </form>
        </form.AppForm>
      </DialogContent>
    </Dialog>
  );
};

export default UpdateEmployeeDialog;
