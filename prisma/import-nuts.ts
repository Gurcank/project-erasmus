import fs from "fs";
import csv from "csv-parser";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const results: any[] = [];

fs.createReadStream("prisma/NUTS.csv")
  .pipe(csv())
  .on("data", (data) => results.push(data))
  .on("end", async () => {
    const filtered = results.filter((row) => {
      const level = row.LEVL_CODE;
      const country = row.CNTR_CODE;

      if (country === "DE" || country === "UK") {
        return level === "2";
      }

      return level === "3";
    });

    const formatted = filtered.map((row) => ({
      name: row.NAME_LATN,
      slug: row.NAME_LATN
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, ""),
      country: row.CNTR_CODE,
      regionSlug: row.NUTS_ID,
      description: null,
      latitude: null,
      longitude: null,
    }));

    await prisma.city.createMany({
      data: formatted,
      skipDuplicates: true,
    });

    console.log("All NUTS regions imported successfully.");
    await prisma.$disconnect();
  });