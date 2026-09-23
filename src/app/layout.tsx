import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Visión Cero · Encuesta de Siniestros de Motocicletas",
  description: "Encuesta interactiva con preguntas adaptadas al tipo de conductor y dashboard de resultados para avanzar hacia una Visión Cero en siniestros de motocicletas.",
  keywords: ["visión cero", "motocicletas", "siniestros", "encuesta vial", "seguridad vial", "dashboard"],
  authors: [{ name: "Visión Cero" }],
  icons: {
    icon: "https://z-cdn.chatglm.cn/z-ai/static/logo.svg",
  },
  openGraph: {
    title: "Visión Cero · Encuesta de Motocicletas",
    description: "Encuesta interactiva con dashboard de resultados.",
    url: "https://chat.z.ai",
    siteName: "Visión Cero",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Visión Cero · Encuesta de Motocicletas",
    description: "Encuesta interactiva con dashboard de resultados.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        {children}
        <Toaster />
      </body>
    </html>
  );
}
