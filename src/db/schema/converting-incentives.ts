import { decimal, integer, pgTable, text, timestamp, date } from "drizzle-orm/pg-core";
import { user } from "./auth";

// Converts metric types for daily tracking
export const convertingMetricType = pgTable("converting_metric_type", {
	id: text("id").primaryKey(),
	name: text("name").notNull().unique(),
	description: text("description"),
	category: text("category").notNull(), // e.g., "weight", "incentive"
	unit: text("unit"), // e.g., "gm", "amount"
	createdAt: timestamp("created_at").defaultNow().notNull(),
	updatedAt: timestamp("updated_at")
		.defaultNow()
		.$onUpdate(() => new Date())
		.notNull(),
});

// Main converting incentives table - stores daily records per employee
export const convertingIncentives = pgTable("converting_incentives", {
	id: text("id").primaryKey(),
	userId: text("user_id")
		.references(() => user.id, { onDelete: "cascade" })
		.notNull(),
	date: date("date").notNull(),
	
	// Weight metrics
	goldWeight: decimal("gold_weight", { precision: 10, scale: 2 }).default("0"),
	coinWeight: decimal("coin_weight", { precision: 10, scale: 2 }).default("0"),
	diamondWeight: decimal("diamond_weight", { precision: 10, scale: 2 }).default("0"),
	silverAntiqueWeight: decimal("silver_antique_weight", { precision: 10, scale: 2 }).default("0"),
	silverWeight: decimal("silver_weight", { precision: 10, scale: 2 }).default("0"),
	
	// Sales incentive amounts
	salesIncentiveGold: decimal("sales_incentive_gold", { precision: 12, scale: 2 }).default("0"),
	salesIncentiveGoldCoin: decimal("sales_incentive_gold_coin", { precision: 12, scale: 2 }).default("0"),
	salesIncentiveDiamond: decimal("sales_incentive_diamond", { precision: 12, scale: 2 }).default("0"),
	salesIncentiveSilverAntique: decimal("sales_incentive_silver_antique", { precision: 12, scale: 2 }).default("0"),
	salesIncentiveSilver: decimal("sales_incentive_silver", { precision: 12, scale: 2 }).default("0"),
	
	// Total incentive for the day
	totalIncentive: decimal("total_incentive", { precision: 12, scale: 2 }).default("0"),
	
	// Staff attendance metrics
	staff94Percent: integer("staff_94_percent").default(0),
	staff6Percent: integer("staff_6_percent").default(0),
	absentStaff94: integer("absent_staff_94").default(0),
	absentStaff6: integer("absent_staff_6").default(0),
	
	// Incentive per staff member
	incentivePerStaff94: decimal("incentive_per_staff_94", { precision: 10, scale: 2 }).default("0"),
	incentivePerStaff6: decimal("incentive_per_staff_6", { precision: 10, scale: 2 }).default("0"),
	
	createdAt: timestamp("created_at").defaultNow().notNull(),
	updatedAt: timestamp("updated_at")
		.defaultNow()
		.$onUpdate(() => new Date())
		.notNull(),
});

// Daily metrics detail table - stores individual metric values
export const convertingMetricsDetail = pgTable("converting_metrics_detail", {
	id: text("id").primaryKey(),
	convertingIncentivesId: text("converting_incentives_id")
		.references(() => convertingIncentives.id, { onDelete: "cascade" })
		.notNull(),
	metricTypeId: text("metric_type_id")
		.references(() => convertingMetricType.id, { onDelete: "restrict" })
		.notNull(),
	value: decimal("value", { precision: 12, scale: 4 }).notNull(),
	createdAt: timestamp("created_at").defaultNow().notNull(),
});
