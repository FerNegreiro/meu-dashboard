"use client"
import { useState } from "react"
import { useRouter } from "next/navigation"

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setError("")
    setLoading(true)

    try {
      // SALVA-VIDAS: Se o .env estiver vazio ou falhar, usa o endereço direto do teu backend
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"
      
      const response = await fetch(`${apiUrl}/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.detail || "Erro ao realizar o login.")
        setLoading(false)
        return
      }

      // Guardar a sessão temporária (A tua alteração foi perfeita e mantida aqui!)
      sessionStorage.setItem("token", data.access_token)
      
      router.push("/")
    } catch (err) {
      // Isto vai imprimir o erro real escondido no teu navegador caso volte a falhar
      console.error("🔎 O ERRO VERDADEIRO É:", err) 
      setError("Não foi possível estabelecer ligação com o servidor.")
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-[#0a0a0a] flex items-center justify-center text-white px-4">
      <div className="w-full max-w-md bg-zinc-900/50 border border-zinc-800 rounded-2xl p-8 shadow-2xl">
        <h1 className="text-3xl font-bold text-orange-500 text-center mb-2">
          Metric Flow
        </h1>
        <p className="text-zinc-400 text-center text-sm mb-8">
          Insira as suas credenciais para aceder à plataforma
        </p>

        {error && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-xl mb-6 text-sm text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="flex flex-col gap-4">
          <div>
            <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">
              E-mail
            </label>
            <input
              type="email"
              placeholder="exemplo@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full bg-zinc-950 border border-zinc-800 p-4 rounded-xl text-white outline-none focus:border-orange-500 transition-colors placeholder:text-zinc-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">
              Palavra-passe
            </label>
            <input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full bg-zinc-950 border border-zinc-800 p-4 rounded-xl text-white outline-none focus:border-orange-500 transition-colors placeholder:text-zinc-500"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-orange-500 hover:bg-orange-600 disabled:bg-orange-500/50 text-white font-bold p-4 rounded-xl transition-all mt-4 shadow-lg shadow-orange-500/10"
          >
            {loading ? "A autenticar..." : "Entrar no Sistema"}
          </button>
        </form>
      </div>
    </main>
  )
}