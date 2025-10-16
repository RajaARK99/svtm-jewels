import { date, pgTable, text, timestamp } from "drizzle-orm/pg-core";
import { user } from "./auth";

export const attendanceCode = pgTable("attendance_code", {
	id: text("id").primaryKey(),
	code: text("code").notNull().unique(),
	description: text("description").notNull(),
	createdAt: timestamp("created_at").defaultNow().notNull(),
	updatedAt: timestamp("updated_at")
		.defaultNow()
		.$onUpdate(() => new Date())
		.notNull(),
});

// Main attendance table
export const attendance = pgTable("attendance", {
	id: text("id").primaryKey(),
	userId: text("user_id")
		.references(() => user.id, { onDelete: "cascade" })
		.notNull(),
	date: date("date").notNull(),
	createdAt: timestamp("created_at").defaultNow().notNull(),
	updatedAt: timestamp("updated_at")
		.defaultNow()
		.$onUpdate(() => new Date())
		.notNull(),
});

// Junction table for attendance codes (one-to-many: one attendance record can have multiple codes)
export const attendanceEntry = pgTable("attendance_entry", {
	id: text("id").primaryKey(),
	attendanceId: text("attendance_id")
		.references(() => attendance.id, { onDelete: "cascade" })
		.notNull(),
	attendanceCodeId: text("attendance_code_id")
		.references(() => attendanceCode.id, { onDelete: "restrict" })
		.notNull(),
	createdAt: timestamp("created_at").defaultNow().notNull(),
});
