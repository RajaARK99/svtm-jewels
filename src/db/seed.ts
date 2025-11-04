import { neon } from "@neondatabase/serverless";
import { randomUUID } from "crypto";
import { config } from "dotenv";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "./schema/options";

// Load environment variables first
config();

// Create database connection for seeding (only needs DATABASE_URL)
const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
  console.error("❌ DATABASE_URL environment variable is required");
  process.exit(1);
}

const sql = neon(databaseUrl);
const db = drizzle({ client: sql, schema: schema });

const jobTitles = [
  "Accounts Executive",
  "Accounts Head",
  "Admin",
  "Aasari",
  "Cashier",
  "CRM",
  "CRO",
  "Driver",
  "Electrical",
  "Executive",
  "First Floor Reception",
  "Floor Manager",
  "Helper",
  "HOD",
  "House Keeping",
  "HR",
  "Master",
  "Mentor",
  "Purchase Manager",
  "Reception",
  "Receptionist",
  "Sales Executive",
  "Section head",
  "SECURITY",
  "Silver Reception",
  "Supervisor",
];

const businessUnits = ["Corp Office", "Gold Showroom", "Silver Showroom"];

const departments = [
  "Accounts",
  "Accounts executive",
  "Admin",
  "Appraiser",
  "Asst Manager",
  "Bangle",
  "Bangles",
  "Barcode - Silver",
  "Boutique",
  "CRM",
  "Cash",
  "Cashier",
  "Chain",
  "Chit",
  "Customer Care",
  "Data Entry",
  "Diamond",
  "Driver",
  "EDP",
  "Floor Manager",
  "GOLD - BARCODE",
  "Gold",
  "Gold Barcode",
  "Golusu",
  "Ground Floor Reception",
  "HR",
  "Hallmark",
  "House Keeping",
  "Kids",
  "Kitchen",
  "Long Necklace",
  "METTI",
  "Marketing",
  "One gram",
  "PRO",
  "Pattarai",
  "Purchase",
  "Reception",
  "Receptionist",
  "Ring",
  "SECURITY",
  "SILVER - BARCODE",
  "SILVER JEWLLARY",
  "Sales Executive",
  "Second Floor Reception",
  "Short Necklace",
  "Silver",
  "Silver Ornaments",
  "Silver Reception",
  "Store",
  "Stud",
  "Supervisor",
  "Telecalling",
  "Thali",
  "Vessels",
];

const locations = [
  "Sri Vasavi Thanga Maaligai",
  "Sri Vasavi - Corporate Office",
  "Sri Vasavi - House of Silver",
];

const legalEntities = ["SRI VASAVI THANGA MAALIGAI"];

const attendance = [
  { 
    id: randomUUID(),
    code: "SL",
    name: "Sick Leave",
  },
  {
    id: randomUUID(),
    code: "PL",
    name: "Paid Leave",
  },
  {
    id: randomUUID(),
    code: "LOP",
    name: "Loss of Pay",
  },
  {
    id: randomUUID(),
    code: "FL",
    name: "Floater Leave",
  },
  {
    id: randomUUID(),
    code: "PL",
    name: "Paid Leave",
  },
  {
    id: randomUUID(),
    code: "FL",
    name: "Floater Leave",
  },
  {
    id: randomUUID(),
    code: "SPL",
    name: "Special Leave",
  },
  {
    id: randomUUID(),
    code: "ML",
    name: "Maternity Leave",
  },
  {
    id: randomUUID(),
    code: "PT",
    name: "Paternity Leave",
  },
  {
    id: randomUUID(),
    code: "BL",
    name: "Bereavement Leave",
  },
  {
    id: randomUUID(),
    code: "CL",
    name: "Casual Leave",
  },
  {
    id: randomUUID(),
    code: "CO",
    name: "Comp Offs",
  },
  {
    id: randomUUID(),
    code: "P",
    name: "Present",
  },
  {
    id: randomUUID(),
    code: "P(MS)",
    name: "Missing Swipe",
  },
  {
    id: randomUUID(),
    code: "H",
    name: "Holiday",
  },
  {
    id: randomUUID(),
    code: "WO",
    name: "Weekly Off",
  },
  {
    id: randomUUID(),
    code: "A",
    name: "Absent",
  },
  {
    id: randomUUID(),
    code: "L",
    name: "Leave",
  },
  {
    id: randomUUID(),
    code: "WFH",
    name: "Work From Home",
  },
  {
    id: randomUUID(),
    code: "OD",
    name: "On Duty",
  },
  {
    id: randomUUID(),
    code: "WOH",
    name: "Worked On Holiday",
  },
  {
    id: randomUUID(),
    code: "NA",
    name: "Not Available",
  },
  {
    id: randomUUID(),
    code: "R",
    name: "Regularized",
  },
  {
    id: randomUUID(),
    code: "P(NS)",
    name: "Present (No Show Penalty)",
  },
];

