CREATE TABLE "sales_incentive_type" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "sales_incentive_type_name_unique" UNIQUE("name")
);
--> statement-breakpoint
ALTER TABLE "employee" ADD COLUMN "sales_incentive_type_id" text;--> statement-breakpoint
ALTER TABLE "employee" ADD CONSTRAINT "employee_sales_incentive_type_id_sales_incentive_type_id_fk" FOREIGN KEY ("sales_incentive_type_id") REFERENCES "public"."sales_incentive_type"("id") ON DELETE no action ON UPDATE no action;