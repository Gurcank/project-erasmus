import { PrismaClient } from "@prisma/client";
import fs from "fs";
import path from "path";

const prisma = new PrismaClient();

function slugify(text: string) {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, "-")
    .replace(/[^\w-]+/g, "")
    .replace(/--+/g, "-");
}

async function main() {
  const filePath = path.join(process.cwd(), "data", "nuts.geojson");
  const raw = fs.readFileSync(filePath, "utf-8");
  const geo = JSON.parse(raw);

  const cities = [];

  for (const feature of geo.features) {
    const props = feature.properties;

    const level = props.LEVL_CODE;
    const country = props.CNTR_CODE;
    const regionSlug = props.NUTS_ID;
    const name = props.NAME_LATN;

    if (!regionSlug || !name) continue;

    const isDEorUK = country === "DE" || country === "UK";

    if (isDEorUK && level !== 2) continue;
    if (!isDEorUK && level !== 3) continue;

    cities.push({
      name,
      slug: slugify(name),
      regionSlug,
      country,
    });
  }

  console.log(`Preparing to insert ${cities.length} regions...`);

  await prisma.city.createMany({
    data: cities,
    skipDuplicates: true,
  });

  console.log("🔥 DONE. All regions inserted.");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());