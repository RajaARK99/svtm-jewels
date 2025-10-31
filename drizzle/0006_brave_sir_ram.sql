CREATE TABLE "sales_incentives" (
	"id" text PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"date" timestamp NOT NULL,
	"gold_4_per_gm_amount" real NOT NULL,
	"gold_coin_1_per_gm_amount" real NOT NULL,
	"diamond_500_per_ct_amount" real NOT NULL,
	"silver_antique_4_per_gm_amount" real NOT NULL,
	"silver_per_gm_amount" real NOT NULL,
	"total_incentive" real NOT NULL,
	"total_staff_94_percent" integer NOT NULL,
	"absent_staff_94_percent" integer NOT NULL,
	"total_staff_6_percent" integer NOT NULL,
	"absent_staff_6_percent" integer NOT NULL,
	"total_active_staff_94_percent" integer NOT NULL,
	"total_active_staff_6_percent" integer NOT NULL,
	"total_incentive_94_percent" real NOT NULL,
	"total_incentive_6_percent" real NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "converting_incentives" (
	"id" text PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"employee_id" text NOT NULL,
	"date" timestamp NOT NULL,
	"type_id" text NOT NULL,
	"weight" real DEFAULT 0 NOT NULL,
	"amount" real DEFAULT 0 NOT NULL,
	"visit" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "converting_incentives" ADD CONSTRAINT "converting_incentives_employee_id_user_id_fk" FOREIGN KEY ("employee_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "converting_incentives" ADD CONSTRAINT "converting_incentives_type_id_converting_type_id_fk" FOREIGN KEY ("type_id") REFERENCES "public"."converting_type"("id") ON DELETE restrict ON UPDATE no action;