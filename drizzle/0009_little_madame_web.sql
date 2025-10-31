ALTER TABLE "converting_incentives" DROP CONSTRAINT "converting_incentives_employee_id_user_id_fk";
--> statement-breakpoint
ALTER TABLE "converting_incentives" ALTER COLUMN "weight" SET DATA TYPE real;--> statement-breakpoint
ALTER TABLE "converting_incentives" ALTER COLUMN "amount" SET DATA TYPE real;--> statement-breakpoint
ALTER TABLE "converting_incentives" ADD CONSTRAINT "converting_incentives_employee_id_employee_id_fk" FOREIGN KEY ("employee_id") REFERENCES "public"."employee"("id") ON DELETE cascade ON UPDATE no action;