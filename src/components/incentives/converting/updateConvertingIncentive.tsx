import { revalidateLogic, useStore } from "@tanstack/react-form";
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
import type { ConvertingIncentive } from "@/lib/orpc/router/incentives/converting";
import { formatDate } from "@/lib/utils";

interface UpdateConvertingIncentiveDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  incentive: ConvertingIncentive;
  onSubmit: (data: {
    id: string;
    data: {
      typeId?: string;
      weight?: number;
      visit?: number;
      amount?: number;
    };
  }) => void;
  isLoading: boolean;
}

const UpdateConvertingIncentiveDialog = ({
  open,
  onOpenChange,
  incentive,
  onSubmit,
  isLoading,
}: UpdateConvertingIncentiveDialogProps) => {
  // Fetch options data
  const { data: optionsData } = useQuery(
    api.getOptions.queryOptions({
      input: {
        type: ["convertingType"],
      },
    }),
  );

  const convertingTypes =
    optionsData?.find((opt) => opt.type === "convertingType")?.data ?? [];

  // Find the current type ID from the type name
  const currentType = convertingTypes.find((t) => t.id === incentive.type.id);

  const form = useAppForm({
    defaultValues: {
      typeId: currentType?.id || "",
      weight: incentive.weight,
      visit: incentive.visit,
      amount: incentive.amount,
    },
    onSubmit: async ({ value }) => {
      const updateData: {
        typeId?: string;
        weight?: number;
        visit?: number;
        amount?: number;
      } = {};

      if (value.typeId !== currentType?.id) {
        updateData.typeId = value.typeId;
      }
      if (value.weight !== incentive.weight) {
        updateData.weight = value.weight;
      }
      if (value.visit !== incentive.visit) {
        updateData.visit = value.visit;
      }
      if (value.amount !== incentive.amount) {
        updateData.amount = value.amount;
      }

      onSubmit({
        id: incentive.id,
        data: updateData,
      });
    },
    validationLogic: revalidateLogic({
      mode: "submit",
      modeAfterSubmission: "change",
    }),
    validators: {
      onDynamic: z.object({
        typeId: z.string().min(1, "Type is required"),
        weight: z.number().min(1, "Weight is required"),
        visit: z.number().min(1, "Visit is required"),
        amount: z.number().min(1, "Amount is required"),
      }),
    },
  });

  // Reset form when dialog closes or incentive changes
  useEffect(() => {
    if (!open) {
      form.reset();
    } else {
      const currentType = convertingTypes.find(
        (t) => t.id === incentive.type.id,
      );
      form.setFieldValue("typeId", currentType?.id || "");
      form.setFieldValue("weight", incentive.weight);
      form.setFieldValue("visit", incentive.visit);
      form.setFieldValue("amount", incentive.amount);
    }
  }, [open, incentive, convertingTypes, form]);

  const convertingTypeOptions = convertingTypes.map((type) => ({
    value: type.id,
    label: type.name,
  }));

  // Calculate amount based on type and weight
  const calculateAmount = (typeId: string, weight: number): number => {
    if (!typeId || !weight || weight <= 0) {
      return 0;
    }

    const selectedType = convertingTypes.find((type) => type.id === typeId);
    if (!selectedType) {
      return 0;
    }

    const typeName = selectedType.name.toUpperCase();

    // Rate mapping based on type name
    let rate = 0;
    if (typeName === "BOUTIQUE") {
      rate = 10; // Rs.10/-Per Gram
    } else if (typeName === "AMS") {
      rate = 10; // Rs.10/-Per Gram
    } else if (typeName === "DIAMOND") {
      rate = 500; // Rs.500/- per Ct
    } else if (typeName === "IDOLS") {
      rate = 2; // Rs 2/- Per Gram
    }

    return weight * rate;
  };

  const selectedTypeId = useStore(form.store, (state) => state.values.typeId);

  const selectedType = convertingTypes.find(
    (type) => type.id === selectedTypeId,
  );

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
              <DialogTitle>Edit Converting Incentive</DialogTitle>
              <DialogDescription>
                Update converting incentive fields.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <p className="font-medium text-sm">Employee</p>
                <p className="text-muted-foreground text-sm">
                  {incentive.name} ({incentive.email})
                </p>
              </div>
              <div className="space-y-2">
                <p className="font-medium text-sm">Date</p>
                <p className="text-muted-foreground text-sm">
                  {incentive.date instanceof Date
                    ? formatDate(incentive.date)
                    : formatDate(new Date(incentive.date))}
                </p>
              </div>
              <form.AppField
                name="typeId"
                listeners={{
                  onChange: ({ value, fieldApi }) => {
                    const weight = fieldApi.form.getFieldValue("weight") ?? 0;
                    const calculatedAmount = calculateAmount(value, weight);
                    fieldApi.form.setFieldValue("amount", calculatedAmount);
                  },
                }}
              >
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
              <form.AppField
                name="weight"
                listeners={{
                  onChange: ({ value, fieldApi }) => {
                    const typeId = fieldApi.form.getFieldValue("typeId") ?? "";
                    const calculatedAmount = calculateAmount(typeId, value);
                    fieldApi.form.setFieldValue("amount", calculatedAmount);
                  },
                }}
              >
                {(field) => {
                  return (
                    <field.NumberInput
                      label={`Weight ${selectedType?.name ? (selectedType?.name?.toUpperCase() === "DIAMOND" ? "Per CT" : "Per Gram") : ""}`}
                      placeholder={`Enter weight in ${selectedType?.name ? (selectedType?.name?.toUpperCase() === "DIAMOND" ? "CT" : "Grams") : ""}`}
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
                    ? "Updating..."
                    : "Update Converting Incentive"
                }
              </form.SubscribeButton>
            </DialogFooter>
          </form>
        </form.AppForm>
      </DialogContent>
    </Dialog>
  );
};

export default UpdateConvertingIncentiveDialog;
