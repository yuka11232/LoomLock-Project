import type { Metadata, Viewport } from "next";
import { Fraunces, Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";

/**
 * Fonts: an editorial serif for headings, a plain interface face for everything
 * else. Both carry latin-ext, which is what Azerbaijani needs for ə, ğ, ı, ş.
 */
const fraunces = Fraunces({
  subsets: ["latin", "latin-ext"],
  variable: "--font-fraunces",
  display: "swap",
  axes: ["SOFT", "WONK"],
});

const inter = Inter({
  subsets: ["latin", "latin-ext"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "LoomLock — a shared workspace for artisan families",
    template: "%s · LoomLock",
  },
  description:
    "LoomLock helps artisans and younger family members create products, prepare social media content, organise orders, and learn how to grow a small business together.",
  applicationName: "LoomLock",
};

export const viewport: Viewport = {
  themeColor: "#fbf7f1",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${fraunces.variable} ${inter.variable}`}>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
