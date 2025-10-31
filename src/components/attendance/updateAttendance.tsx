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
import { Label } from "@/components/ui/label";
import { api } from "@/lib/orpc/client";
import type { Attendance } from "@/lib/orpc/router/attendance";
import { formatDate } from "@/lib/utils";

interface UpdateAttendanceDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  attendance: Attendance;
  onSubmit: (data: { id: string; data: { attendanceIds: string[] } }) => void;
  isLoading: boolean;
}

const UpdateAttendanceDialog = ({
  open,
  onOpenChange,
  attendance,
  onSubmit,
  isLoading,
}: UpdateAttendanceDialogProps) => {
  // Fetch attendance options
  const { data: optionsData } = useQuery(
    api.getOptions.queryOptions({
      input: {
        type: ["attendance"],
      },
    }),
  );

  const attendanceOptions =
    optionsData?.find((opt) => opt.type === "attendance")?.data ?? [];

  const initialAttendanceIds =
    attendance.attendanceTypes?.map((at) => ({
      value: at.attendanceId,
      label: `${at.attendance?.code} - ${at.attendance?.name}`,
    })) ?? [];

  const form = useAppForm({
    defaultValues: {
      attendanceIds: initialAttendanceIds,
    },
    onSubmit: async ({ value }) => {
      onSubmit({
        id: attendance.id,
        data: {
          attendanceIds: value.attendanceIds?.map((at) => at.value) ?? [],
        },
      });
    },
    validationLogic: revalidateLogic({
      mode: "submit",
      modeAfterSubmission: "change",
    }),
    validators: {
      onDynamic: z.object({
        attendanceIds: z
          .array(z.object({ value: z.string(), label: z.string() }))
          .min(1, "At least one attendance type is required"),
      }),
    },
  });

  // Reset form when dialog closes or attendance changes
  useEffect(() => {
    if (!open) {
      form.reset();
    } else {
      const attendanceIds =
        attendance.attendanceTypes?.map((at) => ({
          value: at.attendanceId,
          label: `${at.attendance?.code} - ${at.attendance?.name}`,
        })) ?? [];
      form.setFieldValue("attendanceIds", attendanceIds);
    }
  }, [open, attendance, form]);

  const attendanceOptionList = attendanceOptions.map((item) => ({
    value: item.id,
    label: `${item.code} - ${item.name}`,
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
              <DialogTitle>Edit Attendance</DialogTitle>
              <DialogDescription>
                Update attendance types for this record.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>
                  Employee: {attendance.employee?.user?.name || "N/A"}
                </Label>
                <p className="text-muted-foreground text-sm">
                  {attendance.employee?.user?.email || "N/A"}
                </p>
              </div>
              <div className="space-y-2">
                <Label>
                  Date:{" "}
                  {attendance.date instanceof Date
                    ? formatDate(attendance.date)
                    : formatDate(new Date(attendance.date))}
                </Label>
              </div>
              <form.AppField name="attendanceIds">
                {(field) => {
                  return (
                    <field.Multiselect
                      options={attendanceOptionList}
                      label="Attendance Types"
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
                    : "Update Attendance"
                }
              </form.SubscribeButton>
            </DialogFooter>
          </form>
        </form.AppForm>
      </DialogContent>
    </Dialog>
  );
};

export default UpdateAttendanceDialog;
