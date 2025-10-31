CREATE TABLE "attendance" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"code" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "attendance_name_unique" UNIQUE("name"),
	CONSTRAINT "attendance_code_unique" UNIQUE("code")
);
