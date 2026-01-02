"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { CloudRain, Calendar, Trash2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface RainfallEntry {
    id: string
    date: string
    amountMm: number
    createdAt: string
}

export function RainfallSimple() {
    const { toast } = useToast()
    const [date, setDate] = useState<string>(new Date().toISOString().split("T")[0])
    const [amount, setAmount] = useState<string>("")
    const [records, setRecords] = useState<RainfallEntry[]>([])

    useEffect(() => {
        loadRecords()
    }, [])

    const loadRecords = () => {
        const stored = localStorage.getItem("rainfall_records")
        if (stored) {
            setRecords(JSON.parse(stored))
        }
    }

    const handleSave = () => {
        if (!amount || parseFloat(amount) <= 0) {
            toast({
                title: "Erro",
                description: "Informe a quantidade de chuva",
                variant: "destructive",
            })
            return
        }

        const newRecord: RainfallEntry = {
            id: `rain-${Date.now()}`,
            date,
            amountMm: parseFloat(amount),
            createdAt: new Date().toISOString(),
        }

        const updated = [newRecord, ...records]
        localStorage.setItem("rainfall_records", JSON.stringify(updated))
        setRecords(updated)

        toast({
            title: "Chuva registrada",
            description: `${amount} mm em ${new Date(date).toLocaleDateString("pt-BR")}`,
        })

        setAmount("")
    }

    const handleDelete = (id: string) => {
        const updated = records.filter((r) => r.id !== id)
        localStorage.setItem("rainfall_records", JSON.stringify(updated))
        setRecords(updated)

        toast({
            title: "Registro excluído",
            description: "O registro de chuva foi removido",
        })
    }

    const totalMonth = records
        .filter((r) => r.date.startsWith(date.slice(0, 7)))
        .reduce((sum, r) => sum + r.amountMm, 0)

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-3">
                <div className="p-3 rounded-xl bg-blue-500/10">
                    <CloudRain className="h-8 w-8 text-blue-600" />
                </div>
                <div>
                    <h1 className="text-3xl font-black tracking-tight">Registro de Chuva</h1>
                    <p className="text-muted-foreground">Registre a quantidade de chuva em milímetros</p>
                </div>
            </div>

            <div className="grid gap-6 lg:grid-cols-2">
                <Card className="glass-panel border-none shadow-xl">
                    <CardHeader>
                        <CardTitle className="text-xl font-bold">Novo Registro</CardTitle>
                        <CardDescription>Informe a data e quantidade de chuva</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="date" className="text-base">
                                Data
                            </Label>
                            <Input
                                id="date"
                                type="date"
                                value={date}
                                onChange={(e) => setDate(e.target.value)}
                                className="h-12 text-base"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="amount" className="text-base">
                                Quantidade (mm)
                            </Label>
                            <Input
                                id="amount"
                                type="number"
                                step="0.1"
                                min="0"
                                value={amount}
                                onChange={(e) => setAmount(e.target.value)}
                                placeholder="Ex: 15.5"
                                className="h-12 text-base"
                            />
                        </div>

                        <Button onClick={handleSave} size="lg" className="w-full text-lg h-14">
                            <CloudRain className="h-5 w-5 mr-2" />
                            Registrar Chuva
                        </Button>
                    </CardContent>
                </Card>

                <Card className="glass-panel border-none shadow-xl">
                    <CardHeader>
                        <CardTitle className="text-xl font-bold">Total do Mês</CardTitle>
                        <CardDescription>{new Date(date).toLocaleDateString("pt-BR", { month: "long", year: "numeric" })}</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="text-center py-6">
                            <div className="text-5xl font-black text-blue-600">{totalMonth.toFixed(1)}</div>
                            <div className="text-lg text-muted-foreground mt-2">milímetros</div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <Card className="glass-panel border-none shadow-xl">
                <CardHeader>
                    <CardTitle className="text-xl font-bold">Histórico de Registros</CardTitle>
                    <CardDescription>Últimos registros de chuva</CardDescription>
                </CardHeader>
                <CardContent>
                    {records.length === 0 ? (
                        <div className="text-center py-12">
                            <Calendar className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                            <p className="text-lg text-muted-foreground">Nenhum registro ainda</p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {records.slice(0, 10).map((record) => (
                                <div
                                    key={record.id}
                                    className="flex items-center justify-between p-4 rounded-lg bg-background/50 border border-border/50"
                                >
                                    <div className="flex items-center gap-4">
                                        <CloudRain className="h-5 w-5 text-blue-600" />
                                        <div>
                                            <div className="font-semibold">
                                                {new Date(record.date).toLocaleDateString("pt-BR")}
                                            </div>
                                            <div className="text-sm text-muted-foreground">
                                                {record.amountMm.toFixed(1)} mm
                                            </div>
                                        </div>
                                    </div>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => handleDelete(record.id)}
                                        className="text-destructive hover:text-destructive"
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}
