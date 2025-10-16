CREATE TABLE "converting_type" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "converting_type_name_unique" UNIQUE("name")
);
--> statement-breakpoint
ALTER TABLE "converting_metric_type" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "converting_metrics_detail" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
DROP TABLE "converting_metric_type" CASCADE;--> statement-breakpoint
DROP TABLE "converting_metrics_detail" CASCADE;--> statement-breakpoint
ALTER TABLE "converting_incentives" DROP CONSTRAINT "converting_incentives_user_id_user_id_fk";
--> statement-breakpoint
ALTER TABLE "converting_incentives" ADD COLUMN "employee_id" text NOT NULL;--> statement-breakpoint
ALTER TABLE "converting_incentives" ADD COLUMN "type_id" text NOT NULL;--> statement-breakpoint
ALTER TABLE "converting_incentives" ADD COLUMN "weight" numeric(10, 2) DEFAULT '0' NOT NULL;--> statement-breakpoint
ALTER TABLE "converting_incentives" ADD COLUMN "visit" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "converting_incentives" ADD COLUMN "amount" numeric(12, 2) DEFAULT '0' NOT NULL;--> statement-breakpoint
ALTER TABLE "converting_incentives" ADD CONSTRAINT "converting_incentives_employee_id_user_id_fk" FOREIGN KEY ("employee_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "converting_incentives" ADD CONSTRAINT "converting_incentives_type_id_converting_type_id_fk" FOREIGN KEY ("type_id") REFERENCES "public"."converting_type"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "converting_incentives" DROP COLUMN "user_id";--> statement-breakpoint
ALTER TABLE "converting_incentives" DROP COLUMN "gold_weight";--> statement-breakpoint
ALTER TABLE "converting_incentives" DROP COLUMN "coin_weight";--> statement-breakpoint
ALTER TABLE "converting_incentives" DROP COLUMN "diamond_weight";--> statement-breakpoint
ALTER TABLE "converting_incentives" DROP COLUMN "silver_antique_weight";--> statement-breakpoint
ALTER TABLE "converting_incentives" DROP COLUMN "silver_weight";--> statement-breakpoint
ALTER TABLE "converting_incentives" DROP COLUMN "sales_incentive_gold";--> statement-breakpoint
ALTER TABLE "converting_incentives" DROP COLUMN "sales_incentive_gold_coin";--> statement-breakpoint
ALTER TABLE "converting_incentives" DROP COLUMN "sales_incentive_diamond";--> statement-breakpoint
ALTER TABLE "converting_incentives" DROP COLUMN "sales_incentive_silver_antique";--> statement-breakpoint
ALTER TABLE "converting_incentives" DROP COLUMN "sales_incentive_silver";--> statement-breakpoint
ALTER TABLE "converting_incentives" DROP COLUMN "total_incentive";--> statement-breakpoint
ALTER TABLE "converting_incentives" DROP COLUMN "staff_94_percent";--> statement-breakpoint
ALTER TABLE "converting_incentives" DROP COLUMN "staff_6_percent";--> statement-breakpoint
ALTER TABLE "converting_incentives" DROP COLUMN "absent_staff_94";--> statement-breakpoint
ALTER TABLE "converting_incentives" DROP COLUMN "absent_staff_6";--> statement-breakpoint
ALTER TABLE "converting_incentives" DROP COLUMN "incentive_per_staff_94";--> statement-breakpoint
ALTER TABLE "converting_incentives" DROP COLUMN "incentive_per_staff_6";