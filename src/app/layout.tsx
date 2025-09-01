import "@/app/globals.css"
import { VT323 } from "next/font/google"
import type React from "react" 

// VT323 only provides a single 400 weight
const vt323 = VT323({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-vt323",
})

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={vt323.variable}>
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Roboto+Mono:wght@400;500;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className={vt323.className}>
      
          {children}
       
      </body>
    </html>
  )
} 
