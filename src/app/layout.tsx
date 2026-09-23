import type { Metadata } from "next";
import { Georama, Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";

// Georama: tipografía institucional oficial del INTT
const georama = Georama({
  variable: "--font-intt",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "INTT · Visión Cero · Encuesta de Siniestros de Motocicletas",
  description: "Encuesta interactiva del Instituto Nacional de Tránsito y Transporte (INTT) con preguntas adaptadas al tipo de conductor y dashboard de resultados para avanzar hacia una Visión Cero en siniestros de motocicletas.",
  keywords: ["INTT", "visión cero", "motocicletas", "siniestros", "encuesta vial", "seguridad vial", "dashboard", "tránsito", "transporte"],
  authors: [{ name: "Instituto Nacional de Tránsito y Transporte" }],
  icons: {
    icon: "https://z-cdn.chatglm.cn/z-ai/static/logo.svg",
  },
  openGraph: {
    title: "INTT · Visión Cero · Encuesta de Motocicletas",
    description: "Encuesta interactiva con dashboard de resultados.",
    url: "https://chat.z.ai",
    siteName: "INTT · Visión Cero",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "INTT · Visión Cero · Encuesta de Motocicletas",
    description: "Encuesta interactiva con dashboard de resultados.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body
        className={`${georama.variable} ${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
        style={{ fontFamily: "var(--font-intt), var(--font-geist-sans), Georama, Helvetica, Arial, sans-serif" }}
      >
        {children}
        <Toaster />
      </body>
    </html>
  );
}
