import "@/app/globals.css"
import { VT323, Roboto_Mono } from "next/font/google"
import type React from "react" 
import { Providers } from "@/components/providers"

// VT323 only provides a single 400 weight
const vt323 = VT323({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-vt323",
})

const robotoMono = Roboto_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  variable: "--font-roboto-mono",
})

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={`${vt323.variable} ${robotoMono.variable}`}>
      <body className={vt323.className}>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  )
} 
