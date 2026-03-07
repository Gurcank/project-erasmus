import { prisma } from "@/lib/prisma";
import StarInput from "@/components/StarInput";
import { notFound } from "next/navigation";
import VisitButton from "@/components/VisitButton";
import Map from "@/components/Map";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { latinize } from "@/lib/latinize";
import Link from "next/link";

type Props = {
  params: Promise<{
    slug: string;
  }>;
};

/* ⭐ Yıldız Component */
function Stars({ value }: { value: number }) {
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((i) => (
        <span
          key={i}
          className={`text-xl ${i <= value ? "text-yellow-400" : "text-zinc-700"
            }`}
        >
          ★
        </span>
      ))}
    </div>
  );
}

export default async function CityPage({ params }: { params: Promise<{ slug: string }> }) {

  const { slug } = await params;

  const city = await prisma.city.findUnique({
    where: {
      slug: slug
    },
    include: {
      reviews: {
        include: {
          user: {
            select: {
              id: true,
              name: true,
              image: true,
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
      },
    },
  });

  const cities = await prisma.city.findMany({
    select: {
      name: true,
      slug: true,
    },
  });

  if (!city) notFound();

  const cityLatin = latinize(city.name);
  const session = await getServerSession(authOptions);

  const user = session?.user?.email
    ? await prisma.user.findUnique({
      where: { email: session.user.email },
      include: { visitedCities: true },
    })
    : null;

  const isVisited =
    user?.visitedCities.some((c) => c.id === city.id) ?? false;

  const cityId = city.id;

  async function submitReview(formData: FormData) {
    "use server";

    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      throw new Error("Giriş yapmalısınız");
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      throw new Error("Kullanıcı bulunamadı");
    }

    const kultur = Number(formData.get("kultur"));
    const gastronomi = Number(formData.get("gastronomi"));
    const guvenlik = Number(formData.get("guvenlik"));
    const geceHayati = Number(formData.get("geceHayati"));
    const ulasim = Number(formData.get("ulasim"));
    const yasamMaliyeti = Number(formData.get("yasamMaliyeti"));
    const content = String(formData.get("content"));

    await prisma.review.create({
      data: {
        cityId: cityId,
        userId: user.id,
        kultur,
        gastronomi,
        guvenlik,
        geceHayati,
        ulasim,
        yasamMaliyeti,
        content,
        isApproved: true,
      },
    });

    await prisma.user.update({
      where: { id: user.id },
      data: {
        visitedCities: {
          connect: { id: cityId },
        },
      },
    });

    revalidatePath(`/c/${slug}`);
  }

  const unsplashRes = await fetch(
    `https://api.unsplash.com/search/photos?query=${cityLatin}&orientation=landscape&per_page=1`,
    {
      headers: {
        Authorization: `Client-ID ${process.env.UNSPLASH_ACCESS_KEY}`,
      },
      next: { revalidate: 86400 }, // 1 gün cache
    }
  );

  const unsplashData = await unsplashRes.json();
  const cityImage = unsplashData.results?.[0]?.urls?.regular || null;

  const ratingData = await prisma.review.aggregate({
    where: {
      cityId: city.id,
    },
    _avg: {
      kultur: true,
      gastronomi: true,
      guvenlik: true,
      geceHayati: true,
      ulasim: true,
      yasamMaliyeti: true,
    },
    _count: true,
  });

  const reviewCount = ratingData._count;


  const genelOrtalama =
    reviewCount > 0
      ? (
        (ratingData._avg.kultur ?? 0) +
        (ratingData._avg.gastronomi ?? 0) +
        (ratingData._avg.guvenlik ?? 0) +
        (ratingData._avg.geceHayati ?? 0) +
        (ratingData._avg.ulasim ?? 0) +
        (ratingData._avg.yasamMaliyeti ?? 0)
      ) / 6
      : 0;

  const kategori = {
    kultur: Math.round(ratingData._avg.kultur ?? 0),
    gastronomi: Math.round(ratingData._avg.gastronomi ?? 0),
    guvenlik: Math.round(ratingData._avg.guvenlik ?? 0),
    geceHayati: Math.round(ratingData._avg.geceHayati ?? 0),
    ulasim: Math.round(ratingData._avg.ulasim ?? 0),
    yasamMaliyeti: Math.round(ratingData._avg.yasamMaliyeti ?? 0),
  };

  return (
    <div className="relative min-h-screen text-white">

      {/* 🔵 ARKA PLAN MAP */}
      <div className="fixed inset-0 -z-10">
        <Map cities={cities} isStatic />
      </div>

      {/* 🔲 OVERLAY + İÇERİK */}
      <div className="relative z-10 bg-black/60 backdrop-blur-sm pt-16">

        <div className="max-w-7xl mx-auto px-8 py-20">


          <div className="grid md:grid-cols-2 gap-16 items-start mb-16">

            <div>
              <div className="mb-8 flex items-center justify-between">
                <h1 className="text-5xl font-bold tracking-tight">
                  {cityLatin}
                </h1>

                <VisitButton
                  cityId={city.id}
                  initialVisited={isVisited}
                />
              </div>

              <div className="w-full h-[400px] rounded-2xl overflow-hidden border border-zinc-800">
                {cityImage ? (
                  <img
                    src={cityImage}
                    alt={cityLatin}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-zinc-900 text-zinc-500">
                    {cityLatin} için fotoğraf bulunamadı
                  </div>
                )}
              </div>
            </div>

            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-8 space-y-6">

              <h2 className="text-2xl font-semibold mb-4">
                Şehir Puanları
              </h2>

              <div className="flex justify-between items-center">
                <span>Pahalılık</span>
                <Stars value={kategori.yasamMaliyeti} />
              </div>

              <div className="flex justify-between items-center">
                <span>Güvenlik</span>
                <Stars value={kategori.guvenlik} />
              </div>

              <div className="flex justify-between items-center">
                <span>Sosyal Hayat</span>
                <Stars value={kategori.geceHayati} />
              </div>

              <div className="flex justify-between items-center">
                <span>Kültür</span>
                <Stars value={kategori.kultur} />
              </div>

              <div className="flex justify-between items-center">
                <span>Gastronomi</span>
                <Stars value={kategori.gastronomi} />
              </div>

              <div className="flex justify-between items-center">
                <span>Ulaşım</span>
                <Stars value={kategori.ulasim} />
              </div>

              <div className="pt-6 border-t border-zinc-800">
                <div className="flex items-center gap-4">
                  <span className="text-4xl font-bold text-indigo-500">
                    {reviewCount > 0 ? genelOrtalama.toFixed(1) : "-"}
                  </span>
                  <span className="text-zinc-400">
                    {reviewCount} değerlendirme
                  </span>
                </div>
              </div>

            </div>
          </div>

          <form action={submitReview} className="bg-zinc-900/80 backdrop-blur border border-zinc-800 rounded-2xl p-8 space-y-8 max-w-4xl mx-auto">

            <h2 className="text-xl font-semibold text-center tracking-wide">
              Şehri Değerlendir
            </h2>

            <div className="grid grid-cols-2 gap-5">
              <StarInput label="Pahalılık" name="yasamMaliyeti" />
              <StarInput label="Güvenlik" name="guvenlik" />
              <StarInput label="Sosyal Hayat" name="geceHayati" />
              <StarInput label="Kültür" name="kultur" />
              <StarInput label="Gastronomi" name="gastronomi" />
              <StarInput label="Ulaşım" name="ulasim" />
            </div>

            <textarea
              name="content"
              placeholder="Yorumunu yaz..."
              className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 h-24 focus:outline-none focus:border-indigo-500 transition"
            />

            <div className="flex justify-center">
              <button
                type="submit"
                className="bg-indigo-600 hover:bg-indigo-500 active:scale-95 transition-all px-6 py-2.5 rounded-xl text-sm font-medium shadow-lg shadow-indigo-900/40"
              >
                Yorumu Gönder
              </button>
            </div>

          </form>
          <div className="mt-28 w-full">
            <div className="bg-zinc-900/80 backdrop-blur border border-zinc-800 rounded-3xl px-6 py-14">

              <h2 className="text-3xl font-bold tracking-tight mb-12">
                Yapılan Yorumlar
              </h2>

              {city.reviews.length === 0 && (
                <p className="text-zinc-500">
                  Henüz yorum yapılmamış.
                </p>
              )}

              <div className="flex flex-col gap-10">
                {city.reviews.map((review) => (
                  <div
                    key={review.id}
                    className="bg-zinc-950/60 border border-zinc-800 rounded-2xl p-8 hover:border-indigo-500/40 transition-all"
                  >
                    <div className="flex justify-between items-start mb-3">
                      <Link
                        href={`/profile/${review.user?.id}`}
                        className="flex items-center gap-3 hover:opacity-80 transition"
                      >
                        {review.user?.image ? (
                          <img
                            src={review.user.image}
                            alt={review.user?.name ?? "User"}
                            className="w-12 h-12 rounded-full object-cover"
                          />
                        ) : (
                          <div className="w-12 h-12 rounded-full bg-zinc-700 flex items-center justify-center text-sm">
                            {review.user?.name?.charAt(0).toUpperCase() ?? "U"}
                          </div>
                        )}

                        <div>
                          <p className="font-semibold text-white">
                            {review.user?.name}
                          </p>

                          <p className="text-zinc-500 text-xs">
                            {new Date(review.createdAt).toLocaleDateString("tr-TR")}
                          </p>
                        </div>
                      </Link>

                      <span className="text-indigo-500 font-semibold text-lg">
                        ⭐ {(
                          (
                            review.kultur +
                            review.gastronomi +
                            review.guvenlik +
                            review.geceHayati +
                            review.ulasim +
                            review.yasamMaliyeti
                          ) / 6
                        ).toFixed(1)}
                      </span>
                    </div>

                    <p className="text-zinc-300 leading-relaxed text-lg mt-6 max-w-4xl">
                      {review.content}
                    </p>

                    <div className="mt-6 flex flex-wrap gap-2 text-xs">

                      <div className="bg-zinc-800 px-3 py-1 rounded-lg flex items-center gap-1">
                        <span>Pahalılık</span>
                        <Stars value={review.yasamMaliyeti} />
                      </div>

                      <div className="bg-zinc-800 px-3 py-1 rounded-lg flex items-center gap-1">
                        <span>Güvenlik</span>
                        <Stars value={review.guvenlik} />
                      </div>

                      <div className="bg-zinc-800 px-3 py-1 rounded-lg flex items-center gap-1">
                        <span>Sosyal Hayat</span>
                        <Stars value={review.geceHayati} />
                      </div>

                      <div className="bg-zinc-800 px-3 py-1 rounded-lg flex items-center gap-1">
                        <span>Kültür</span>
                        <Stars value={review.kultur} />
                      </div>

                      <div className="bg-zinc-800 px-3 py-1 rounded-lg flex items-center gap-1">
                        <span>Gastronomi</span>
                        <Stars value={review.gastronomi} />
                      </div>

                      <div className="bg-zinc-800 px-3 py-1 rounded-lg flex items-center gap-1">
                        <span>Ulaşım</span>
                        <Stars value={review.ulasim} />
                      </div>

                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

  );

}