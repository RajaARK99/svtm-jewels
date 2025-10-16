import "dotenv/config";
import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { v4 as uuidv4 } from "uuid";
import {
	businessUnit,
	department,
	jobTitle,
	legalEntity,
	location,
} from "../src/db/schema";
import { serverEnv } from "../src/env/server";

const sql = neon(serverEnv.DATABASE_URL);
const db = drizzle({
	client: sql,
	schema: { jobTitle, businessUnit, department, location, legalEntity },
});

const jobTitles = [
	{ id: uuidv4(), name: "HOD" },
	{ id: uuidv4(), name: "Purchase Manager" },
	{ id: uuidv4(), name: "Mentor" },
	{ id: uuidv4(), name: "Sales Executive" },
	{ id: uuidv4(), name: "Cashier" },
	{ id: uuidv4(), name: "CRO" },
	{ id: uuidv4(), name: "Executive" },
	{ id: uuidv4(), name: "Section head" },
	{ id: uuidv4(), name: "Reception" },
	{ id: uuidv4(), name: "Floor Manager" },
	{ id: uuidv4(), name: "Accounts Executive" },
	{ id: uuidv4(), name: "HR" },
	{ id: uuidv4(), name: "First Floor Reception" },
	{ id: uuidv4(), name: "Admin" },
	{ id: uuidv4(), name: "Receptionist" },
	{ id: uuidv4(), name: "House Keeping" },
	{ id: uuidv4(), name: "Silver Reception" },
	{ id: uuidv4(), name: "CRM" },
	{ id: uuidv4(), name: "SECURITY" },
	{ id: uuidv4(), name: "Accounts Head" },
	{ id: uuidv4(), name: "Helper" },
	{ id: uuidv4(), name: "Aasari" },
	{ id: uuidv4(), name: "Driver" },
	{ id: uuidv4(), name: "Master" },
	{ id: uuidv4(), name: "Supervisor" },
	{ id: uuidv4(), name: "Electrical" },
];

const businessUnits = [
	{ id: uuidv4(), name: "Gold Showroom" },
	{ id: uuidv4(), name: "Corp Office" },
	{ id: uuidv4(), name: "Silver Showroom" },
	{ id: uuidv4(), name: "Business Unit" },
];

const departments = [
	{ id: uuidv4(), name: "Long Necklace" },
	{ id: uuidv4(), name: "Gold" },
	{ id: uuidv4(), name: "Diamond" },
	{ id: uuidv4(), name: "Thali" },
	{ id: uuidv4(), name: "Chain" },
	{ id: uuidv4(), name: "Bangle" },
	{ id: uuidv4(), name: "Cash" },
	{ id: uuidv4(), name: "Appraiser" },
	{ id: uuidv4(), name: "Short Necklace" },
	{ id: uuidv4(), name: "Gold Barcode" },
	{ id: uuidv4(), name: "One gram" },
	{ id: uuidv4(), name: "Golusu" },
	{ id: uuidv4(), name: "Stud" },
	{ id: uuidv4(), name: "Store" },
	{ id: uuidv4(), name: "Ring" },
	{ id: uuidv4(), name: "Boutique" },
	{ id: uuidv4(), name: "Sales Executive" },
	{ id: uuidv4(), name: "Reception" },
	{ id: uuidv4(), name: "Silver" },
	{ id: uuidv4(), name: "Floor Manager" },
	{ id: uuidv4(), name: "Vessels" },
	{ id: uuidv4(), name: "Bangles" },
	{ id: uuidv4(), name: "Telecalling" },
	{ id: uuidv4(), name: "Silver Ornaments" },
	{ id: uuidv4(), name: "Barcode - Silver" },
	{ id: uuidv4(), name: "Second Floor Reception" },
	{ id: uuidv4(), name: "Kids" },
	{ id: uuidv4(), name: "Ground Floor Reception" },
	{ id: uuidv4(), name: "Accounts" },
	{ id: uuidv4(), name: "HR" },
	{ id: uuidv4(), name: "Receptionist" },
	{ id: uuidv4(), name: "METTI" },
	{ id: uuidv4(), name: "Chit" },
	{ id: uuidv4(), name: "House Keeping" },
	{ id: uuidv4(), name: "Customer Care" },
	{ id: uuidv4(), name: "Hallmark" },
	{ id: uuidv4(), name: "Silver Reception" },
	{ id: uuidv4(), name: "CRM" },
	{ id: uuidv4(), name: "SECURITY" },
	{ id: uuidv4(), name: "Marketing" },
	{ id: uuidv4(), name: "Asst Manager" },
	{ id: uuidv4(), name: "Cashier" },
	{ id: uuidv4(), name: "Kitchen" },
	{ id: uuidv4(), name: "Pattarai" },
	{ id: uuidv4(), name: "Data Entry" },
	{ id: uuidv4(), name: "Admin" },
	{ id: uuidv4(), name: "EDP" },
	{ id: uuidv4(), name: "Driver" },
];

