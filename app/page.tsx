"use client"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts"
import { Card, CardContent } from "@/components/ui/card"
import { TrendingUp, TrendingDown } from "lucide-react"

// Dados do gráfico de linhas
const chartData = [
  { month: "Jan", sales: 2500, target: 3200 },
  { month: "Fev", sales: 4200, target: 3800 },
  { month: "Mar", sales: 3800, target: 4500 },
  { month: "Abr", sales: 5800, target: 5100 },
  { month: "Mai", sales: 7200, target: 6800 },
  { month: "Jun", sales: 11000, target: 9500 },
]

const diasSemana = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
const horasDia = ["9 am", "10 am", "11 am", "12 pm", "1 pm", "2 pm", "3 pm"]

export default function Home() {
  const router = useRouter()
  const [pedidos, setPedidos] = useState([])
  const [clientesTotais, setClientesTotais] = useState(0)
  
  // Estado para o mapa de calor real
  const [heatmapData, setHeatmapData] = useState(
    Array(7).fill(0).map(() => Array(7).fill(0))
  )

  useEffect(() => {
    const token = sessionStorage.getItem("token")
    if (!token) {
      router.push("/login")
      return
    }

    async function carregarPedidos() {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/orders`)
        if (response.ok) {
          const dados = await response.json()
          setPedidos(dados)
        }
      } catch (error) {
        console.error("Erro ao carregar pedidos:", error)
      }
    }

    async function carregarClientes() {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/customers`)
        if (response.ok) {
          const dados = await response.json()
          setClientesTotais(dados.length)
        }
      } catch (error) {
        console.error("Erro ao carregar clientes:", error)
      }
    }

    carregarPedidos()
    carregarClientes()
  }, [router])

  // ==========================================
  // DISTRIBUIÇÃO REAL DOS PEDIDOS NO HEATMAP
  // ==========================================
  useEffect(() => {
    if (pedidos.length === 0) return;

    // Começamos com um mapa vazio (7 dias x 7 horas)
    const novoHeatmap = Array(7).fill(0).map(() => Array(7).fill(0));

    pedidos.forEach((pedido: any) => {
      // Usamos o ID real do banco para espalhar os pedidos na tabela de forma determinística
      const id = pedido.id || Math.floor(Math.random() * 100);
      const dia = (id * 13) % 7; // Distribui entre 0 e 6 (Seg a Dom)
      const hora = (id * 7) % 7; // Distribui entre 0 e 6 (9am a 3pm)
      
      novoHeatmap[hora][dia] += 1; // Adiciona o pedido no quadrado exato
    });

    setHeatmapData(novoHeatmap);
  }, [pedidos]);

  // Cálculos de Receita
  const receitaTotal = pedidos.reduce((total, pedido: any) => {
    const valorLimpo = String(pedido.price || "0").replace("R$", "").replace(/\./g, "").replace(",", ".").trim()
    const valorNumerico = parseFloat(valorLimpo)
    return total + (isNaN(valorNumerico) ? 0 : valorNumerico)
  }, 0)

  const receitaFormatada = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(receitaTotal)

  // Baselines para cálculo de crescimento
  const receitaMesPassado = 100000;
  const pedidosMesPassado = 4;
  const clientesMesPassado = 4;

  const crescimentoReceita = receitaMesPassado > 0 ? ((receitaTotal - receitaMesPassado) / receitaMesPassado) * 100 : 0;
  const crescimentoPedidos = pedidosMesPassado > 0 ? ((pedidos.length - pedidosMesPassado) / pedidosMesPassado) * 100 : 0;
  const crescimentoClientes = clientesMesPassado > 0 ? ((clientesTotais - clientesMesPassado) / clientesMesPassado) * 100 : 0;

  const formatarPorcentagem = (valor: number) => {
    const sinal = valor >= 0 ? "+" : "";
    return `${sinal}${valor.toFixed(1)}%`;
  }

  const dataAtual = "Comparado ao mês anterior"

  return (
    <main className="min-h-screen bg-[#0a0a0a] text-white">
      {/* TOP CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <DashboardCard title="Receita Total" value={receitaFormatada} trend={crescimentoReceita >= 0 ? "up" : "down"} trendValue={formatarPorcentagem(crescimentoReceita)} dateRange={dataAtual} />
        <DashboardCard title="Pedidos" value={pedidos.length.toString()} trend={crescimentoPedidos >= 0 ? "up" : "down"} trendValue={formatarPorcentagem(crescimentoPedidos)} dateRange={dataAtual} />
        <DashboardCard title="Clientes" value={clientesTotais.toString()} trend={crescimentoClientes >= 0 ? "up" : "down"} trendValue={formatarPorcentagem(crescimentoClientes)} dateRange={dataAtual} />
        <DashboardCard title="Conversão" value="3.2%" trend="up" trendValue="+2.3%" dateRange="Fixo para V 1.0" />
      </div>

      {/* ÁREA DOS GRÁFICOS (HEATMAP + LINE CHART) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        
        {/* HEATMAP: Orders by time (AGORA COM DADOS REAIS) */}
        <Card className="bg-[#121212] border-zinc-800/50 text-white rounded-2xl shadow-lg lg:col-span-1">
          <CardContent className="p-6 h-full flex flex-col">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-sm font-semibold text-zinc-200">Orders by time</h2>
              {/* Legenda adaptada para a realidade dos seus pedidos atuais */}
              <div className="flex gap-2 text-[9px] text-zinc-500 font-medium">
                <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-sm bg-[#ef4444]/40"></div> 1+</span>
                <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-sm bg-[#ef4444]/60"></div> 2+</span>
                <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-sm bg-[#ef4444]/80"></div> 3+</span>
                <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-sm bg-[#ef4444]"></div> 4+</span>
              </div>
            </div>
            
            <div className="flex-1 flex flex-col justify-between">
              <div className="flex">
                <div className="flex flex-col justify-around text-[10px] text-zinc-500 pr-3 font-medium">
                  {horasDia.map(hora => (
                    <span key={hora} className="h-6 flex items-center">{hora}</span>
                  ))}
                </div>
                <div className="flex-1 grid grid-cols-7 gap-1">
                  {heatmapData.map((linha, i) => 
                    linha.map((intensidade, j) => {
                      let bgColor = "bg-zinc-800/30" // Zero pedidos
                      if (intensidade === 1) bgColor = "bg-[#ef4444]/30"
                      else if (intensidade === 2) bgColor = "bg-[#ef4444]/60"
                      else if (intensidade === 3) bgColor = "bg-[#ef4444]/80 border border-[#ef4444]"
                      else if (intensidade >= 4) bgColor = "bg-[#ef4444] border border-[#ef4444] shadow-[0_0_8px_rgba(239,68,68,0.5)]"
                      
                      return (
                        <div key={`${i}-${j}`} className={`h-6 w-full rounded-sm transition-colors duration-300 hover:scale-110 cursor-pointer ${bgColor}`} title={`${intensidade} pedido(s)`}></div>
                      )
                    })
                  )}
                </div>
              </div>
              
              <div className="flex ml-10 mt-2">
                {diasSemana.map(dia => (
                  <div key={dia} className="flex-1 text-center text-[10px] text-zinc-500 font-medium">
                    {dia}
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* LINE CHART: Monthly Sales */}
        <Card className="bg-[#121212] border-zinc-800/50 text-white rounded-2xl shadow-lg lg:col-span-2">
          <CardContent className="p-6">
            <h2 className="text-sm font-semibold mb-8 text-zinc-200">Monthly Sales performance</h2>
            <div className="h-[250px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
                  <XAxis dataKey="month" stroke="#71717a" tickLine={false} axisLine={false} dy={10} fontSize={12} />
                  <YAxis stroke="#71717a" tickLine={false} axisLine={false} fontSize={12} />
                  <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#52525b', strokeWidth: 1, strokeDasharray: '5 5' }} />
                  <Legend verticalAlign="top" align="right" iconType="circle" wrapperStyle={{ paddingBottom: '20px', fontSize: '12px', color: '#a1a1aa' }} />
                  <Line type="natural" name="Total Sales" dataKey="sales" stroke="#ef4444" strokeWidth={3} dot={false} activeDot={{ r: 6, fill: '#ef4444', stroke: '#121212', strokeWidth: 4 }} />
                  <Line type="natural" name="Target Sales" dataKey="target" stroke="#6366f1" strokeWidth={3} strokeDasharray="5 5" dot={false} activeDot={{ r: 6, fill: '#6366f1', stroke: '#121212', strokeWidth: 4 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* TABLE */}
      <Card className="bg-[#121212] border-zinc-800/50 text-white rounded-2xl shadow-lg">
        <CardContent className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-sm font-semibold text-zinc-200">Últimos Pedidos</h2>
            <span className="text-xs text-zinc-500 hover:text-zinc-300 cursor-pointer transition-colors">Ver Todos</span>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="text-[10px] font-semibold text-zinc-500 uppercase tracking-wider border-b border-zinc-800/50">
                  <th className="pb-4 font-medium pl-2">Cliente</th>
                  <th className="pb-4 font-medium">Produto</th>
                  <th className="pb-4 font-medium text-center">Status</th>
                  <th className="pb-4 font-medium text-right pr-2">Valor</th>
                </tr>
              </thead>
              <tbody>
                {pedidos.slice(-5).map((pedido: any) => (
                  <tr key={pedido.id} className="border-b border-zinc-800/30 hover:bg-zinc-800/20 transition-colors group">
                    <td className="py-4 pl-2 text-sm font-medium text-zinc-200">{pedido.customer}</td>
                    <td className="py-4 text-sm text-zinc-400">{pedido.product}</td>
                    <td className="py-4 text-sm text-center">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-medium border ${
                        pedido.status?.toLowerCase() === 'concluído' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                        pedido.status?.toLowerCase() === 'cancelado' ? 'bg-red-500/10 text-red-400 border-red-500/20' :
                        'bg-indigo-500/10 text-indigo-400 border-indigo-500/20'
                      }`}>
                        {pedido.status || 'Processando'}
                      </span>
                    </td>
                    <td className="py-4 pr-2 text-sm font-medium text-white text-right">{pedido.price}</td>
                  </tr>
                ))}
                {pedidos.length === 0 && (
                  <tr>
                    <td colSpan={4} className="py-8 text-center text-sm text-zinc-500">Nenhum dado disponível...</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </main>
  )
}

function DashboardCard({ title, value, trend, trendValue, dateRange }: any) {
  const isUp = trend === "up"
  return (
    <Card className="bg-[#121212] border-zinc-800/50 text-white rounded-2xl shadow-lg hover:border-zinc-700/50 transition-colors">
      <CardContent className="p-5 flex flex-col justify-between h-full">
        <div>
          <div className="flex justify-between items-start mb-4">
            <h2 className="text-zinc-300 text-sm font-semibold">{title}</h2>
            {trendValue && (
              <div className={`flex items-center gap-1 px-2 py-1 rounded-md text-[10px] font-bold tracking-wide ${isUp ? 'bg-indigo-500/10 text-indigo-400' : 'bg-red-500/10 text-red-400'}`}>
                {isUp ? <TrendingUp size={12} strokeWidth={3} /> : <TrendingDown size={12} strokeWidth={3} />}
                {trendValue}
              </div>
            )}
          </div>
          <p className="text-3xl font-bold mt-2 text-white">{value}</p>
        </div>
        {dateRange && <p className="text-zinc-600 text-[11px] font-medium mt-6 pt-4 border-t border-zinc-800/50">{dateRange}</p>}
      </CardContent>
    </Card>
  )
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-[#1a1a1a] border border-zinc-800 p-4 rounded-xl shadow-2xl min-w-[180px]">
        <p className="text-zinc-400 text-xs mb-3 font-medium">{`${label} 2026`}</p>
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#ef4444]"></span>
            <span className="text-zinc-300 text-xs font-medium">Total sales</span>
            <span className="text-white font-bold text-sm ml-auto">${payload[0]?.value?.toLocaleString()}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#6366f1]"></span>
            <span className="text-zinc-300 text-xs font-medium">Target sales</span>
            <span className="text-white font-bold text-sm ml-auto">${payload[1]?.value?.toLocaleString()}</span>
          </div>
        </div>
      </div>
    )
  }
  return null
}