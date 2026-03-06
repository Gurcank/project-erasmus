import Map from "@/components/Map";
import { prisma } from "@/lib/prisma";

export default async function HomePage() {
  const cities = await prisma.city.findMany();
  return <Map cities={cities} />;
}