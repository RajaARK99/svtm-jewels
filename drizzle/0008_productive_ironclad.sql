ALTER TABLE "employee" DROP CONSTRAINT "employee_user_id_unique";--> statement-breakpoint
ALTER TABLE "converting_incentives" ALTER COLUMN "weight" SET DATA TYPE integer;--> statement-breakpoint
ALTER TABLE "converting_incentives" ALTER COLUMN "amount" SET DATA TYPE integer;