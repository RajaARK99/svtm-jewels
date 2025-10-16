CREATE TABLE "attendance" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"date" date NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "attendance_entry" (
	"id" text PRIMARY KEY NOT NULL,
	"attendance_id" text NOT NULL,
	"attendance_code_id" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "attendance" ADD CONSTRAINT "attendance_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "attendance_entry" ADD CONSTRAINT "attendance_entry_attendance_id_attendance_id_fk" FOREIGN KEY ("attendance_id") REFERENCES "public"."attendance"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "attendance_entry" ADD CONSTRAINT "attendance_entry_attendance_code_id_attendance_code_id_fk" FOREIGN KEY ("attendance_code_id") REFERENCES "public"."attendance_code"("id") ON DELETE restrict ON UPDATE no action;