const convertingTypes = [
  {
    id: randomUUID(),
    name: "Diamond",
  },
  {
    id: randomUUID(),
    name: "Boutique",
  },
  {
    id: randomUUID(),
    name: "AMS",
  },
  {
    id: randomUUID(),
    name: "IDOLS",
  },
];

const salesIncentiveTypes = [
  {
    id: randomUUID(),
    name: "94% Incentive",
  },
  {
    id: randomUUID(),
    name: "6% Incentive",
  },
  {
    id: randomUUID(),
    name: "No Incentive",
  },
];

async function seed() {
  console.log("🌱 Starting seed...");

  try {
    // Seed Job Titles
    console.log("📝 Seeding job titles...");
    const jobTitleValues = jobTitles.map((name) => ({
      id: randomUUID(),
      name,
    }));
    await db.insert(schema.jobTitle).values(jobTitleValues).onConflictDoNothing();
    console.log(`✅ Seeded ${jobTitleValues.length} job titles`);

    // Seed Business Units
    console.log("📝 Seeding business units...");
    const businessUnitValues = businessUnits.map((name) => ({
      id: randomUUID(),
      name,
    }));
    await db.insert(schema.businessUnit).values(businessUnitValues).onConflictDoNothing();
    console.log(`✅ Seeded ${businessUnitValues.length} business units`);

    // Seed Departments
    console.log("📝 Seeding departments...");
    const departmentValues = departments.map((name) => ({
      id: randomUUID(),
      name,
    }));
    await db.insert(schema.department).values(departmentValues).onConflictDoNothing();
    console.log(`✅ Seeded ${departmentValues.length} departments`);

    // Seed Locations
    console.log("📝 Seeding locations...");
    const locationValues = locations.map((name) => ({
      id: randomUUID(),
      name,
    }));
    await db.insert(schema.location).values(locationValues).onConflictDoNothing();
    console.log(`✅ Seeded ${locationValues.length} locations`);

    // Seed Legal Entities
    console.log("📝 Seeding legal entities...");
    const legalEntityValues = legalEntities.map((name) => ({
      id: randomUUID(),
      name,
    }));
    await db.insert(schema.legalEntity).values(legalEntityValues).onConflictDoNothing();
    console.log(`✅ Seeded ${legalEntityValues.length} legal entities`);

    // Seed Attendance - Remove duplicates based on code
    console.log("📝 Seeding attendance types...");
    const uniqueAttendance = attendance.filter(
      (item, index, self) =>
        index === self.findIndex((t) => t.code === item.code)
    );
    await db.insert(schema.attendance).values(uniqueAttendance).onConflictDoNothing();
    console.log(`✅ Seeded ${uniqueAttendance.length} attendance types`);

    // Seed Converting Types
    console.log("📝 Seeding converting types...");
    await db.insert(schema.convertingType).values(convertingTypes).onConflictDoNothing();
    console.log(`✅ Seeded ${convertingTypes.length} converting types`);

    // Seed Sales Incentive Types
    console.log("📝 Seeding sales incentive types...");
    await db.insert(schema.salesIncentiveType).values(salesIncentiveTypes).onConflictDoNothing();
    console.log(`✅ Seeded ${salesIncentiveTypes.length} sales incentive types`);

    console.log("🎉 Seed completed successfully!");
    process.exit(0);
  } catch (error) {
    console.error("❌ Error seeding database:", error);
    process.exit(1);
  }
}

seed();
