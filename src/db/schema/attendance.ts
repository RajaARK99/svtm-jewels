import { relations, sql } from "drizzle-orm";
import { pgTable, text, timestamp, unique } from "drizzle-orm/pg-core";
import { createSchemaFactory, createSelectSchema } from "drizzle-zod";
import z from "zod";
import { employee } from "./employee";
import { attendance } from "./options";

export const employeeAttendance = pgTable(
  "employee_attendance",
  {
    id: text("id").primaryKey().default(sql`gen_random_uuid()`),
    employeeId: text("employee_id")
      .notNull()
      .references(() => employee.id, { onDelete: "cascade" }),
    date: timestamp("date").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),
  },
  (table) => [unique().on(table.employeeId, table.date)],
);

export const employeeAttendanceType = pgTable(
  "employee_attendance_type",
  {
    id: text("id").primaryKey().default(sql`gen_random_uuid()`),
    employeeAttendanceId: text("employee_attendance_id")
      .notNull()
      .references(() => employeeAttendance.id, { onDelete: "cascade" }),
    attendanceId: text("attendance_id")
      .notNull()
      .references(() => attendance.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [unique().on(table.employeeAttendanceId, table.attendanceId)],
);

export const employeeAttendanceRelations = relations(
  employeeAttendance,
  ({ one, many }) => ({
    employee: one(employee, {
      fields: [employeeAttendance.employeeId],
      references: [employee.id],
    }),
    attendanceTypes: many(employeeAttendanceType),
  }),
);

export const employeeAttendanceTypeRelations = relations(
  employeeAttendanceType,
  ({ one }) => ({
    employeeAttendance: one(employeeAttendance, {
      fields: [employeeAttendanceType.employeeAttendanceId],
      references: [employeeAttendance.id],
    }),
    attendance: one(attendance, {
      fields: [employeeAttendanceType.attendanceId],
      references: [attendance.id],
    }),
  }),
);

const { createInsertSchema, createUpdateSchema } = createSchemaFactory({
  coerce: {
    date: true,
  },
});

export const employeeAttendanceInsertSchema = createInsertSchema(
  employeeAttendance,
  {
    id: z.string().optional(),
  },
).omit({ id: true });

export const employeeAttendanceUpdateSchema = createUpdateSchema(
  employeeAttendance,
  {
    id: z.string(),
  },
);

export const employeeAttendanceSelectSchema =
  createSelectSchema(employeeAttendance);

export const employeeAttendanceTypeInsertSchema = createInsertSchema(
  employeeAttendanceType,
  {
    id: z.string().optional(),
  },
).omit({ id: true });

export const employeeAttendanceTypeSelectSchema = createSelectSchema(
  employeeAttendanceType,
);
