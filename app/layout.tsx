import "./globals.css";
import Navbar from "@/components/Navbar";
import Providers from "./providers";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="tr">
      <body className="bg-gray-100 dark:bg-gray-900 transition-colors duration-300 overflow-x-hidden">
        <Providers>
          <Navbar />

          <main className="min-h-screen">
            {children}
          </main>
        </Providers>
      </body>
    </html>
  );
}