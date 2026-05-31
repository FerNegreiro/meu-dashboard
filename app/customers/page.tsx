"use client"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"

export default function CustomersPage() {
  const router = useRouter()
  const [customers, setCustomers] = useState([])
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [plan, setPlan] = useState("Basic")
  const [editingId, setEditingId] = useState<number | null>(null)
  const [error, setError] = useState("")

  // Carregar clientes da API
  async function loadCustomers() {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/customers`)
      if (response.ok) {
        const data = await response.json()
        setCustomers(data)
      }
    } catch (err) {
      console.error("Erro ao carregar clientes:", err)
    }
  }

  useEffect(() => {
    const token = sessionStorage.getItem("token")
    if (!token) {
      router.push("/login")
      return
    }
    loadCustomers()
  }, [])

  // Criar Cliente
  async function createCustomer(e: React.FormEvent) {
    e.preventDefault()
    setError("")
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/customers`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, plan }),
      })
      
      if (response.ok) {
        resetForm()
        loadCustomers()
      } else {
        const data = await response.json()
        setError(data.detail || "Erro ao criar cliente")
      }
    } catch (err) {
      setError("Erro de conexão com o servidor")
    }
  }

  // Atualizar Cliente
  async function updateCustomer(e: React.FormEvent) {
    e.preventDefault()
    setError("")
    if (!editingId) return
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/customers/${editingId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, plan }),
      })
      if (response.ok) {
        resetForm()
        loadCustomers()
      } else {
        const data = await response.json()
        setError(data.detail || "Erro ao atualizar cliente")
      }
    } catch (err) {
      setError("Erro de conexão com o servidor")
    }
  }

  // Eliminar Cliente
  async function deleteCustomer(id: number) {
    if (!confirm("Deseja mesmo remover este cliente?")) return
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/customers/${id}`, {
        method: "DELETE",
      })
      if (response.ok) {
        loadCustomers()
      }
    } catch (err) {
      console.error("Erro ao eliminar cliente:", err)
    }
  }

  function startEdit(customer: any) {
    setEditingId(customer.id)
    setName(customer.name)
    setEmail(customer.email)
    setPlan(customer.plan)
  }

  function resetForm() {
    setName("")
    setEmail("")
    setPlan("Basic")
    setEditingId(null)
    setError("")
  }

  return (
    <main className="min-h-screen bg-black text-white p-8">
      <div className="flex items-center justify-between mb-10">
        <h1 className="text-3xl font-bold">Customers</h1>
      </div>

      {/* FORMULÁRIO DE CLIENTES */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 mb-10">
        <h2 className="text-2xl font-bold mb-6">
          {editingId ? "Editar Cliente" : "Novo Cliente"}
        </h2>
        
        {error && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-xl mb-4 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={editingId ? updateCustomer : createCustomer}>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <input
              type="text"
              placeholder="Nome"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="bg-zinc-800 border border-zinc-700 p-4 rounded-xl text-white outline-none focus:border-orange-500 transition-colors"
            />
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="bg-zinc-800 border border-zinc-700 p-4 rounded-xl text-white outline-none focus:border-orange-500 transition-colors"
            />
            <select
              value={plan}
              onChange={(e) => setPlan(e.target.value)}
              className="bg-zinc-800 border border-zinc-700 p-4 rounded-xl text-white outline-none focus:border-orange-500 transition-colors appearance-none"
            >
              <option value="Basic">Basic</option>
              <option value="Premium">Premium</option>
              <option value="Enterprise">Enterprise</option>
            </select>
          </div>
          <div className="flex gap-4">
            <button
              type="submit"
              className="bg-orange-500 hover:bg-orange-600 px-6 py-3 rounded-xl font-bold transition-all"
            >
              {editingId ? "Salvar Alterações" : "Adicionar Cliente"}
            </button>
            {editingId && (
              <button
                type="button"
                onClick={resetForm}
                className="bg-zinc-700 hover:bg-zinc-600 px-6 py-3 rounded-xl transition-all"
              >
                Cancelar
              </button>
            )}
          </div>
        </form>
      </div>

      {/* LISTA DE CLIENTES */}
      <div className="bg-zinc-900 rounded-2xl p-6 border border-zinc-800">
        {customers.length === 0 ? (
          <p className="text-zinc-400">Nenhum cliente registado na API...</p>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b border-zinc-800 text-zinc-400">
                <th className="text-left py-4">Nome</th>
                <th className="text-left py-4">Email</th>
                <th className="text-left py-4">Plano</th>
                <th className="text-center py-4">Ações</th>
              </tr>
            </thead>
            <tbody>
              {customers.map((customer: any) => (
                <tr key={customer.id} className="border-b border-zinc-800">
                  <td className="py-4 font-semibold">{customer.name}</td>
                  <td className="text-zinc-300">{customer.email}</td>
                  <td>
                    <span className="bg-orange-500/20 text-orange-400 px-3 py-1 rounded-full text-sm font-medium">
                      {customer.plan}
                    </span>
                  </td>
                  <td className="py-4">
                    <div className="flex justify-center gap-3">
                      <button
                        onClick={() => startEdit(customer)}
                        className="bg-blue-500 hover:bg-blue-600 px-4 py-1.5 rounded-xl text-sm font-bold transition-colors"
                      >
                        Editar
                      </button>
                      <button
                        onClick={() => deleteCustomer(customer.id)}
                        className="bg-red-500 hover:bg-red-600 px-4 py-1.5 rounded-xl text-sm font-bold transition-colors"
                      >
                        Eliminar
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </main>
  )
}