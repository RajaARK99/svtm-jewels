import { revalidateLogic } from "@tanstack/react-form";
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

interface CreateSalesIncentiveDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: {
    date: string;
    coinAmountPerGM: number;
    goldAmountPerGM: number;
    diamondAmountPerCT: number;
    silverAntiqueAmountPerGM: number;
    silverAmountPerGM: number;
  }) => void;
  isLoading: boolean;
}

const CreateSalesIncentiveDialog = ({
  open,
  onOpenChange,
  onSubmit,
  isLoading,
}: CreateSalesIncentiveDialogProps) => {
  const form = useAppForm({
    defaultValues: {
      date: null as Date | null,
      coinAmountPerGM: 0,
      goldAmountPerGM: 0,
      diamondAmountPerCT: 0,
      silverAntiqueAmountPerGM: 0,
      silverAmountPerGM: 0,
    },
    onSubmit: async ({ value }) => {
      if (!value.date) {
        return;
      }
      onSubmit({
        date: value.date.toISOString(),
        coinAmountPerGM: value.coinAmountPerGM,
        goldAmountPerGM: value.goldAmountPerGM,
        diamondAmountPerCT: value.diamondAmountPerCT,
        silverAntiqueAmountPerGM: value.silverAntiqueAmountPerGM,
        silverAmountPerGM: value.silverAmountPerGM,
      });
    },
    validationLogic: revalidateLogic({
      mode: "submit",
      modeAfterSubmission: "change",
    }),
    validators: {
      onDynamic: z.object({
        date: z.date("Date is required"),
        coinAmountPerGM: z.number().min(0, "Coin amount per GM must be >= 0"),
        goldAmountPerGM: z.number().min(0, "Gold amount per GM must be >= 0"),
        diamondAmountPerCT: z
          .number()
          .min(0, "Diamond amount per CT must be >= 0"),
        silverAntiqueAmountPerGM: z
          .number()
          .min(0, "Silver antique amount per GM must be >= 0"),
        silverAmountPerGM: z
          .number()
          .min(0, "Silver amount per GM must be >= 0"),
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
              <DialogTitle>Create Sales Incentive</DialogTitle>
              <DialogDescription>
                Add a new sales incentive record for a specific date.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <form.AppField name="date">
                {(field) => {
                  return <field.DatePicker label="Date" required />;
                }}
              </form.AppField>
              <form.AppField name="coinAmountPerGM">
                {(field) => {
                  return (
                    <field.NumberInput
                      label="Coin Amount per GM"
                      placeholder="Enter coin amount per GM"
                      required
                      step={0.01}
                    />
                  );
                }}
              </form.AppField>
              <form.AppField name="goldAmountPerGM">
                {(field) => {
                  return (
                    <field.NumberInput
                      label="Gold Amount per GM"
                      placeholder="Enter gold amount per GM"
                      required
                      step={0.01}
                    />
                  );
                }}
              </form.AppField>
              <form.AppField name="diamondAmountPerCT">
                {(field) => {
                  return (
                    <field.NumberInput
                      label="Diamond Amount per CT"
                      placeholder="Enter diamond amount per CT"
                      required
                      step={0.01}
                    />
                  );
                }}
              </form.AppField>
              <form.AppField name="silverAntiqueAmountPerGM">
                {(field) => {
                  return (
                    <field.NumberInput
                      label="Silver Antique Amount per GM"
                      placeholder="Enter silver antique amount per GM"
                      required
                      step={0.01}
                    />
                  );
                }}
              </form.AppField>
              <form.AppField name="silverAmountPerGM">
                {(field) => {
                  return (
                    <field.NumberInput
                      label="Silver Amount per GM"
                      placeholder="Enter silver amount per GM"
                      required
                      step={0.01}
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
                    : "Create Sales Incentive"
                }
              </form.SubscribeButton>
            </DialogFooter>
          </form>
        </form.AppForm>
      </DialogContent>
    </Dialog>
  );
};

export default CreateSalesIncentiveDialog;
