import '~/styles/globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { ThemeProvider } from "~/components/theme-provider";
import { SessionProvider } from "next-auth/react";
import Script from 'next/script'

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Neura - AI-Powered Assistant',
  description: 'An AI assistant that helps you stay organized and productive.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <Script src="https://unpkg.com/react-scan/dist/auto.global.js" />
      </head>
      <body className={inter.className}>
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          <SessionProvider>
            {children}
          </SessionProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}