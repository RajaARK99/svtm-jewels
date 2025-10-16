CREATE TABLE "converting_incentives" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"date" date NOT NULL,
	"gold_weight" numeric(10, 2) DEFAULT '0',
	"coin_weight" numeric(10, 2) DEFAULT '0',
	"diamond_weight" numeric(10, 2) DEFAULT '0',
	"silver_antique_weight" numeric(10, 2) DEFAULT '0',
	"silver_weight" numeric(10, 2) DEFAULT '0',
	"sales_incentive_gold" numeric(12, 2) DEFAULT '0',
	"sales_incentive_gold_coin" numeric(12, 2) DEFAULT '0',
	"sales_incentive_diamond" numeric(12, 2) DEFAULT '0',
	"sales_incentive_silver_antique" numeric(12, 2) DEFAULT '0',
	"sales_incentive_silver" numeric(12, 2) DEFAULT '0',
	"total_incentive" numeric(12, 2) DEFAULT '0',
	"staff_94_percent" integer DEFAULT 0,
	"staff_6_percent" integer DEFAULT 0,
	"absent_staff_94" integer DEFAULT 0,
	"absent_staff_6" integer DEFAULT 0,
	"incentive_per_staff_94" numeric(10, 2) DEFAULT '0',
	"incentive_per_staff_6" numeric(10, 2) DEFAULT '0',
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "converting_metric_type" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"category" text NOT NULL,
	"unit" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "converting_metric_type_name_unique" UNIQUE("name")
);
--> statement-breakpoint
CREATE TABLE "converting_metrics_detail" (
	"id" text PRIMARY KEY NOT NULL,
	"converting_incentives_id" text NOT NULL,
	"metric_type_id" text NOT NULL,
	"value" numeric(12, 4) NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "converting_incentives" ADD CONSTRAINT "converting_incentives_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "converting_metrics_detail" ADD CONSTRAINT "converting_metrics_detail_converting_incentives_id_converting_incentives_id_fk" FOREIGN KEY ("converting_incentives_id") REFERENCES "public"."converting_incentives"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "converting_metrics_detail" ADD CONSTRAINT "converting_metrics_detail_metric_type_id_converting_metric_type_id_fk" FOREIGN KEY ("metric_type_id") REFERENCES "public"."converting_metric_type"("id") ON DELETE restrict ON UPDATE no action;