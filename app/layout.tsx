"use client"
import "./globals.css"
import { Inter } from "next/font/google"
import Sidebar from "../components/Sidebar"
import Header from "../components/Header"
import { usePathname } from "next/navigation"

const inter = Inter({ subsets: ["latin"] })

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  
  const isLoginPage = pathname?.includes("/login")

  return (
    <html lang="pt-br">
      <head>
        {/* Aqui definimos o nome que vai aparecer na aba do teu navegador */}
        <title>Metric Flow | Dashboard</title>
        <meta name="description" content="Plataforma analítica e gestão de dados" />
      </head>
      <body className={`${inter.className} bg-[#0a0a0a] text-white antialiased`}>
        {isLoginPage ? (
          <main className="min-h-screen flex items-center justify-center bg-[#0a0a0a]">
            {children}
          </main>
        ) : (
          <div className="flex min-h-screen">
            <Sidebar />
            <div className="flex-1 flex flex-col">
              <Header />
              <main className="flex-1 p-8 overflow-y-auto">
                {children}
              </main>
            </div>
          </div>
        )}
      </body>
    </html>
  )
}