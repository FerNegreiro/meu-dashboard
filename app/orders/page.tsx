"use client"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"

export default function OrdersPage() {
  const router = useRouter()
  const [orders, setOrders] = useState([])
  const [customer, setCustomer] = useState("")
  const [product, setProduct] = useState("")
  const [price, setPrice] = useState("")
  const [status, setStatus] = useState("Pendente")
  const [editingId, setEditingId] = useState<number | null>(null)

  async function loadOrders() {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/orders`)
      if (response.ok) {
        const data = await response.json()
        setOrders(data)
      }
    } catch (error) {
      console.error("Erro ao carregar os pedidos:", error)
    }
  }

  useEffect(() => {
    const token = sessionStorage.getItem("token")
    if (!token) {
      router.push("/login")
      return
    }
    loadOrders()
  }, [])

  async function createOrder(e: React.FormEvent) {
    e.preventDefault()
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/orders`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ customer, product, price, status }),
      })
      if (response.ok) {
        resetForm()
        loadOrders()
      }
    } catch (error) {
      console.error("Erro ao criar pedido:", error)
    }
  }

  async function updateOrder(e: React.FormEvent) {
    e.preventDefault()
    if (!editingId) return
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/orders/${editingId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ customer, product, price, status }),
      })
      if (response.ok) {
        resetForm()
        loadOrders()
      }
    } catch (error) {
      console.error("Erro ao atualizar pedido:", error)
    }
  }

  async function deleteOrder(id: number) {
    if (!confirm("Tem a certeza que deseja eliminar este pedido?")) return
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/orders/${id}`, {
        method: "DELETE",
      })
      if (response.ok) {
        loadOrders()
      }
    } catch (error) {
      console.error("Erro ao eliminar pedido:", error)
    }
  }

  function startEdit(order: any) {
    setEditingId(order.id)
    setCustomer(order.customer)
    setProduct(order.product)
    setPrice(order.price)
    setStatus(order.status)
  }

  function resetForm() {
    setCustomer("")
    setProduct("")
    setPrice("")
    setStatus("Pendente")
    setEditingId(null)
  }

  // Função para cores dinâmicas
  const getStatusColor = (s: string) => {
    switch (s) {
      case "Pendente": return "bg-yellow-500/20 text-yellow-400"
      case "Processando": return "bg-blue-500/20 text-blue-400"
      case "Enviado": return "bg-purple-500/20 text-purple-400"
      case "Entregue": return "bg-green-500/20 text-green-400"
      case "Cancelado": return "bg-red-500/20 text-red-400"
      default: return "bg-zinc-500/20 text-zinc-400"
    }
  }

  return (
    <main className="min-h-screen bg-[#0a0a0a] text-white p-8">
      <h1 className="text-3xl font-bold mb-10">Orders</h1>

      <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-6 mb-10">
        <h2 className="text-xl font-bold mb-6">{editingId ? "Editar Pedido" : "Novo Pedido"}</h2>
        <form onSubmit={editingId ? updateOrder : createOrder} className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <input type="text" placeholder="Cliente" value={customer} onChange={(e) => setCustomer(e.target.value)} required className="bg-zinc-950 border border-zinc-800 p-3 rounded-xl outline-none focus:border-orange-500" />
          <input type="text" placeholder="Produto" value={product} onChange={(e) => setProduct(e.target.value)} required className="bg-zinc-950 border border-zinc-800 p-3 rounded-xl outline-none focus:border-orange-500" />
          <input type="text" placeholder="Preço" value={price} onChange={(e) => setPrice(e.target.value)} required className="bg-zinc-950 border border-zinc-800 p-3 rounded-xl outline-none focus:border-orange-500" />
          <select value={status} onChange={(e) => setStatus(e.target.value)} className="bg-zinc-950 border border-zinc-800 p-3 rounded-xl outline-none focus:border-orange-500">
            <option>Pendente</option>
            <option>Processando</option>
            <option>Enviado</option>
            <option>Entregue</option>
            <option>Cancelado</option>
          </select>
          <div className="md:col-span-4 flex gap-4 mt-2">
            <button type="submit" className="bg-orange-500 hover:bg-orange-600 px-6 py-2 rounded-xl font-bold">{editingId ? "Salvar" : "Criar"}</button>
            {editingId && <button type="button" onClick={resetForm} className="bg-zinc-800 px-6 py-2 rounded-xl">Cancelar</button>}
          </div>
        </form>
      </div>

      <div className="bg-zinc-900/50 rounded-2xl p-6 border border-zinc-800">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-zinc-500 border-b border-zinc-800">
              <th className="text-left py-4">Cliente</th>
              <th className="text-left py-4">Produto</th>
              <th className="text-left py-4">Valor</th>
              <th className="text-left py-4">Status</th>
              <th className="text-center py-4">Ações</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order: any) => (
              <tr key={order.id} className="border-b border-zinc-800/50">
                <td className="py-4">{order.customer}</td>
                <td className="py-4">{order.product}</td>
                <td className="py-4 font-bold text-orange-500">{order.price}</td>
                <td className="py-4">
                  <span className={`px-3 py-1 rounded-full font-medium ${getStatusColor(order.status)}`}>{order.status}</span>
                </td>
                <td className="py-4 text-center">
                  <button onClick={() => startEdit(order)} className="text-blue-400 hover:underline mr-4">Editar</button>
                  <button onClick={() => deleteOrder(order.id)} className="text-red-400 hover:underline">Eliminar</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </main>
  )
}