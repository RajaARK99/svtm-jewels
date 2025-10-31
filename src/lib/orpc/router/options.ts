import { ORPCError } from "@orpc/server";
import z from "zod";
import { db } from "@/db";
import { publicProcedure } from "@/lib/orpc";

const typeSchema = z.enum([
  "jobTitle",
  "businessUnit",
  "department",
  "location",
  "legalEntity",
  "attendance",
  "salesIncentiveType",
  "convertingType",
]);

const getOptions = publicProcedure
  .route({
    path: "/options",
    method: "GET",
    tags: ["Options"],
    summary: "Get all options",
    description: "Get all options",
  })
  .input(
    z.object({
      type: typeSchema.array(),
    }),
  )
  .output(
    z
      .object({
        type: typeSchema,
        data: z
          .array(
            z.object({
              id: z.string(),
              name: z.string(),
              code: z.string().nullish(),
            }),
          )
          .nullish(),
      })
      .array()
      .nullish(),
  )
  .handler(async ({ input }) => {
    try {
      const data = await Promise.all(
        input.type.map(async (type) => {
          switch (type) {
            case "jobTitle": {
              const jobTitles = await db.query.jobTitle.findMany({
                columns: {
                  id: true,
                  name: true,
                },
              });
              return {
                type: "jobTitle" as const,
                data: jobTitles ?? [],
              };
            }
            case "businessUnit": {
              const businessUnits = await db.query.businessUnit.findMany({
                columns: {
                  id: true,
                  name: true,
                },
              });
              return {
                type: "businessUnit" as const,
                data: businessUnits ?? [],
              };
            }
            case "department": {
              const departments = await db.query.department.findMany({
                columns: {
                  id: true,
                  name: true,
                },
              });
              return {
                type: "department" as const,
                data: departments ?? [],
              };
            }
            case "legalEntity": {
              const legalEntities = await db.query.legalEntity.findMany({
                columns: {
                  id: true,
                  name: true,
                },
              });
              return {
                type: "legalEntity" as const,
                data: legalEntities ?? [],
              };
            }
            case "location": {
              const locations = await db.query.location.findMany({
                columns: {
                  id: true,
                  name: true,
                },
              });
              return {
                type: "location" as const,
                data: locations ?? [],
              };
            }
            case "attendance": {
              const attendance = await db.query.attendance.findMany({
                columns: {
                  id: true,
                  name: true,
                  code: true,
                },
              });
              return {
                type: "attendance" as const,
                data: attendance ?? [],
              };
            }
            case "salesIncentiveType": {
              const salesIncentiveTypes =
                await db.query.salesIncentiveType.findMany({
                  columns: {
                    id: true,
                    name: true,
                  },
                });
              return {
                type: "salesIncentiveType" as const,
                data: salesIncentiveTypes ?? [],
              };
            }
            case "convertingType": {
              const convertingTypes = await db.query.convertingType.findMany({
                columns: {
                  id: true,
                  name: true,
                },
              });
              return {
                type: "convertingType" as const,
                data: convertingTypes ?? [],
              };
            }
          }
        }),
      );

      return data;
    } catch (error) {
      if (error instanceof Error) {
        throw new ORPCError("CONFLICT", {
          message: error.message,
          data: {
            success: false,
            message: error.message,
            data: null,
          },
        });
      }
    }
  });

export { getOptions };
