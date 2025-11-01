import { relations, sql } from "drizzle-orm";
import { pgTable, text, timestamp } from "drizzle-orm/pg-core";
import { createSchemaFactory, createSelectSchema } from "drizzle-zod";
import z from "zod";
import { user } from "./auth";
import {
  businessUnit,
  department,
  jobTitle,
  legalEntity,
  location,
  salesIncentiveType,
} from "./options";

export const employee = pgTable("employee", {
  id: text("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  dateOfJoining: timestamp("date_of_joining").notNull(),
  jobTitleId: text("job_title_id")
    .notNull()
    .references(() => jobTitle.id),
  businessUnitId: text("business_unit_id")
    .notNull()
    .references(() => businessUnit.id),
  departmentId: text("department_id")
    .notNull()
    .references(() => department.id),
  locationId: text("location_id")
    .notNull()
    .references(() => location.id),
  legalEntityId: text("legal_entity_id")
    .notNull()
    .references(() => legalEntity.id),
  salesIncentiveTypeId: text("sales_incentive_type_id").references(
    () => salesIncentiveType.id,
  ),
  reportingToUserId: text("reporting_to_user_id")
    .notNull()
    .references(() => user.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => /* @__PURE__ */ new Date())
    .notNull(),
});

export const employeeRelations = relations(employee, ({ one }) => ({
  user: one(user, {
    fields: [employee.userId],
    references: [user.id],
    relationName: "employee_user",
  }),
  reportingToUser: one(user, {
    fields: [employee.reportingToUserId],
    references: [user.id],
    relationName: "employee_reporting_to_user",
  }),
  jobTitle: one(jobTitle, {
    fields: [employee.jobTitleId],
    references: [jobTitle.id],
  }),
  businessUnit: one(businessUnit, {
    fields: [employee.businessUnitId],
    references: [businessUnit.id],
  }),
  department: one(department, {
    fields: [employee.departmentId],
    references: [department.id],
  }),
  location: one(location, {
    fields: [employee.locationId],
    references: [location.id],
  }),
  legalEntity: one(legalEntity, {
    fields: [employee.legalEntityId],
    references: [legalEntity.id],
  }),
  salesIncentiveType: one(salesIncentiveType, {
    fields: [employee.salesIncentiveTypeId],
    references: [salesIncentiveType.id],
  }),
}));
const { createInsertSchema, createUpdateSchema } = createSchemaFactory({
  coerce: {
    date: true,
  },
});
export const employeeInsertSchema = createInsertSchema(employee, {
  id: z.string().optional(),
}).omit({ id: true });
export const employeeUpdateSchema = createUpdateSchema(employee, {
  id: z.string(),
});
export const employeeSelectSchema = createSelectSchema(employee);
export type Employee = typeof employee.$inferSelect;
