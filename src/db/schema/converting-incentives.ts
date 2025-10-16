import {
	date,
	decimal,
	integer,
	pgTable,
	text,
	timestamp,
} from "drizzle-orm/pg-core";
import { user } from "./auth";

// Type enum for converting incentives
export type ConvertingType = "Diamond" | "Boutique" | "AMS" | "IDOLS";

// Converting type master data table
export const convertingType = pgTable("converting_type", {
	id: text("id").primaryKey(),
	name: text("name").notNull().unique(), // Diamond, Boutique, AMS, IDOLS
	description: text("description"),
	createdAt: timestamp("created_at").defaultNow().notNull(),
	updatedAt: timestamp("updated_at")
		.defaultNow()
		.$onUpdate(() => new Date())
		.notNull(),
});

// Main converting incentives table - stores daily records per employee
export const convertingIncentives = pgTable("converting_incentives", {
	id: text("id").primaryKey(),
	employeeId: text("employee_id")
		.references(() => user.id, { onDelete: "cascade" })
		.notNull(),
	date: date("date").notNull(),
	typeId: text("type_id")
		.references(() => convertingType.id, { onDelete: "restrict" })
		.notNull(),
	weight: decimal("weight", { precision: 10, scale: 2 }).notNull().default("0"),
	visit: integer("visit").notNull().default(0),
	amount: decimal("amount", { precision: 12, scale: 2 }).notNull().default("0"),
	createdAt: timestamp("created_at").defaultNow().notNull(),
	updatedAt: timestamp("updated_at")
		.defaultNow()
		.$onUpdate(() => new Date())
		.notNull(),
});
