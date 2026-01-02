export function getMonthName(monthStr: string): string {
  const months = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"]
  const [, month] = monthStr.split("-")
  return months[Number.parseInt(month) - 1]
}

export function getLast6Months(): string[] {
  const months: string[] = []
  const today = new Date()

  for (let i = 5; i >= 0; i--) {
    const date = new Date(today.getFullYear(), today.getMonth() - i, 1)
    months.push(date.toISOString().slice(0, 7))
  }

  return months
}

export function getMonthlyStats<T extends { month: string }>(
  data: T[],
  months: string[],
): Array<{ month: string; count: number; value: number }> {
  return months.map((month) => {
    const monthData = data.filter((d) => d.month === month)
    return {
      month: getMonthName(month),
      count: monthData.length,
      value:
        monthData.reduce((sum: number, d: any) => sum + (d.overallScore || d.productionKg || 0), 0) /
        Math.max(monthData.length, 1),
    }
  })
}
