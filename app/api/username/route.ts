import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function POST(req: Request) {

  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { username } = await req.json();

  const exists = await prisma.user.findUnique({
    where: { username }
  });

  if (exists) {
    return Response.json({ error: "Username alınmış" }, { status: 400 });
  }

  await prisma.user.update({
    where: { email: session.user.email },
    data: { username }
  });

  return Response.json({ success: true });
}