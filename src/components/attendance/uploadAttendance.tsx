import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import ExcelJS from "exceljs";
import { Upload, X } from "lucide-react";
import { useRef, useState } from "react";
import { toast } from "sonner";
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
  date: string;
  attendanceCodes: string;
  id: string;
  employeeId: number;
  employeeName: string;
  attendanceIds: string[];
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
  const employeeMap = new Map<
    string,
    { id: string; employeeId: number; name: string }
  >();
  employees.forEach((emp) => {
    // Map by employee number/id
    if (emp.employeeId) {
      employeeMap.set(String(emp.employeeId).toLowerCase().trim(), {
        id: emp.id,
        employeeId: emp.employeeId,
        name: emp.user?.name ?? "",
      });
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
      const workbook = new ExcelJS.Workbook();
      await workbook.xlsx.load(data);

      if (workbook.worksheets.length === 0) {
        toast.error("Excel file has no worksheets");
        setIsProcessing(false);
        return;
      }

      const worksheet = workbook.worksheets[0];

      // Convert worksheet to array of arrays
      const jsonData: (string | number)[][] = [];
      worksheet.eachRow((row) => {
        const rowData: (string | number)[] = [];
        row.eachCell({ includeEmpty: true }, (cell) => {
          const value = cell.value;
          if (value === null || value === undefined) {
            rowData.push("");
          } else if (typeof value === "object" && "text" in value) {
            rowData.push(String(value.text));
          } else if (typeof value === "object" && "result" in value) {
            rowData.push(String(value.result));
          } else {
            rowData.push(String(value));
          }
        });
        jsonData.push(rowData);
      });

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
      const headersLower = headers.map((h) => h.toLowerCase());

      // Find column indices for employee info
      const employeeNumberIndex = headersLower.findIndex(
        (h) => h.includes("employee number") || h.includes("employee id"),
      );

      if (employeeNumberIndex === -1) {
        toast.error("Excel file must have columns: Employee Number");
        setIsProcessing(false);
        return;
      }

      // Find date columns (columns that look like dates)
      const dateColumnIndices: { index: number; dateStr: string }[] = [];
      for (let colIdx = 0; colIdx < headers.length; colIdx++) {
        const header = headers[colIdx];
        if (!header) continue;

        // Try to parse date from header (format: DD-MMM-YYYY or similar)
        let dateStr = "";

        // Try parsing as date string (e.g., "01-Sep-2025")
        const dateMatch = header.match(/(\d{1,2})[-/](\w{3})[-/](\d{4})/i);
        if (dateMatch) {
          const [, day, month, year] = dateMatch;
          const monthMap: Record<string, string> = {
            jan: "01",
            feb: "02",
            mar: "03",
            apr: "04",
            may: "05",
            jun: "06",
            jul: "07",
            aug: "08",
            sep: "09",
            oct: "10",
            nov: "11",
            dec: "12",
          };
          const monthNum = monthMap[month.toLowerCase()];
          if (monthNum) {
            dateStr = `${year}-${monthNum}-${String(day).padStart(2, "0")}`;
          }
        } else {
          // Try parsing as Date object
          const date = new Date(header);
          if (!Number.isNaN(date.getTime())) {
            dateStr = date.toISOString().split("T")[0];
          }
        }

        if (dateStr) {
          dateColumnIndices.push({ index: colIdx, dateStr });
        }
      }

      if (dateColumnIndices.length === 0) {
        toast.error("No date columns found in Excel file");
        setIsProcessing(false);
        return;
      }

      // Parse data rows
      const parsed: ParsedRow[] = [];
      for (let i = 1; i < jsonData.length; i++) {
        const row = jsonData[i];
        const employeeNumber = String(row[employeeNumberIndex] || "").trim();
        // const employeeName = String(row[employeeNameIndex] || "").trim();

        if (!employeeNumber) {
          continue; // Skip empty rows
        }

        // Process each date column for this employee
        for (const { index: dateColIdx, dateStr } of dateColumnIndices) {
          const attendanceCodeStr = String(row[dateColIdx] || "").trim();

          if (!attendanceCodeStr) {
            continue; // Skip empty cells
          }

          // Parse attendance codes (handle multiple codes separated by comma, space, etc.)
          const codes = attendanceCodeStr
            .split(/[,;:\s]+/)
            .map((c) => c.trim().toUpperCase())
            .filter((c) => c.length > 0);

          if (codes.length === 0) {
            continue; // Skip if no valid codes
          }

          const errors: string[] = [];

          // Map employee to ID (prefer number, fallback to name)
          let employeeDetail:
            | { id: string; employeeId: number; name: string }
            | undefined;
          if (employeeNumber) {
            employeeDetail = employeeMap.get(
              employeeNumber.toLowerCase().trim(),
            );
          }

          if (!employeeDetail) {
            errors.push(`Encountered unknown employee: ${employeeNumber}`);
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
            id: employeeDetail?.id ?? "",
            date: dateStr,
            attendanceCodes: attendanceCodeStr,
            employeeId: employeeDetail?.employeeId ?? 0,
            employeeName: employeeDetail?.name ?? "",
            attendanceIds,
            errors: errors.length > 0 ? errors : undefined,
          });
        }
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
            employeeId: row.id,
            attendanceIds: row.attendanceIds,
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
            Upload an Excel file with Employee Number, Employee Name columns and
            date columns (e.g., 01-Sep-2025) containing attendance codes. Each
            row represents an employee, and each date column contains their
            attendance code for that date.
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
                      <TableHead>S No.</TableHead>
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
                          <TableCell>{index + 1}</TableCell>
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
