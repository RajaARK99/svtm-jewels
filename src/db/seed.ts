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
    code: "SL",
    name: "Sick Leave",
  },
  {
    code: "PL",
    name: "Paid Leave",
  },
  {
    code: "LOP",
    name: "Loss of Pay",
  },
  {
    code: "FL",
    name: "Floater Leave",
  },
  {
    code: "PL",
    name: "Paid Leave",
  },
  {
    code: "FL",
    name: "Floater Leave",
  },
  {
    code: "SPL",
    name: "Special Leave",
  },
  {
    code: "ML",
    name: "Maternity Leave",
  },
  {
    code: "PT",
    name: "Paternity Leave",
  },
  {
    code: "BL",
    name: "Bereavement Leave",
  },
  {
    code: "CL",
    name: "Casual Leave",
  },
  {
    code: "CO",
    name: "Comp Offs",
  },
  {
    code: "P",
    name: "Present",
  },
  {
    code: "P(MS)",
    name: "Missing Swipe",
  },
  {
    code: "H",
    name: "Holiday",
  },
  {
    code: "WO",
    name: "Weekly Off",
  },
  {
    code: "A",
    name: "Absent",
  },
  {
    code: "L",
    name: "Leave",
  },
  {
    code: "WFH",
    name: "Work From Home",
  },
  {
    code: "OD",
    name: "On Duty",
  },
  {
    code: "WOH",
    name: "Worked On Holiday",
  },
  {
    code: "NA",
    name: "Not Available",
  },
  {
    code: "R",
    name: "Regularized",
  },
  {
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

    console.log("📝 Seeding sales incentive types...");
    await db
      .insert(schema.salesIncentiveType)
      .values(salesIncentiveTypes)
      .onConflictDoNothing({ target: schema.salesIncentiveType.name });
    console.log(
      `✅ Seeded ${salesIncentiveTypes.length} sales incentive types`,
    );
    console.log("✅ Seeded database successfully");
    process.exit(0);
  } catch (error) {
    console.error("❌ Error seeding database:", error);
    process.exit(1);
  }
}

seed();
