
import type { Metadata } from 'next';
import './globals.css';
import 'quill/dist/quill.snow.css';
import 'katex/dist/katex.min.css';
import { Toaster } from '@/components/ui/toaster';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { cn } from '@/lib/utils';
import { FloatingSettings } from '@/components/FloatingSettings';
import { Providers } from '@/components/Providers';

export const metadata: Metadata = {
  title: 'AP Ace©',
  description: 'Ace Your APs with AI-powered tools and comprehensive study guides.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="!scroll-smooth" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;700&family=Space+Grotesk:wght@500;700&display=swap" rel="stylesheet" />
      </head>
      <body className={cn("font-body antialiased")}>
        <Providers>
          <div className="flex min-h-screen flex-col">
            <Header />
            <main className="flex-1">{children}</main>
            <Footer />
          </div>
          <Toaster />
          <FloatingSettings />
        </Providers>
      </body>
    </html>
  );
}
