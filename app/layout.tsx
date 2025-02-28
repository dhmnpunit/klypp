import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";
import BottomNav from "./components/BottomNav";
import { Toaster } from "sonner";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Klypp - Subscription Manager",
  description: "Manage your subscriptions and split costs with friends",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="light">
      <body className={inter.className}>
        <Providers>
          {children}
          <BottomNav />
          <Toaster richColors position="top-center" />
        </Providers>
      </body>
    </html>
  );
}
