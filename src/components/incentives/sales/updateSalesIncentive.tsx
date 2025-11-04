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
import type { SalesIncentive } from "@/db/schema";
import { formatDate } from "@/lib/utils";

interface UpdateSalesIncentiveDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  incentive: SalesIncentive;
  onSubmit: (data: {
    id: string;
    data: {
      coinAmountPerGM?: number;
      goldAmountPerGM?: number;
      diamondAmountPerCT?: number;
      silverAntiqueAmountPerGM?: number;
      silverAmountPerGM?: number;
    };
  }) => void;
  isLoading: boolean;
}

const UpdateSalesIncentiveDialog = ({
  open,
  onOpenChange,
  incentive,
  onSubmit,
  isLoading,
}: UpdateSalesIncentiveDialogProps) => {
  // Calculate original per-unit amounts from stored values
  const originalCoinAmountPerGM = incentive.goldCoin1PerGmAmount / 1;
  const originalGoldAmountPerGM = incentive.gold4PerGmAmount / 4;
  const originalDiamondAmountPerCT = incentive.diamond500PerCtAmount / 500;
  const originalSilverAntiqueAmountPerGM =
    incentive.silverAntique4PerGmAmount / 4;
  const originalSilverAmountPerGM = incentive.silverPerGmAmount / 0.3;

  const form = useAppForm({
    defaultValues: {
      coinAmountPerGM: originalCoinAmountPerGM,
      goldAmountPerGM: originalGoldAmountPerGM,
      diamondAmountPerCT: originalDiamondAmountPerCT,
      silverAntiqueAmountPerGM: originalSilverAntiqueAmountPerGM,
      silverAmountPerGM: originalSilverAmountPerGM,
    },
    onSubmit: async ({ value }) => {
      const updateData: {
        coinAmountPerGM?: number;
        goldAmountPerGM?: number;
        diamondAmountPerCT?: number;
        silverAntiqueAmountPerGM?: number;
        silverAmountPerGM?: number;
      } = {};

      if (value.coinAmountPerGM !== originalCoinAmountPerGM) {
        updateData.coinAmountPerGM = value.coinAmountPerGM;
      }
      if (value.goldAmountPerGM !== originalGoldAmountPerGM) {
        updateData.goldAmountPerGM = value.goldAmountPerGM;
      }
      if (value.diamondAmountPerCT !== originalDiamondAmountPerCT) {
        updateData.diamondAmountPerCT = value.diamondAmountPerCT;
      }
      if (value.silverAntiqueAmountPerGM !== originalSilverAntiqueAmountPerGM) {
        updateData.silverAntiqueAmountPerGM = value.silverAntiqueAmountPerGM;
      }
      if (value.silverAmountPerGM !== originalSilverAmountPerGM) {
        updateData.silverAmountPerGM = value.silverAmountPerGM;
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

  // Reset form when dialog closes or incentive changes
  useEffect(() => {
    if (!open) {
      form.reset();
    } else {
      form.setFieldValue("coinAmountPerGM", originalCoinAmountPerGM);
      form.setFieldValue("goldAmountPerGM", originalGoldAmountPerGM);
      form.setFieldValue("diamondAmountPerCT", originalDiamondAmountPerCT);
      form.setFieldValue(
        "silverAntiqueAmountPerGM",
        originalSilverAntiqueAmountPerGM,
      );
      form.setFieldValue("silverAmountPerGM", originalSilverAmountPerGM);
    }
  }, [
    open,
    incentive,
    form,
    originalCoinAmountPerGM,
    originalGoldAmountPerGM,
    originalDiamondAmountPerCT,
    originalSilverAntiqueAmountPerGM,
    originalSilverAmountPerGM,
  ]);

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
              <DialogTitle>Edit Sales Incentive</DialogTitle>
              <DialogDescription>
                Update sales incentive amounts. Date cannot be changed.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <p className="font-medium text-sm">Date</p>
                <p className="text-muted-foreground text-sm">
                  {incentive.date instanceof Date
                    ? formatDate(incentive.date)
                    : formatDate(new Date(incentive.date))}
                </p>
              </div>
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
                    ? "Updating..."
                    : "Update Sales Incentive"
                }
              </form.SubscribeButton>
            </DialogFooter>
          </form>
        </form.AppForm>
      </DialogContent>
    </Dialog>
  );
};

export default UpdateSalesIncentiveDialog;
