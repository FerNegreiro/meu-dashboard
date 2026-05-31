"use client"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { 
  PieChart, Pie, Cell, Tooltip as PieTooltip, Legend, 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as BarTooltip, ResponsiveContainer 
} from "recharts"

export default function AnalyticsPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [planosData, setPlanosData] = useState<any[]>([])
  const [statusData, setStatusData] = useState<any[]>([])

  useEffect(() => {
    
    const token = sessionStorage.getItem("token")
    if (!token) {
      router.push("/login")
      return
    }

    async function loadData() {
      try {
        // Buscar Clientes e Pedidos em simultâneo
        const [clientesRes, pedidosRes] = await Promise.all([
          fetch(`${process.env.NEXT_PUBLIC_API_URL}/customers`),
          fetch(`${process.env.NEXT_PUBLIC_API_URL}/orders`)
        ])

        if (clientesRes.ok && pedidosRes.ok) {
          const clientes = await clientesRes.json()
          const pedidos = await pedidosRes.json()

          // ==============================
          // PROCESSAR DADOS PARA GRÁFICO CIRCULAR (Planos)
          // ==============================
          const contagemPlanos = clientes.reduce((acc: any, cliente: any) => {
            const plano = cliente.plan || "Sem Plano"
            acc[plano] = (acc[plano] || 0) + 1
            return acc
          }, {})

          const planosFormatados = Object.keys(contagemPlanos).map(chave => ({
            name: chave,
            value: contagemPlanos[chave]
          }))
          setPlanosData(planosFormatados)

          // ==============================
          // PROCESSAR DADOS PARA GRÁFICO BARRAS (Status Pedidos)
          // ==============================
          const contagemStatus = pedidos.reduce((acc: any, pedido: any) => {
            const status = pedido.status || "Sem Status"
            acc[status] = (acc[status] || 0) + 1
            return acc
          }, {})

          const statusFormatados = Object.keys(contagemStatus).map(chave => ({
            name: chave,
            quantidade: contagemStatus[chave]
          }))
          setStatusData(statusFormatados)
        }
      } catch (error) {
        console.error("Erro ao carregar dados analíticos:", error)
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [router])

  // Cores bonitas para os gráficos (Padrão Dark Mode)
  const CORES_PIE = ["#f97316", "#3b82f6", "#10b981", "#8b5cf6"]

  return (
    <main className="min-h-screen bg-black text-white p-8">
      <div className="flex items-center justify-between mb-10">
        <div>
          <h1 className="text-3xl font-bold">Analytics</h1>
          <p className="text-zinc-400 mt-2">Visão geral e distribuição de dados do seu SaaS.</p>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64 text-zinc-500">
          A processar dados...
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          
          {/* GRÁFICO CIRCULAR: Distribuição de Planos */}
          <Card className="bg-zinc-900 border-zinc-800 text-white shadow-xl">
            <CardContent className="p-6">
              <h2 className="text-xl font-semibold mb-6 border-b border-zinc-800 pb-4">
                Distribuição de Planos (Clientes)
              </h2>
              <div className="h-[350px]">
                {planosData.length === 0 ? (
                  <div className="h-full flex items-center justify-center text-zinc-500">
                    Sem dados suficientes
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={planosData}
                        cx="50%"
                        cy="50%"
                        innerRadius={80}
                        outerRadius={120}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {planosData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={CORES_PIE[index % CORES_PIE.length]} />
                        ))}
                      </Pie>
                      <PieTooltip 
                        contentStyle={{ backgroundColor: "#18181b", borderColor: "#27272a", borderRadius: "12px", color: "#fff" }}
                        itemStyle={{ color: "#fff" }}
                      />
                      <Legend verticalAlign="bottom" height={36} wrapperStyle={{ color: '#a1a1aa' }}/>
                    </PieChart>
                  </ResponsiveContainer>
                )}
              </div>
            </CardContent>
          </Card>

          {/* GRÁFICO DE BARRAS: Status dos Pedidos */}
          <Card className="bg-zinc-900 border-zinc-800 text-white shadow-xl">
            <CardContent className="p-6">
              <h2 className="text-xl font-semibold mb-6 border-b border-zinc-800 pb-4">
                Volume por Status (Pedidos)
              </h2>
              <div className="h-[350px]">
                {statusData.length === 0 ? (
                  <div className="h-full flex items-center justify-center text-zinc-500">
                    Sem dados suficientes
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={statusData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
                      <XAxis dataKey="name" stroke="#a1a1aa" tickLine={false} />
                      <YAxis stroke="#a1a1aa" tickLine={false} axisLine={false} allowDecimals={false} />
                      <BarTooltip 
                        cursor={{fill: '#27272a'}}
                        contentStyle={{ backgroundColor: "#18181b", borderColor: "#27272a", borderRadius: "12px", color: "#fff" }}
                      />
                      <Bar dataKey="quantidade" fill="#f97316" radius={[4, 4, 0, 0]} barSize={50} />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </div>
            </CardContent>
          </Card>

        </div>
      )}
    </main>
  )
}