ALTER TABLE "sales_incentives" ADD COLUMN "total_staff_94_in_percent" integer NOT NULL;--> statement-breakpoint
ALTER TABLE "sales_incentives" ADD COLUMN "total_staff_6_in_percent" integer NOT NULL;--> statement-breakpoint
ALTER TABLE "sales_incentives" ADD COLUMN "total_staff_present_in_94_percent" integer NOT NULL;--> statement-breakpoint
ALTER TABLE "sales_incentives" ADD COLUMN "total_staff_present_in_6_percent" integer NOT NULL;--> statement-breakpoint
ALTER TABLE "sales_incentives" ADD COLUMN "total_staff_absent_in_94_percent" integer NOT NULL;--> statement-breakpoint
ALTER TABLE "sales_incentives" ADD COLUMN "total_staff_absent_in_6_percent" integer NOT NULL;--> statement-breakpoint
ALTER TABLE "sales_incentives" DROP COLUMN "total_staff_94_percent";--> statement-breakpoint
ALTER TABLE "sales_incentives" DROP COLUMN "absent_staff_94_percent";--> statement-breakpoint
ALTER TABLE "sales_incentives" DROP COLUMN "total_staff_6_percent";--> statement-breakpoint
ALTER TABLE "sales_incentives" DROP COLUMN "absent_staff_6_percent";--> statement-breakpoint
ALTER TABLE "sales_incentives" DROP COLUMN "total_active_staff_94_percent";--> statement-breakpoint
ALTER TABLE "sales_incentives" DROP COLUMN "total_active_staff_6_percent";