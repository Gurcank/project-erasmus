import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function PUT(req: Request) {
  const session = await getServerSession(authOptions)

  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { bio } = await req.json()

  const updatedUser = await prisma.user.update({
    where: { email: session.user.email },
    data: { bio },
  })

  return NextResponse.json(updatedUser)
}