export interface ReportData {
  totalProduction: number
  averageQuality: number
  completedTasks: number
  inspectionRate: number
  recordsCount: number
  inspectionsCount: number
  tasksCount: number
  productionByType: { A: number; B: number; C: number; D: number }
  period: string
}

export function generateReportText(data: ReportData): string {
  const date = new Date().toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  })

  return `📊 *RELATÓRIO DE PRODUÇÃO DE BORRACHA*
📅 Data: ${date}
📆 Período: ${data.period}

━━━━━━━━━━━━━━━━━━━━━━
📈 *RESUMO GERAL*
━━━━━━━━━━━━━━━━━━━━━━

🌳 Produção Total: *${data.totalProduction.toFixed(1)} kg*
⭐ Qualidade Média: *${data.averageQuality.toFixed(1)}/5.0*
✅ Tarefas Concluídas: *${data.completedTasks}*
🔍 Taxa de Inspeção: *${data.inspectionRate.toFixed(0)}%*

━━━━━━━━━━━━━━━━━━━━━━
📊 *PRODUÇÃO POR TIPO*
━━━━━━━━━━━━━━━━━━━━━━

Tarefa A: ${data.productionByType.A.toFixed(1)} kg
Tarefa B: ${data.productionByType.B.toFixed(1)} kg
Tarefa C: ${data.productionByType.C.toFixed(1)} kg
Tarefa D: ${data.productionByType.D.toFixed(1)} kg

━━━━━━━━━━━━━━━━━━━━━━
📋 *ESTATÍSTICAS*
━━━━━━━━━━━━━━━━━━━━━━

📝 Registros de Produção: ${data.recordsCount}
🔍 Inspeções Realizadas: ${data.inspectionsCount}
📌 Total de Tarefas: ${data.tasksCount}

━━━━━━━━━━━━━━━━━━━━━━
Sistema de Gerenciamento de Sangria
Gerado automaticamente`
}

export function downloadReport(reportText: string) {
  const blob = new Blob([reportText], { type: "text/plain;charset=utf-8" })
  const url = URL.createObjectURL(blob)
  const link = document.createElement("a")
  link.href = url
  link.download = `relatorio-producao-${new Date().toISOString().split("T")[0]}.txt`
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

export function shareViaWhatsApp(reportText: string) {
  const blob = new Blob([reportText], { type: "text/plain;charset=utf-8" })
  const url = URL.createObjectURL(blob)
  const link = document.createElement("a")
  link.href = url
  link.download = `relatorio-${new Date().toISOString().split("T")[0]}.txt`
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}
