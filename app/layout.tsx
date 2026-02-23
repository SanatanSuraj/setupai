import type { Metadata } from "next";
import { Providers } from "@/components/providers";
import "./globals.css";

export const metadata: Metadata = {
  title: "SetupAI – Diagnostic Lab & Clinic Setup Platform",
  description:
    "AI-powered roadmap, compliance tracking, equipment planning & financial modeling for Indian diagnostic labs and clinics.",
  openGraph: {
    title: "SetupAI – Diagnostic Lab & Clinic Setup Platform",
    description:
      "AI-powered roadmap, compliance tracking, equipment planning & financial modeling for Indian diagnostic labs and clinics.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
