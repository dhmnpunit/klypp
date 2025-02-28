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
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator) {
                navigator.serviceWorker.register('/firebase-messaging-sw.js')
                  .then(function(registration) {
                    console.log('Service Worker registered with scope:', registration.scope);
                  })
                  .catch(function(error) {
                    console.error('Service Worker registration failed:', error);
                  });
              }
            `,
          }}
        />
      </head>
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
