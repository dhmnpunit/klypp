import { Inter } from "next/font/google";
import "./globals.css";
import BottomNav from "./components/BottomNav";
import { Toaster } from "sonner";
import { NotificationProvider } from './contexts/NotificationContext';
import { Providers } from "./providers";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Klypp",
  description: "Split your subscriptions with friends",
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
          <NotificationProvider>
            {children}
            <BottomNav />
            <Toaster richColors position="top-center" />
          </NotificationProvider>
        </Providers>
      </body>
    </html>
  );
}
