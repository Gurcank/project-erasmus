import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export default async function SettingsPage() {

  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    redirect("/");
  }

  const email = session.user.email;

  const user = await prisma.user.findUnique({
    where: { email }
  });

  if (!user) {
    redirect("/");
  }

  async function updateUsername(formData: FormData) {
    "use server";

    const username = String(formData.get("username") ?? "")
      .toLowerCase()
      .trim();

    if (username.length < 3) {
      throw new Error("Kullanıcı adı en az 3 karakter olmalı");
    }

    const exists = await prisma.user.findUnique({
      where: { username }
    });

    if (exists && exists.email !== email) {
      throw new Error("Bu kullanıcı adı zaten alınmış");
    }

    await prisma.user.update({
      where: { email },
      data: { username }
    });

    revalidatePath(`/u/${username}`);
    revalidatePath("/settings");

    redirect(`/u/${username}`);
  }

  return (
    <div className="max-w-xl mx-auto pt-32 text-white">

      <h1 className="text-3xl font-bold mb-8">
        Hesap Ayarları
      </h1>

      <form action={updateUsername} className="space-y-4">

        <div>
          <label className="text-sm text-white/60">
            Kullanıcı Adı
          </label>

          <input
            name="username"
            defaultValue={user.username ?? ""}
            maxLength={20}
            className="w-full mt-2 bg-white/10 p-3 rounded-xl border border-white/20"
          />
        </div>

        <button
          type="submit"
          className="bg-indigo-600 px-4 py-2 rounded-lg hover:bg-indigo-500"
        >
          Güncelle
        </button>

      </form>

    </div>
  );
}