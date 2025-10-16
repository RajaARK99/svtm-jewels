import "dotenv/config";
import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { v4 as uuidv4 } from "uuid";
import { convertingType } from "../src/db/schema";
import { serverEnv } from "../src/env/server";

const sql = neon(serverEnv.DATABASE_URL);
const db = drizzle({
	client: sql,
	schema: { convertingType },
});

const convertingTypes = [
	{
		id: uuidv4(),
		name: "Diamond",
		description: "Diamond converting incentives",
	},
	{
		id: uuidv4(),
		name: "Boutique",
		description: "Boutique converting incentives",
	},
	{
		id: uuidv4(),
		name: "AMS",
		description: "AMS converting incentives",
	},
	{
		id: uuidv4(),
		name: "IDOLS",
		description: "IDOLS converting incentives",
	},
];

async function main() {
	try {
		console.log("🌱 Starting converting types seed...");

		console.log("\n📝 Seeding Converting Types...");
		for (const type of convertingTypes) {
			try {
				await db.insert(convertingType).values(type);
				console.log(`  ✅ Inserted: ${type.name}`);
			} catch (error) {
				// Skip duplicate entries
				console.log(`  ⚠️  Skipping duplicate: ${type.name}`);
			}
		}
		console.log(`✅ Processed ${convertingTypes.length} converting types!`);

		// Fetch and display all converting types
		const allTypes = await db.select().from(convertingType);
		console.log("\n📋 All Converting Types in Database:");
		allTypes.forEach((type, index) => {
			console.log(`  ${index + 1}. ${type.name} - ${type.description}`);
		});

		console.log("\n✨ Seed completed successfully!");
	} catch (error) {
		console.error("❌ Seed failed:", error);
		process.exit(1);
	}
}

main();
