import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { cityId } = await req.json();

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    include: { visitedCities: true },
  });

  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  const alreadyVisited = user.visitedCities.some(
    (city) => city.id === cityId
  );

  if (alreadyVisited) {
    await prisma.user.update({
      where: { id: user.id },
      data: {
        visitedCities: {
          disconnect: { id: cityId },
        },
      },
    });

    return NextResponse.json({ removed: true });
  } else {
    await prisma.user.update({
      where: { id: user.id },
      data: {
        visitedCities: {
          connect: { id: cityId },
        },
      },
    });

    return NextResponse.json({ added: true });
  }
}