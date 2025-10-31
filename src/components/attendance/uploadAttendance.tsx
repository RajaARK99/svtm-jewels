import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Upload, X } from "lucide-react";
import { useRef, useState } from "react";
import { toast } from "sonner";
import * as XLSX from "xlsx";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { api } from "@/lib/orpc/client";
import { formatDate } from "@/lib/utils";

interface ParsedRow {
  employeeName: string;
  date: string;
  attendanceCodes: string;
  employeeId?: string;
  attendanceIds?: string[];
  errors?: string[];
}

interface UploadAttendanceDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const UploadAttendanceDialog = ({
  open,
  onOpenChange,
}: UploadAttendanceDialogProps) => {
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [parsedData, setParsedData] = useState<ParsedRow[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);

  // Fetch employees for mapping
  const { data: employeesData } = useQuery(
    api.employeeRouter.getEmployee.queryOptions({
      input: {
        pagination: { page: 1, limit: 10000 },
      },
    }),
  );

  // Fetch attendance options for mapping
  const { data: optionsData } = useQuery(
    api.getOptions.queryOptions({
      input: {
        type: ["attendance"],
      },
    }),
  );

  // Create attendance mutation
  const createMutation = useMutation(
    api.attendanceRouter.createAttendance.mutationOptions({
      onSuccess: () => {
        toast.success("Attendance records created successfully");
        queryClient.invalidateQueries({
          queryKey: api.attendanceRouter.getAttendance.queryKey({ input: {} }),
        });
      },
      onError: (error) => {
        toast.error(error.message ?? "Failed to create attendance records");
      },
    }),
  );

  const employees = employeesData?.data ?? [];
  const attendanceOptions =
    optionsData?.find((opt) => opt.type === "attendance")?.data ?? [];

  // Create mapping dictionaries
  const employeeMap = new Map<string, string>();
  employees.forEach((emp) => {
    if (emp.user?.name) {
      employeeMap.set(emp.user.name.toLowerCase().trim(), emp.id);
    }
  });

  const attendanceMap = new Map<string, string>();
  attendanceOptions.forEach((att) => {
    if (att.code) {
      attendanceMap.set(att.code.toUpperCase().trim(), att.id);
    }
  });

  const handleFileUpload = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsProcessing(true);
    try {
      const data = await file.arrayBuffer();
      const workbook = XLSX.read(data, { type: "array" });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const jsonData = XLSX.utils.sheet_to_json(worksheet, {
        header: 1,
        defval: "",
      }) as (string | number)[][];
      console.log({ jsonData });

      if (jsonData.length < 2) {
        toast.error(
          "Excel file must have at least a header row and one data row",
        );
        setIsProcessing(false);
        return;
      }

      // Find header row (first row)
      const headers = jsonData[0].map((h) =>
        String(h).toLowerCase().trim(),
      ) as string[];

      // Find column indices
      const employeeNameIndex = headers.findIndex(
        (h) => h.includes("employee") || h.includes("name"),
      );
      const dateIndex = headers.findIndex((h) => h.includes("date"));
      const attendanceCodesIndex = headers.findIndex(
        (h) =>
          h.includes("attendance") || h.includes("code") || h.includes("type"),
      );

      if (
        employeeNameIndex === -1 ||
        dateIndex === -1 ||
        attendanceCodesIndex === -1
      ) {
        toast.error(
          "Excel file must have columns: Employee Name, Date, and Attendance Codes",
        );
        setIsProcessing(false);
        return;
      }

      // Parse data rows
      const parsed: ParsedRow[] = [];
      for (let i = 1; i < jsonData.length; i++) {
        const row = jsonData[i];
        const employeeName = String(row[employeeNameIndex] || "").trim();
        const dateValue = row[dateIndex];
        const attendanceCodesStr = String(
          row[attendanceCodesIndex] || "",
        ).trim();

        if (!employeeName || !dateValue || !attendanceCodesStr) {
          continue; // Skip empty rows
        }

        // Parse date
        let dateStr = "";
        // Try to parse date string or number
        const date = new Date(dateValue);
        if (!Number.isNaN(date.getTime())) {
          dateStr = date.toISOString().split("T")[0];
        } else {
          // Try Excel date number
          const excelDate = XLSX.SSF.parse_date_code(Number(dateValue));
          if (excelDate) {
            dateStr = `${excelDate.y}-${String(excelDate.m).padStart(2, "0")}-${String(excelDate.d).padStart(2, "0")}`;
          }
        }

        // Parse attendance codes (comma, space, or semicolon separated)
        const codes = attendanceCodesStr
          .split(/[,;:\s]+/)
          .map((c) => c.trim().toUpperCase())
          .filter((c) => c.length > 0);

        const errors: string[] = [];

        // Map employee name to ID
        const employeeId = employeeMap.get(employeeName.toLowerCase());
        if (!employeeId) {
          errors.push(`Encountered unknown employee: ${employeeName}`);
        }

        // Map attendance codes to IDs
        const attendanceIds: string[] = [];
        for (const code of codes) {
          const attId = attendanceMap.get(code);
          if (attId) {
            attendanceIds.push(attId);
          } else {
            errors.push(`Encountered unknown attendance code: ${code}`);
          }
        }

        if (attendanceIds.length === 0) {
          errors.push("No valid attendance codes found");
        }

        parsed.push({
          employeeName,
          date: dateStr,
          attendanceCodes: attendanceCodesStr,
          employeeId,
          attendanceIds: attendanceIds.length > 0 ? attendanceIds : undefined,
          errors: errors.length > 0 ? errors : undefined,
        });
      }

      setParsedData(parsed);
      if (parsed.length === 0) {
        toast.error("No valid data found in Excel file");
      } else {
        toast.success(`Parsed ${parsed.length} rows from Excel file`);
      }
    } catch (error) {
      console.error("Error parsing Excel file:", error);
      toast.error("Failed to parse Excel file");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCreate = async () => {
    if (parsedData.length === 0) {
      toast.error("No data to create");
      return;
    }

    // Group by date
    const groupedByDate = new Map<string, ParsedRow[]>();
    for (const row of parsedData) {
      if (
        !row.employeeId ||
        !row.attendanceIds ||
        row.attendanceIds.length === 0
      ) {
        continue; // Skip rows with errors
      }
      if (!groupedByDate.has(row.date)) {
        groupedByDate.set(row.date, []);
      }
      const dateRows = groupedByDate.get(row.date);
      if (dateRows) {
        dateRows.push(row);
      }
    }

    if (groupedByDate.size === 0) {
      toast.error("No valid data to create. Please fix errors first.");
      return;
    }

    // Create attendance for each date
    setIsProcessing(true);
    try {
      for (const [dateStr, rows] of groupedByDate) {
        const date = new Date(dateStr);
        date.setHours(12, 0, 0, 0); // Set to noon to avoid timezone issues
        const isoDate = date.toISOString();

        const data = rows
          .filter((row) => row.employeeId && row.attendanceIds)
          .map((row) => ({
            employeeId: row.employeeId as string,
            attendanceIds: row.attendanceIds as string[],
          }));

        await createMutation.mutateAsync({
          date: isoDate,
          data,
        });
      }

      toast.success(
        `Successfully created attendance records for ${groupedByDate.size} date(s)`,
      );
      setParsedData([]);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
      onOpenChange(false);
    } catch (error) {
      console.error("Error creating attendance:", error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleClose = () => {
    setParsedData([]);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    onOpenChange(false);
  };

  const validRows = parsedData.filter(
    (row) =>
      row.employeeId && row.attendanceIds && row.attendanceIds.length > 0,
  );
  const invalidRows = parsedData.filter(
    (row) =>
      !row.employeeId || !row.attendanceIds || row.attendanceIds.length === 0,
  );

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-[1000px]">
        <DialogHeader>
          <DialogTitle>Upload Attendance from Excel</DialogTitle>
          <DialogDescription>
            Upload an Excel file with columns: Employee Name, Date, and
            Attendance Codes (comma-separated). See the guide for format
            details.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="flex items-center gap-4">
            <input
              ref={fileInputRef}
              type="file"
              accept=".xlsx,.xls,.csv"
              onChange={handleFileUpload}
              className="hidden"
              id="attendance-file-upload"
            />
            <Button
              type="button"
              variant="outline"
              onClick={() => fileInputRef.current?.click()}
              disabled={isProcessing}
            >
              <Upload className="mr-2 size-4" />
              {isProcessing ? "Processing..." : "Choose Excel File"}
            </Button>
            {parsedData.length > 0 && (
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => {
                  setParsedData([]);
                  if (fileInputRef.current) {
                    fileInputRef.current.value = "";
                  }
                }}
              >
                <X className="size-4" />
              </Button>
            )}
          </div>

          {parsedData.length > 0 && (
            <div className="space-y-4">
              <div className="flex gap-4 text-sm">
                <span className="text-green-600">
                  Valid: {validRows.length} rows
                </span>
                <span className="text-red-600">
                  Invalid: {invalidRows.length} rows
                </span>
              </div>

              <div className="max-h-[400px] overflow-y-auto rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Employee Name</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Attendance Codes</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {parsedData.map((row, index) => {
                      const isValid =
                        row.employeeId &&
                        row.attendanceIds &&
                        row.attendanceIds.length > 0;
                      const rowKey = `${row.employeeName}-${row.date}-${index}`;
                      return (
                        <TableRow key={rowKey}>
                          <TableCell>{row.employeeName}</TableCell>
                          <TableCell>
                            {row.date
                              ? formatDate(new Date(row.date))
                              : "Invalid Date"}
                          </TableCell>
                          <TableCell>{row.attendanceCodes}</TableCell>
                          <TableCell>
                            {isValid ? (
                              <span className="text-green-600">Valid</span>
                            ) : (
                              <div className="space-y-1">
                                {row.errors?.map((error, i) => {
                                  const errorKey = `${rowKey}-error-${i}`;
                                  return (
                                    <div
                                      key={errorKey}
                                      className="text-red-600 text-xs"
                                    >
                                      {error}
                                    </div>
                                  );
                                })}
                              </div>
                            )}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleCreate}
            disabled={
              parsedData.length === 0 ||
              validRows.length === 0 ||
              isProcessing ||
              createMutation.isPending
            }
          >
            {createMutation.isPending || isProcessing
              ? "Creating..."
              : `Create ${validRows.length} Record(s)`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default UploadAttendanceDialog;
