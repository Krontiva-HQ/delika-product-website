import type { Metadata } from "next";
import { Rubik } from "next/font/google";
import "./globals.css";
import { OrderStatusWidget } from "@/components/order-status-widget";
import { Toaster } from "@/components/ui/toaster";
import Script from "next/script";
import { GoogleMapsProvider } from "@/components/google-maps-provider";

const rubik = Rubik({
  subsets: ["latin"],
  variable: "--font-rubik",
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
        <GoogleMapsProvider>
          {children}
          <OrderStatusWidget />
          <Toaster />
        </GoogleMapsProvider>
        <Script
          src="https://js.paystack.co/v1/inline.js"
          strategy="beforeInteractive"
        />
      </body>
    </html>
  );
}
