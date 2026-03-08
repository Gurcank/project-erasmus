import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function POST(req: Request) {
  const session = await getServerSession(authOptions)

  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
  })

  if (!user) {
    return NextResponse.json({ error: "Kullanıcı bulunamadı" }, { status: 404 })
  }

  const body = await req.json()

  // Aynı şehre tekrar yorum yapılmasını engelle
  const existing = await prisma.review.findFirst({
    where: { cityId: body.cityId, userId: user.id },
  })

  if (existing) {
    return NextResponse.json({ error: "Bu şehre zaten yorum yaptınız" }, { status: 400 })
  }

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
        userId: user.id,   // ✅ artık güvenli
      },
    })
    return NextResponse.json(review)
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: "Review oluşturulamadı" }, { status: 500 })
  }
}