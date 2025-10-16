import "dotenv/config";
import { v4 as uuidv4 } from "uuid";
import { db } from "../src/db";
import { attendanceCode } from "../src/db/schema";

const attendanceCodes = [
	{ code: "SL", description: "Sick Leave" },
	{ code: "PL", description: "Paid Leave" },
	{ code: "LOP", description: "Loss of Pay" },
	{ code: "FL", description: "Floater Leave" },
	{ code: "SPL", description: "Special Leave" },
	{ code: "ML", description: "Maternity Leave" },
	{ code: "PT", description: "Paternity Leave" },
	{ code: "BL", description: "Bereavement Leave" },
	{ code: "CL", description: "Casual Leave" },
	{ code: "CO", description: "Comp Offs" },
	{ code: "P", description: "Present" },
	{ code: "P(MS)", description: "Missing Swipe" },
	{ code: "H", description: "Holiday" },
	{ code: "WO", description: "Weekly Off" },
	{ code: "A", description: "Absent" },
	{ code: "L", description: "Leave" },
	{ code: "WFH", description: "Work From Home" },
	{ code: "OD", description: "On Duty" },
	{ code: "WOH", description: "Worked On Holiday" },
	{ code: "NA", description: "Not Available" },
	{ code: "R", description: "Regularized" },
	{ code: "P(NS)", description: "Present (No Show Penalty)" },
];

async function seedAttendanceCodes() {
	try {
		console.log("🌱 Starting to seed attendance codes...\n");

		let successCount = 0;
		let skipCount = 0;

		for (const code of attendanceCodes) {
			try {
				// Check if code already exists
				const existing = await db.query.attendanceCode.findFirst({
					where: (table, { eq }) => eq(table.code, code.code),
				});

				if (existing) {
					console.log(`⚠️  Code already exists: ${code.code}`);
					skipCount++;
					continue;
				}

				// Insert new attendance code
				await db.insert(attendanceCode).values({
					id: uuidv4(),
					code: code.code,
					description: code.description,
				});

				console.log(
					`✅ Created attendance code: ${code.code} - ${code.description}`,
				);
				successCount++;
			} catch (error) {
				console.error(
					`❌ Failed to create code ${code.code}:`,
					error instanceof Error ? error.message : String(error),
				);
			}
		}

		console.log("\n" + "=".repeat(50));
		console.log("📊 Seed Summary:");
		console.log(`✅ Successfully created: ${successCount} codes`);
		console.log(`⏭️  Skipped (already exists): ${skipCount} codes`);
		console.log("=".repeat(50));
		console.log("✨ Attendance code seeding completed!");
	} catch (error) {
		console.error("❌ Seed failed:", error);
		process.exit(1);
	}
}

seedAttendanceCodes();
