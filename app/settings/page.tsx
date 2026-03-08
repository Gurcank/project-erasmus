import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import ThemeToggle from "@/components/ui/ThemeToggle";
import LanguageSelect from "@/components/ui/LanguageSelect";

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
    <div className="max-w-xl mx-auto pt-32 text-white space-y-12">

      <h1 className="text-3xl font-bold">
        Hesap Ayarları
      </h1>

      {/* USERNAME */}
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

      {/* THEME */}
      <div className="space-y-3">
        <h2 className="text-lg font-semibold">
          Tema
        </h2>

        <ThemeToggle />
      </div>

      {/* LANGUAGE */}
      <div className="space-y-3">
        <h2 className="text-lg font-semibold">
          Dil
        </h2>

        <LanguageSelect />
      </div>

    </div>
  );
}