import type { Metadata } from "next";
import { Geist, Geist_Mono, Oxygen, Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "./Providers";
const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const oxygen = Oxygen({
  weight: ["300", "400", "700"],
  variable: "--font-oxygen",
  subsets: ["latin"],
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "Ratehonk Email Marketing",
  description: "Ratehonk Email Marketing is a powerful email marketing tool that helps you send personalized emails to your customers and track their engagement. Get started today and see the difference it can make for your business!",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} ${oxygen.variable} ${inter.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
