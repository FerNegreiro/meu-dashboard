"use client"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { LayoutDashboard, ShoppingCart, Users, PieChart, Settings } from "lucide-react"
import { useEffect, useState } from "react"

export default function Sidebar() {
  const pathname = usePathname()
  const [companyName, setCompanyName] = useState("A carregar...")

  useEffect(() => {
    async function loadSettings() {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/settings`)
        if (response.ok) {
          const data = await response.json()
          setCompanyName(data.company_name)
        }
      } catch (error) {
        setCompanyName("Meu SaaS")
      }
    }
    loadSettings()
  }, [])

  const menuItems = [
    { name: "Dashboard", icon: LayoutDashboard, path: "/" },
    { name: "Orders", icon: ShoppingCart, path: "/orders" },
    { name: "Customers", icon: Users, path: "/customers" },
    { name: "Analytics", icon: PieChart, path: "/analytics" },
    { name: "Settings", icon: Settings, path: "/settings" },
  ]

  return (
    <aside className="w-64 bg-black border-r border-zinc-800 flex flex-col h-screen sticky top-0">
      {/* LOGO DINÂMICA AQUI */}
      <div className="h-20 flex items-center px-8 border-b border-zinc-800">
        <h1 className="text-orange-500 font-bold text-xl tracking-wide truncate">
          {companyName}
        </h1>
      </div>

      <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
        {menuItems.map((item) => {
          const isActive = pathname === item.path
          return (
            <Link
              key={item.name}
              href={item.path}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                isActive
                  ? "bg-orange-500/10 text-orange-500 font-semibold"
                  : "text-zinc-400 hover:bg-zinc-900 hover:text-white"
              }`}
            >
              <item.icon size={20} />
              <span>{item.name}</span>
            </Link>
          )
        })}
      </nav>
    </aside>
  )
}