CREATE TABLE "attendance_code" (
	"id" text PRIMARY KEY NOT NULL,
	"code" text NOT NULL,
	"description" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "attendance_code_code_unique" UNIQUE("code")
);
