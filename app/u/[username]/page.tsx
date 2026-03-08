import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import WorldMap from "@/components/map/Map";
import Link from "next/link";
import { latinize } from "@/lib/latinize";
import { revalidatePath } from "next/cache";

export default async function ProfilePage({
  params,
}: {
  params: Promise<{ username: string }>;
}) {

  const session = await getServerSession(authOptions);

  const { username } = await params;

  if (!username) {
    return <div>User not found</div>;
  }

  const user = await prisma.user.findUnique({
    where: { username },
    include: {
      reviews: {
        include: { city: true },
      },
      visitedCities: {
        select: {
          id: true,
          name: true,
          slug: true,
          regionSlug: true,
        },
      },
    },
  });

  if (!user) {
    return <div>Kullanıcı bulunamadı</div>;
  }

  const isOwnProfile = session?.user?.email === user.email;
  const reviewCount = user.reviews.length;
  const visitedCities = user.visitedCities;
  const cityCount = visitedCities.length;

  // BIO GÜNCELLEME
  async function updateBio(formData: FormData) {
    "use server";

    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      throw new Error("Giriş yapmalısın");
    }

    const bio = String(formData.get("bio") ?? "").trim();

    const updatedUser = await prisma.user.update({
      where: { email: session.user.email },
      data: { bio },
    });

    revalidatePath(`/u/${updatedUser.username}`);
  }

  

  return (
    <div className="relative min-h-screen w-full pt-24">

      {/* 🌍 MAP */}
      <div className="fixed inset-0 -z-20">
        <WorldMap isStatic />
      </div>

      {/* 🌌 OVERLAY */}
      <div className="fixed inset-0 bg-black/70 backdrop-blur-[3px] -z-10" />

      <div className="relative flex max-w-7xl mx-auto gap-8 px-6 pb-20">

        {/* 🔹 SOL SIDEBAR */}
        <div className="w-80 backdrop-blur-2xl bg-white/10 border border-white/20 rounded-3xl p-8 shadow-xl flex flex-col gap-8">

          {/* 👤 USER */}
          <div className="text-center">
            <div className="w-24 h-24 mx-auto rounded-full bg-white/20 flex items-center justify-center text-4xl text-white font-bold mb-4">
              {user?.name?.charAt(0)}
            </div>

            <h2 className="text-xl font-bold text-white">
              @{user?.username}
            </h2>
          </div>

          {/* 📊 STATS */}
          <div className="space-y-4">

            <div className="bg-white/10 rounded-xl p-4 text-center">
              <p className="text-2xl font-bold text-white">{cityCount}</p>
              <p className="text-white/60 text-sm">Ziyaret Edilen Şehir</p>
            </div>

            <div className="bg-white/10 rounded-xl p-4 text-center">
              <p className="text-2xl font-bold text-white">{reviewCount}</p>
              <p className="text-white/60 text-sm">Yapılan Yorum</p>
            </div>

          </div>

          {/* 📝 BIO */}
          <div>
            <h3 className="text-white font-semibold mb-2">Bio</h3>
            {isOwnProfile ? (
              <form action={updateBio} className="space-y-3">
                <textarea
                  name="bio"
                  defaultValue={user?.bio ?? ""}
                  placeholder="Kendin hakkında bir şeyler yaz..."
                  className="w-full bg-white/10 text-white text-sm p-4 rounded-xl border border-white/20 focus:outline-none focus:border-indigo-400"
                />

                <button
                  type="submit"
                  className="bg-indigo-600 hover:bg-indigo-500 px-4 py-2 rounded-lg text-sm"
                >
                  Kaydet
                </button>
              </form>
            ) : (
              <p className="text-white/70 text-sm bg-white/10 p-4 rounded-xl">
                {user?.bio || "Henüz bio eklenmemiş."}
              </p>
            )}
          </div>


          

        </div>

        {/* 🔹 SAĞ ANA ALAN */}
        <div className="flex-1 space-y-8">

          {/* 🏙️ ZİYARET EDİLEN ŞEHİRLER */}
          <div className="backdrop-blur-2xl bg-white/10 border border-white/20 rounded-3xl p-8">

            <h3 className="text-xl font-bold text-white mb-6">
              Ziyaret Edilen Şehirler
            </h3>

            <div className="grid grid-cols-3 gap-4 text-white">

              {visitedCities.map((city) => (
                <Link
                  key={city.id}
                  href={`/c/${city.slug}`}
                  className="bg-white/10 rounded-xl p-4 hover:bg-indigo-500/20 transition border border-white/10 hover:border-indigo-400"
                >
                  {latinize(city.name)}
                </Link>
              ))}

            </div>

          </div>

          {/* ⭐ YAPILAN YORUMLAR */}
          <div className="backdrop-blur-2xl bg-white/10 border border-white/20 rounded-3xl p-8">

            <h3 className="text-xl font-bold text-white mb-6">
              Yapılan Yorumlar
            </h3>

            <div className="space-y-6">

              {user.reviews.map((review: typeof user.reviews[number]) => {

                const average =
                  (
                    review.kultur +
                    review.gastronomi +
                    review.guvenlik +
                    review.geceHayati +
                    review.ulasim +
                    review.yasamMaliyeti
                  ) / 6;

                return (
                  <div
                    key={review.id}
                    className="bg-white/10 hover:bg-white/15 transition rounded-2xl p-6 border border-white/10"
                  >
                    <div className="flex justify-between items-start mb-3">

                      <div>
                        <Link
                          href={`/c/${review.city.slug}`}
                          className="text-white font-semibold text-lg hover:text-indigo-400 transition"
                        >
                          {latinize(review.city.name)}
                        </Link>
                        <p className="text-white/40 text-xs">
                          {new Date(review.createdAt).toLocaleDateString("tr-TR")}
                        </p>
                      </div>

                      <div className="text-indigo-400 font-semibold">
                        ⭐ {average.toFixed(1)}
                      </div>

                    </div>

                    <p className="text-white/80 leading-relaxed">
                      {review.content}
                    </p>

                  </div>
                );
              })}

              {user.reviews.length === 0 && (
                <p className="text-white/50">
                  Henüz yorum yapmadınız.
                </p>
              )}

            </div>

          </div>

        </div>

      </div>
    </div>
  );
}