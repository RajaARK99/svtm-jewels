import { date, pgTable, text, timestamp } from "drizzle-orm/pg-core";
import { user } from "./auth";

// Option tables
export const jobTitle = pgTable("job_title", {
	id: text("id").primaryKey(),
	name: text("name").notNull().unique(),
	createdAt: timestamp("created_at").defaultNow().notNull(),
	updatedAt: timestamp("updated_at")
		.defaultNow()
		.$onUpdate(() => new Date())
		.notNull(),
});

export const businessUnit = pgTable("business_unit", {
	id: text("id").primaryKey(),
	name: text("name").notNull().unique(),
	createdAt: timestamp("created_at").defaultNow().notNull(),
	updatedAt: timestamp("updated_at")
		.defaultNow()
		.$onUpdate(() => new Date())
		.notNull(),
});

export const department = pgTable("department", {
	id: text("id").primaryKey(),
	name: text("name").notNull().unique(),
	createdAt: timestamp("created_at").defaultNow().notNull(),
	updatedAt: timestamp("updated_at")
		.defaultNow()
		.$onUpdate(() => new Date())
		.notNull(),
});

export const location = pgTable("location", {
	id: text("id").primaryKey(),
	name: text("name").notNull().unique(),
	createdAt: timestamp("created_at").defaultNow().notNull(),
	updatedAt: timestamp("updated_at")
		.defaultNow()
		.$onUpdate(() => new Date())
		.notNull(),
});

export const legalEntity = pgTable("legal_entity", {
	id: text("id").primaryKey(),
	name: text("name").notNull().unique(),
	createdAt: timestamp("created_at").defaultNow().notNull(),
	updatedAt: timestamp("updated_at")
		.defaultNow()
		.$onUpdate(() => new Date())
		.notNull(),
});

// Employee table
export const employee = pgTable("employee", {
	id: text("id").primaryKey(),
	userId: text("user_id")
		.references(() => user.id, { onDelete: "restrict" })
		.notNull()
		.unique(),
	dateOfJoining: date("date_of_joining").notNull(),
	jobTitleId: text("job_title_id")
		.references(() => jobTitle.id, { onDelete: "restrict" })
		.notNull(),
	businessUnitId: text("business_unit_id")
		.references(() => businessUnit.id, { onDelete: "restrict" })
		.notNull(),
	departmentId: text("department_id")
		.references(() => department.id, { onDelete: "restrict" })
		.notNull(),
	locationId: text("location_id")
		.references(() => location.id, { onDelete: "restrict" })
		.notNull(),
	legalEntityId: text("legal_entity_id")
		.references(() => legalEntity.id, { onDelete: "restrict" })
		.notNull(),
	reportingToUserId: text("reporting_to_user_id").references(() => user.id, {
		onDelete: "set null",
	}),
	createdAt: timestamp("created_at").defaultNow().notNull(),
	updatedAt: timestamp("updated_at")
		.defaultNow()
		.$onUpdate(() => new Date())
		.notNull(),
});
