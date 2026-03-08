"use client";

import { useSession, signOut } from "next-auth/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useRef, useEffect } from "react";
import { usePathname } from "next/navigation";

export default function Navbar() {
  const router = useRouter();
  const profileRef = useRef<HTMLDivElement>(null);
  const [search, setSearch] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const { data: session } = useSession();
  const pathname = usePathname();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!search) return;
    router.push(`/c/${search.toLowerCase().replace(/\s+/g, "-")}`);
    setSearch("");
  };

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setProfileOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  useEffect(() => {
    setProfileOpen(false);
  }, [pathname]);

  return (
    <header className="fixed top-0 left-0 w-full z-50">
      <div className="backdrop-blur-xl bg-white/60 dark:bg-neutral-900/60 border-b border-neutral-200/60 dark:border-neutral-700/60 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">

          {/* Logo */}
          <Link
            href="/"
            className="text-2xl font-bold tracking-tight hover:opacity-80 transition"
          >
            🌍 Erasmus<span className="text-neutral-500">Map</span>
          </Link>

          {/* Desktop Search */}
          <form
            onSubmit={handleSearch}
            className="hidden md:flex flex-1 mx-10 max-w-xl"
          >
            <input
              type="text"
              placeholder="Şehir ara..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full px-5 py-2.5 rounded-full bg-neutral-100 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white transition"
            />
          </form>

          {/* Right Side */}
          <div className="flex items-center gap-4">

            {/* Desktop Profile */}
            <div ref={profileRef} className="relative hidden md:block">
              {!session ? (
                <Link
                  href="/login"
                  className="px-4 py-2 bg-black text-white rounded-full text-sm"
                >
                  Giriş Yap
                </Link>
              ) : (
                <button
                  onClick={() => setProfileOpen(!profileOpen)}
                  className="w-10 h-10 rounded-full overflow-hidden border border-neutral-300"
                >
                  {session.user?.image ? (
                    <img
                      src={session.user.image}
                      alt="profile"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="bg-black text-white w-full h-full flex items-center justify-center">
                      {session.user?.name?.charAt(0)}
                    </span>
                  )}
                </button>
              )}

              {profileOpen && session && (
                <div className="absolute right-0 mt-3 w-48 bg-white dark:bg-neutral-800 shadow-xl rounded-2xl border border-neutral-200 dark:border-neutral-700 overflow-hidden animate-fadeIn">
                  <Link
                    href={session?.user?.username ? `/u/${session.user.username}` : "#"}
                    onClick={(e) => {
                      if (!session?.user?.username) {
                        e.preventDefault();
                      }
                    }}
                    className="block px-5 py-3 hover:bg-neutral-100 dark:hover:bg-neutral-700 transition"
                  >
                    Profil
                  </Link>

                  <Link href="/settings" className="block px-5 py-3 hover:bg-neutral-100 dark:hover:bg-neutral-700 transition"
                  >
                    ⚙️ Ayarlar
                  </Link>
                  <button
                    onClick={() => signOut({ callbackUrl: "/" })}
                    className="w-full text-left px-5 py-3 hover:bg-neutral-100 dark:hover:bg-neutral-700 text-red-500 transition"
                  >
                    Çıkış Yap
                  </button>
                </div>
              )}
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="md:hidden text-2xl hover:scale-110 transition"
            >
              ☰
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {menuOpen && (
          <div className="md:hidden px-6 pb-6 space-y-4 animate-fadeIn">
            <form onSubmit={handleSearch}>
              <input
                type="text"
                placeholder="Search city..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full px-5 py-3 rounded-xl bg-neutral-100 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700"
              />
            </form>

            <Link
              href={session?.user?.username ? `/u/${session.user.username}` : "#"}
              onClick={() => setProfileOpen(false)}
              className="block text-center px-5 py-3 rounded-xl bg-black text-white"
            >
              Profil
            </Link>
          </div>
        )}
      </div>
    </header>
  );
}