const locations = [
	{ id: uuidv4(), name: "Sri Vasavi Thanga Maaligai" },
	{ id: uuidv4(), name: "Sri Vasavi - Corporate Office" },
	{ id: uuidv4(), name: "Sri Vasavi - House of Silver" },
];

const legalEntities = [{ id: uuidv4(), name: "SRI VASAVI THANGA MAALIGAI" }];

async function main() {
	try {
		console.log("🌱 Starting seed...");

		// Insert job titles
		console.log("\n📝 Seeding Job Titles...");
		for (const title of jobTitles) {
			try {
				await db.insert(jobTitle).values(title);
			} catch (error) {
				// Skip duplicate entries
				console.log(`  ⚠️  Skipping duplicate: ${title.name}`);
			}
		}
		console.log(`✅ Processed ${jobTitles.length} job titles!`);

		// Insert business units
		console.log("\n📝 Seeding Business Units...");
		for (const unit of businessUnits) {
			try {
				await db.insert(businessUnit).values(unit);
			} catch (error) {
				// Skip duplicate entries
				console.log(`  ⚠️  Skipping duplicate: ${unit.name}`);
			}
		}
		console.log(`✅ Processed ${businessUnits.length} business units!`);

		// Insert departments
		console.log("\n📝 Seeding Departments...");
		for (const dept of departments) {
			try {
				await db.insert(department).values(dept);
			} catch (error) {
				// Skip duplicate entries
				console.log(`  ⚠️  Skipping duplicate: ${dept.name}`);
			}
		}
		console.log(`✅ Processed ${departments.length} departments!`);

		// Insert locations
		console.log("\n📝 Seeding Locations...");
		for (const loc of locations) {
			try {
				await db.insert(location).values(loc);
			} catch (error) {
				// Skip duplicate entries
				console.log(`  ⚠️  Skipping duplicate: ${loc.name}`);
			}
		}
		console.log(`✅ Processed ${locations.length} locations!`);

		// Insert legal entities
		console.log("\n📝 Seeding Legal Entities...");
		for (const entity of legalEntities) {
			try {
				await db.insert(legalEntity).values(entity);
			} catch (error) {
				// Skip duplicate entries
				console.log(`  ⚠️  Skipping duplicate: ${entity.name}`);
			}
		}
		console.log(`✅ Processed ${legalEntities.length} legal entities!`);

		// Fetch and display all job titles
		const allJobTitles = await db.select().from(jobTitle);
		console.log("\n📋 All Job Titles in Database:");
		allJobTitles.forEach((title, index) => {
			console.log(`  ${index + 1}. ${title.name}`);
		});

		// Fetch and display all business units
		const allBusinessUnits = await db.select().from(businessUnit);
		console.log("\n📋 All Business Units in Database:");
		allBusinessUnits.forEach((unit, index) => {
			console.log(`  ${index + 1}. ${unit.name}`);
		});

		// Fetch and display all departments
		const allDepartments = await db.select().from(department);
		console.log("\n📋 All Departments in Database:");
		allDepartments.forEach((dept, index) => {
			console.log(`  ${index + 1}. ${dept.name}`);
		});

		// Fetch and display all locations
		const allLocations = await db.select().from(location);
		console.log("\n📋 All Locations in Database:");
		allLocations.forEach((loc, index) => {
			console.log(`  ${index + 1}. ${loc.name}`);
		});

		// Fetch and display all legal entities
		const allLegalEntities = await db.select().from(legalEntity);
		console.log("\n📋 All Legal Entities in Database:");
		allLegalEntities.forEach((entity, index) => {
			console.log(`  ${index + 1}. ${entity.name}`);
		});

		console.log("\n✨ Seed completed successfully!");
	} catch (error) {
		console.error("❌ Seed failed:", error);
		process.exit(1);
	}
}

main();
