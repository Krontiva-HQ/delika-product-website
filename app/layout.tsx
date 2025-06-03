import type { Metadata } from "next";
import { Rubik } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster"
import Script from "next/script"

const rubik = Rubik({
  subsets: ["latin"],
  variable: "--font-rubik",
  weight: ["300", "400", "500", "600", "700", "800", "900"],
});

export const metadata: Metadata = {
  title: "Delika - Built for restaurants",
  description: "Delika - Built for restaurants",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${rubik.variable} antialiased font-rubik`}>
        {children}
        <Toaster />
        <Script
          src="https://js.paystack.co/v1/inline.js"
          strategy="beforeInteractive"
        />
      </body>
    </html>
  );
}
