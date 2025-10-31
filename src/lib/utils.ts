import { type ClassValue, clsx } from "clsx";
import dayjs, { type Dayjs } from "dayjs";
import { twMerge } from "tailwind-merge";
import { ORPCError } from "@orpc/server";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
const dateFormat = "DD MMM YYYY";
const dateTimeFormat = "DD MMM YYYY hh:mm a";
export function formatDate(
  date: Date | string | Dayjs,
  format: typeof dateFormat | typeof dateTimeFormat = dateFormat,
) {
  return dayjs(date).format(format);
}


const throwError = (error: unknown) => {
 if (error instanceof Error) {
    throw new ORPCError("BAD_REQUEST", {
      message: error.message,
    });
  }
   if (typeof error === "object" && error !== null && "message" in error) {
    throw new ORPCError("BAD_REQUEST", {
      status: 400,
      message: error.message as string,
    });
  }
  
  throw new ORPCError("INTERNAL_SERVER_ERROR", {
    status: 500,
    message: "Internal server error",
  });
};

export { throwError };

