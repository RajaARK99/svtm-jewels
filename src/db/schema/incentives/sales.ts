import { sql } from "drizzle-orm";
import { integer, pgTable, real, text, timestamp } from "drizzle-orm/pg-core";

export const salesIncentives = pgTable("sales_incentives", {
  id: text("id").primaryKey().default(sql`gen_random_uuid()`),
  date: timestamp("date").notNull(),
  gold4PerGmAmount: real("gold_4_per_gm_amount").notNull(),
  goldCoin1PerGmAmount: real("gold_coin_1_per_gm_amount").notNull(),
  diamond500PerCtAmount: real("diamond_500_per_ct_amount").notNull(),
  silverAntique4PerGmAmount: real("silver_antique_4_per_gm_amount").notNull(),
  silverPerGmAmount: real("silver_per_gm_amount").notNull(),
  totalIncentive: real("total_incentive").notNull(),
  totalIncentive94Percent: real("total_incentive_94_percent").notNull(),
  totalIncentive6Percent: real("total_incentive_6_percent").notNull(),
  totalSalesIncentiveFor94Percent: real(
    "total_sales_incentive_for_94_percent",
  ).notNull(),
  totalSalesIncentiveFor6Percent: real(
    "total_sales_incentive_for_6_percent",
  ).notNull(),
  totalStaff94InPercent: integer("total_staff_94_in_percent").notNull(),
  totalStaff6InPercent: integer("total_staff_6_in_percent").notNull(),
  totalStaffPresentIn94Percent: integer(
    "total_staff_present_in_94_percent",
  ).notNull(),
  totalStaffPresentIn6Percent: integer(
    "total_staff_present_in_6_percent",
  ).notNull(),
  totalStaffAbsentIn94Percent: integer(
    "total_staff_absent_in_94_percent",
  ).notNull(),
  totalStaffAbsentIn6Percent: integer(
    "total_staff_absent_in_6_percent",
  ).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
});
export type SalesIncentive = Omit<
  typeof salesIncentives.$inferSelect,
  "createdAt" | "updatedAt"
>;
