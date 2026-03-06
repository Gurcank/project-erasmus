import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth";
import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function POST(req: Request) {
  const session = await getServerSession(authOptions)

  if (!session) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 }
    )
  }

  const body = await req.json()

  try {
    const review = await prisma.review.create({
      data: {
        cityId: body.cityId,
        content: body.comment,

        kultur: body.kultur,
        gastronomi: body.gastronomi,
        guvenlik: body.guvenlik,
        geceHayati: body.geceHayati,
        ulasim: body.ulasim,
        yasamMaliyeti: body.yasamMaliyeti,

        userId: session.user.id,
      },
    })

    return NextResponse.json(review)
  } catch (error) {
    console.error(error)
    return NextResponse.json(
      { error: "Review oluşturulamadı" },
      { status: 500 }
    )
  }
}