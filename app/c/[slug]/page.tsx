import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Map from "@/components/map/Map";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { latinize } from "@/lib/latinize";
import CityContent from "@/components/ui/CityContent";

export default async function CityPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  const city = await prisma.city.findUnique({
    where: { slug },
    include: {
      reviews: {
        include: { user: { select: { id: true, name: true, image: true, username: true } } },
        orderBy: { createdAt: "desc" },
      },
    },
  });

  const cities = await prisma.city.findMany({ select: { name: true, slug: true } });
  if (!city) notFound();

  const cityLatin = latinize(city.name);
  const session = await getServerSession(authOptions);

  const user = session?.user?.email
    ? await prisma.user.findUnique({ where: { email: session.user.email }, include: { visitedCities: true } })
    : null;

  const isVisited = user?.visitedCities.some((c) => c.id === city.id) ?? false;
  const cityId = city.id;

  async function submitReview(formData: FormData) {
    "use server";
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) throw new Error("Giriş yapmalısınız");
    const user = await prisma.user.findUnique({ where: { email: session.user.email } });
    if (!user) throw new Error("Kullanıcı bulunamadı");
    const existingReview = await prisma.review.findFirst({ where: { cityId, userId: user.id } });
    if (existingReview) throw new Error("Bu şehre zaten yorum yaptınız.");
    await prisma.review.create({
      data: {
        cityId, userId: user.id,
        kultur: Number(formData.get("kultur")),
        gastronomi: Number(formData.get("gastronomi")),
        guvenlik: Number(formData.get("guvenlik")),
        geceHayati: Number(formData.get("geceHayati")),
        ulasim: Number(formData.get("ulasim")),
        yasamMaliyeti: Number(formData.get("yasamMaliyeti")),
        content: String(formData.get("content")),
        isApproved: true,
      },
    });
    await prisma.user.update({ where: { id: user.id }, data: { visitedCities: { connect: { id: cityId } } } });
    revalidatePath(`/c/${slug}`);
  }

  const unsplashRes = await fetch(
    `https://api.unsplash.com/search/photos?query=${cityLatin}&orientation=landscape&per_page=1`,
    { headers: { Authorization: `Client-ID ${process.env.UNSPLASH_ACCESS_KEY}` }, next: { revalidate: 86400 } }
  );
  const unsplashData = await unsplashRes.json();
  const cityImage = unsplashData.results?.[0]?.urls?.regular || null;

  const ratingData = await prisma.review.aggregate({
    where: { cityId: city.id },
    _avg: { kultur: true, gastronomi: true, guvenlik: true, geceHayati: true, ulasim: true, yasamMaliyeti: true },
    _count: true,
  });

  const reviewCount = ratingData._count;
  const avgScore = reviewCount > 0
    ? ((ratingData._avg.kultur ?? 0) + (ratingData._avg.gastronomi ?? 0) + (ratingData._avg.guvenlik ?? 0) +
       (ratingData._avg.geceHayati ?? 0) + (ratingData._avg.ulasim ?? 0) + (ratingData._avg.yasamMaliyeti ?? 0)) / 6
    : 0;

  const kategori = {
    kultur:        Math.round(ratingData._avg.kultur ?? 0),
    gastronomi:    Math.round(ratingData._avg.gastronomi ?? 0),
    guvenlik:      Math.round(ratingData._avg.guvenlik ?? 0),
    geceHayati:    Math.round(ratingData._avg.geceHayati ?? 0),
    ulasim:        Math.round(ratingData._avg.ulasim ?? 0),
    yasamMaliyeti: Math.round(ratingData._avg.yasamMaliyeti ?? 0),
  };

  return (
    <div className="relative min-h-screen">
      <div className="fixed inset-0 -z-10">
        <Map cities={cities} isStatic />
      </div>
      <div className="relative z-10 bg-white/85 dark:bg-black/75 backdrop-blur-sm pt-16 min-h-screen">
        <CityContent
          cityId={city.id}
          cityName={cityLatin}
          cityImage={cityImage}
          isVisited={isVisited}
          reviewCount={reviewCount}
          avgScore={avgScore}
          kategori={kategori}
          reviews={city.reviews}
          submitReview={submitReview}
        />
      </div>
    </div>
  );
}
