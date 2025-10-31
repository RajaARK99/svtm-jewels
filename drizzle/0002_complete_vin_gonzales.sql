CREATE TABLE "employee_attendance" (
	"id" text PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"employee_id" text NOT NULL,
	"date" date NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "employee_attendance_employee_id_date_unique" UNIQUE("employee_id","date")
);
--> statement-breakpoint
CREATE TABLE "employee_attendance_type" (
	"id" text PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"employee_attendance_id" text NOT NULL,
	"attendance_id" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "employee_attendance_type_employee_attendance_id_attendance_id_unique" UNIQUE("employee_attendance_id","attendance_id")
);
--> statement-breakpoint
ALTER TABLE "employee_attendance" ADD CONSTRAINT "employee_attendance_employee_id_employee_id_fk" FOREIGN KEY ("employee_id") REFERENCES "public"."employee"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "employee_attendance_type" ADD CONSTRAINT "employee_attendance_type_employee_attendance_id_employee_attendance_id_fk" FOREIGN KEY ("employee_attendance_id") REFERENCES "public"."employee_attendance"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "employee_attendance_type" ADD CONSTRAINT "employee_attendance_type_attendance_id_attendance_id_fk" FOREIGN KEY ("attendance_id") REFERENCES "public"."attendance"("id") ON DELETE cascade ON UPDATE no action;