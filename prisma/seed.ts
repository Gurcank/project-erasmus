import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  await prisma.city.createMany({
    data: [
      // 🇩🇪 Germany
      { name: "Berlin", slug: "berlin", country: "Germany", regionSlug: "DE30" },
      { name: "Munich", slug: "munich", country: "Germany", regionSlug: "DE21" },
      { name: "Hamburg", slug: "hamburg", country: "Germany", regionSlug: "DE60" },

      // 🇫🇷 France
      { name: "Paris", slug: "paris", country: "France", regionSlug: "FR10" },
      { name: "Lyon", slug: "lyon", country: "France", regionSlug: "FRK2" },

      // 🇪🇸 Spain
      { name: "Barcelona", slug: "barcelona", country: "Spain", regionSlug: "ES51" },
      { name: "Madrid", slug: "madrid", country: "Spain", regionSlug: "ES30" },

      // 🇮🇹 Italy
      { name: "Rome", slug: "rome", country: "Italy", regionSlug: "ITI4" },
      { name: "Milan", slug: "milan", country: "Italy", regionSlug: "ITC4" },

      // 🇳🇱 Netherlands
      { name: "Amsterdam", slug: "amsterdam", country: "Netherlands", regionSlug: "NL32" },

      // 🇵🇹 Portugal
      { name: "Lisbon", slug: "lisbon", country: "Portugal", regionSlug: "PT17" },

      // 🇨🇿 Czech Republic
      { name: "Prague", slug: "prague", country: "Czech Republic", regionSlug: "CZ01" },

      // 🇭🇺 Hungary
      { name: "Budapest", slug: "budapest", country: "Hungary", regionSlug: "HU11" },

      // 🇵🇱 Poland
      { name: "Warsaw", slug: "warsaw", country: "Poland", regionSlug: "PL91" },

      // 🇦🇹 Austria
      { name: "Vienna", slug: "vienna", country: "Austria", regionSlug: "AT13" }
    ]
  });

  console.log("Cities seeded with real NUTS codes.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });