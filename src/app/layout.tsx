import "@/app/globals.css"
import { VT323, Roboto_Mono } from "next/font/google"
import type React from "react" 

// VT323 only provides a single 400 weight
const vt323 = VT323({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-vt323",
})

// Add a complementary monospace font with multiple weights
const robotoMono = Roboto_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  variable: "--font-roboto-mono",
  display: "swap",
})

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={`${vt323.variable} ${robotoMono.variable}`}>
      <body className={vt323.className}>{children}</body>
    </html>
  )
} 
