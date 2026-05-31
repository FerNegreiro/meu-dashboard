"use client"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"

export default function SettingsPage() {
  const router = useRouter()
  const [companyName, setCompanyName] = useState("")
  const [supportEmail, setSupportEmail] = useState("")
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState("")

  useEffect(() => {
    // 1. Trava de Segurança (Bloqueia acessos sem token)
    const token = sessionStorage.getItem("token")
    if (!token) {
      router.push("/login")
      return
    }

    // 2. Carregar configurações salvas na base de dados
    async function loadSettings() {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/settings`)
        if (response.ok) {
          const data = await response.json()
          setCompanyName(data.company_name)
          setSupportEmail(data.support_email)
        }
      } catch (err) {
        console.error("Erro ao carregar configurações:", err)
      }
    }

    loadSettings()
  }, [router])

  // 3. Salvar alterações na API
  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setMessage("")

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/settings`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          company_name: companyName,
          support_email: supportEmail,
        }),
      })

      if (response.ok) {
        setMessage("Configurações atualizadas com sucesso! 🎉")
      } else {
        setMessage("Erro ao salvar as configurações.")
      }
    } catch (err) {
      setMessage("Erro de conexão com o servidor.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-black text-white p-8">
      <div className="flex items-center justify-between mb-10">
        <h1 className="text-3xl font-bold">Settings</h1>
      </div>

      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-8 max-w-2xl shadow-xl">
        <h2 className="text-xl font-semibold mb-2">Informações da Plataforma</h2>
        <p className="text-sm text-zinc-400 mb-6">Atualize os dados gerais de exibição do seu SaaS.</p>

        {message && (
          <div className={`p-4 rounded-xl mb-6 text-sm text-center font-medium ${
            message.includes("sucesso") ? "bg-orange-500/10 border border-orange-500/20 text-orange-400" : "bg-red-500/10 border border-red-500/20 text-red-400"
          }`}>
            {message}
          </div>
        )}

        <form onSubmit={handleSave} className="space-y-6">
          <div>
            <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">
              Nome da Empresa / SaaS
            </label>
            <input
              type="text"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              required
              className="w-full bg-zinc-800 border border-zinc-700 p-4 rounded-xl text-white outline-none focus:border-orange-500 transition-colors"
              placeholder="Ex: Metric Flow"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">
              E-mail de Suporte Comercial
            </label>
            <input
              type="email"
              value={supportEmail}
              onChange={(e) => setSupportEmail(e.target.value)}
              required
              className="w-full bg-zinc-800 border border-zinc-700 p-4 rounded-xl text-white outline-none focus:border-orange-500 transition-colors"
              placeholder="Ex: contato@empresa.com"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="bg-orange-500 hover:bg-orange-600 disabled:bg-orange-500/50 px-6 py-3 rounded-xl font-bold transition-all shadow-lg shadow-orange-500/5"
          >
            {loading ? "A guardar..." : "Salvar Alterações"}
          </button>
        </form>
      </div>
    </main>
  )
}