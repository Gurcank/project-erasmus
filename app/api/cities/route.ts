import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const cities = await prisma.city.findMany({
      orderBy: { name: "asc" },
    });

    return NextResponse.json(cities);
  } catch (error) {
    return NextResponse.json(
      { error: "Cities could not be fetched" },
      { status: 500 }
    );
  }
}