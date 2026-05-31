"use client"
import { Bell, Search, Calendar, LogOut } from "lucide-react"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"

export default function Header() {
  const router = useRouter()
  const [userInitial, setUserInitial] = useState("")
  const [currentDate, setCurrentDate] = useState("")
  
  // Estados para controlar os menus flutuantes
  const [showNotifications, setShowNotifications] = useState(false)
  const [showCalendar, setShowCalendar] = useState(false)

  useEffect(() => {
    // 1. Gerar a data atual
    const date = new Date()
    const formattedDate = date.toLocaleDateString('en-US', {
      weekday: 'short', day: 'numeric', month: 'short', year: 'numeric'
    })
    setCurrentDate(formattedDate)

    // 2. Buscar a inicial do utilizador
    const token = sessionStorage.getItem("token")
    if (token) {
      try {
        const payloadDecoded = JSON.parse(atob(token.split(".")[1]))
        const namePart = payloadDecoded.sub.split("@")[0]
        setUserInitial(namePart.charAt(0).toUpperCase())
      } catch (error) {
        setUserInitial("U")
      }
    }
  }, [])

  function handleLogout() {
    sessionStorage.removeItem("token")
    router.push("/login")
  }

  // Funções para abrir um menu e fechar o outro automaticamente
  function toggleNotifications() {
    setShowNotifications(!showNotifications)
    setShowCalendar(false)
  }

  function toggleCalendar() {
    setShowCalendar(!showCalendar)
    setShowNotifications(false)
  }

  return (
    <header className="h-20 border-b border-zinc-800/50 bg-[#0a0a0a] flex items-center justify-between px-8 text-white sticky top-0 z-10">
      
      {/* Search Input (ATUALIZADO COM O ALERTA) */}
      <div className="flex items-center bg-zinc-900/50 border border-zinc-800 rounded-full px-4 py-2.5 w-80 focus-within:border-zinc-600 transition-colors">
        <Search size={16} className="text-zinc-500 mr-3" />
        <input
          type="text"
          placeholder="Search..."
          className="bg-transparent border-none outline-none w-full text-sm text-white placeholder:text-zinc-500"
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              alert(`Pesquisa por "${e.currentTarget.value}" em desenvolvimento para a Versão 2.0!`)
              e.currentTarget.value = "" // Limpa a barra depois do enter
            }
          }}
        />
      </div>

      {/* Right Actions */}
      <div className="flex items-center gap-4">
        
        {/* Data Atual */}
        <div className="hidden md:flex items-center bg-zinc-900/50 border border-zinc-800 px-4 py-2 rounded-full">
          <span className="text-sm text-zinc-400 font-medium">{currentDate}</span>
        </div>

        {/* Botão Calendário com Dropdown */}
        <div className="relative">
          <button 
            onClick={toggleCalendar}
            className="p-2.5 bg-zinc-900/50 border border-zinc-800 rounded-full text-zinc-400 hover:text-white transition-colors"
          >
            <Calendar size={18} />
          </button>

          {showCalendar && (
            <div className="absolute right-0 mt-3 w-64 bg-[#121212] border border-zinc-800 rounded-xl shadow-2xl p-4 z-50">
              <div className="flex justify-between items-center mb-4 border-b border-zinc-800 pb-2">
                <h3 className="font-semibold text-sm">Agenda de Hoje</h3>
                <span 
                  className="text-xs text-zinc-500 hover:text-white cursor-pointer transition-colors"
                  onClick={() => setShowCalendar(false)}
                >
                  Fechar
                </span>
              </div>
              <div className="py-6 flex flex-col items-center justify-center text-center">
                <Calendar size={32} className="text-zinc-700 mb-2" />
                <p className="text-sm text-zinc-400">Nenhum evento marcado para hoje.</p>
              </div>
            </div>
          )}
        </div>

        {/* Botão Sino com Dropdown */}
        <div className="relative">
          <button 
            onClick={toggleNotifications}
            className="p-2.5 bg-zinc-900/50 border border-zinc-800 rounded-full text-zinc-400 hover:text-white transition-colors relative"
          >
            <Bell size={18} />
            <span className="absolute top-2 right-2.5 bg-red-500 w-2 h-2 rounded-full border-2 border-[#0a0a0a]"></span>
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-3 w-80 bg-[#121212] border border-zinc-800 rounded-xl shadow-2xl overflow-hidden z-50">
              <div className="p-4 border-b border-zinc-800 flex justify-between items-center bg-zinc-900/30">
                <h3 className="font-semibold text-sm">Notificações</h3>
                <span 
                  className="text-xs text-zinc-500 hover:text-white cursor-pointer transition-colors"
                  onClick={() => setShowNotifications(false)}
                >
                  Fechar
                </span>
              </div>
              <div className="max-h-80 overflow-y-auto">
                <div className="p-4 border-b border-zinc-800/50 hover:bg-zinc-800/30 transition-colors cursor-pointer">
                  <p className="text-sm text-zinc-300">🎉 <strong className="text-white">Bem-vindo ao sistema!</strong> A sua conta de administrador foi configurada.</p>
                  <span className="text-xs text-zinc-500 mt-2 block">Hoje, 09:00</span>
                </div>
                <div className="p-4 hover:bg-zinc-800/30 transition-colors cursor-pointer">
                  <p className="text-sm text-zinc-300">📈 <strong className="text-white">Relatório:</strong> Os seus gráficos foram atualizados com sucesso.</p>
                  <span className="text-xs text-zinc-500 mt-2 block">Ontem, 14:30</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Perfil e Logout */}
        <div className="flex items-center gap-3 pl-2">
          <div className="w-9 h-9 bg-orange-500 rounded-full flex items-center justify-center font-bold text-sm text-white shadow-md">
            {userInitial || "A"}
          </div>
          <button 
            onClick={handleLogout}
            title="Sair do sistema"
            className="text-zinc-600 hover:text-red-500 transition-colors ml-1"
          >
            <LogOut size={18} />
          </button>
        </div>

      </div>
    </header>
  )
}