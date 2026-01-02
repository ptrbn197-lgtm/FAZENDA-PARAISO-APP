"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  TREE_INVENTORY_DATA,
  ADDITIONAL_EXTRA_TREES_01,
  ADDITIONAL_EXTRA_TREES_02,
  GRAND_TOTAL_TREES,
} from "@/lib/tree-data"
import { Trees, User, Leaf } from "lucide-react"

export function TreeInventory() {
  return (
    <div className="space-y-8 sm:space-y-12">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
        <div className="min-w-0">
          <h2 className="text-3xl sm:text-5xl font-black text-gradient tracking-tighter">Contagem de Árvores</h2>
          <p className="text-base sm:text-lg text-muted-foreground/80 font-medium mt-1">Inventário completo das árvores por trabalhador e seção</p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="glass-panel border-none shadow-xl border-l-4 border-l-primary">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs font-black uppercase tracking-[0.2em] text-primary/60">Total Geral</CardTitle>
            <Trees className="h-5 w-5 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-black text-gradient">{GRAND_TOTAL_TREES.toLocaleString()}</div>
            <p className="text-xs font-bold text-muted-foreground/60 uppercase tracking-widest mt-1">árvores no total</p>
          </CardContent>
        </Card>

        <Card className="glass-panel border-none shadow-xl border-l-4 border-l-secondary">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs font-black uppercase tracking-[0.2em] text-secondary/60">Trabalhadores</CardTitle>
            <User className="h-5 w-5 text-secondary" />
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-black text-gradient">{TREE_INVENTORY_DATA.length}</div>
            <p className="text-xs font-bold text-muted-foreground/60 uppercase tracking-widest mt-1">produtores ativos</p>
          </CardContent>
        </Card>

        <Card className="glass-panel border-none shadow-xl border-l-4 border-l-accent">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs font-black uppercase tracking-[0.2em] text-accent/60">Talhões Extras</CardTitle>
            <Leaf className="h-5 w-5 text-accent" />
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-black text-gradient">
              {(ADDITIONAL_EXTRA_TREES_01 + ADDITIONAL_EXTRA_TREES_02).toLocaleString()}
            </div>
            <p className="text-xs font-bold text-muted-foreground/60 uppercase tracking-widest mt-1">reservas adicionais</p>
          </CardContent>
        </Card>

        <Card className="glass-panel border-none shadow-xl border-l-4 border-l-chart-3">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs font-black uppercase tracking-[0.2em] text-chart-3/60">Média/Produtor</CardTitle>
            <Trees className="h-5 w-5 text-chart-3" />
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-black text-gradient">
              {Math.round(
                TREE_INVENTORY_DATA.reduce((acc, w) => acc + w.totalTrees + (w.extraTrees || 0), 0) /
                TREE_INVENTORY_DATA.length,
              ).toLocaleString()}
            </div>
            <p className="text-xs font-bold text-muted-foreground/60 uppercase tracking-widest mt-1">escala de produção</p>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Worker Breakdown */}
      <Card className="glass-panel border-none shadow-2xl">
        <CardHeader className="pb-8 border-b border-primary/5">
          <CardTitle className="text-2xl font-black text-gradient">Detalhamento por Trabalhador</CardTitle>
          <CardDescription className="text-base font-medium">Seções e contagem de árvores atribuídas a cada trabalhador</CardDescription>
        </CardHeader>
        <CardContent className="p-0 sm:p-6">
          <div className="space-y-6">
            {TREE_INVENTORY_DATA.map((worker) => (
              <div
                key={worker.id}
                className="glass-panel border-primary/5 rounded-2xl p-6 space-y-6 card-hover group"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="bg-primary/10 text-primary w-12 h-12 rounded-xl flex items-center justify-center font-black text-lg border border-primary/20 group-hover:bg-primary group-hover:text-white transition-all">
                      {worker.code}
                    </div>
                    <h3 className="text-2xl font-black tracking-tight text-foreground/90 uppercase">{worker.workerName}</h3>
                  </div>
                  <div className="text-right">
                    <div className="text-3xl font-black text-gradient">
                      {(worker.totalTrees + (worker.extraTrees || 0)).toLocaleString()}
                    </div>
                    <div className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Total (Árvores)</div>
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                  {worker.sections.map((section) => (
                    <div
                      key={section.section}
                      className="bg-primary/[0.03] rounded-xl p-4 text-center border border-primary/10 hover:border-primary/30 transition-all hover:scale-105"
                    >
                      <div className="text-[10px] font-black text-muted-foreground/60 uppercase tracking-widest mb-1">{section.section}</div>
                      <div className="text-xl font-black text-primary">{section.treeCount.toLocaleString()}</div>
                    </div>
                  ))}
                  {worker.extraTrees && (
                    <div className="bg-secondary/[0.03] rounded-xl p-4 text-center border border-secondary/10 hover:border-secondary/30 transition-all hover:scale-105">
                      <div className="text-[10px] font-black text-muted-foreground/60 uppercase tracking-widest mb-1">EXTRA</div>
                      <div className="text-xl font-black text-secondary">{worker.extraTrees.toLocaleString()}</div>
                    </div>
                  )}
                </div>
              </div>
            ))}

            <div className="grid gap-6 md:grid-cols-2">
              <div className="glass-panel border-accent/10 rounded-2xl p-6 flex items-center justify-between card-hover group">
                <div className="flex items-center gap-4">
                  <div className="bg-accent/10 text-accent w-12 h-12 rounded-xl flex items-center justify-center font-black text-lg border border-accent/20 group-hover:bg-accent group-hover:text-white transition-all">
                    01
                  </div>
                  <h3 className="text-xl font-black tracking-tight text-foreground/90 uppercase">Extra Adicional 01</h3>
                </div>
                <div className="text-right">
                  <div className="text-3xl font-black text-accent">{ADDITIONAL_EXTRA_TREES_01.toLocaleString()}</div>
                  <div className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Reservas</div>
                </div>
              </div>

              <div className="glass-panel border-secondary/10 rounded-2xl p-6 flex items-center justify-between card-hover group">
                <div className="flex items-center gap-4">
                  <div className="bg-secondary/10 text-secondary w-12 h-12 rounded-xl flex items-center justify-center font-black text-lg border border-secondary/20 group-hover:bg-secondary group-hover:text-white transition-all">
                    02
                  </div>
                  <h3 className="text-xl font-black tracking-tight text-foreground/90 uppercase">Extra Adicional 02</h3>
                </div>
                <div className="text-right">
                  <div className="text-3xl font-black text-secondary">{ADDITIONAL_EXTRA_TREES_02.toLocaleString()}</div>
                  <div className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Reservas</div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Summary Table */}
      <Card className="glass-panel border-none shadow-2xl overflow-hidden">
        <CardHeader className="pb-8 border-b border-primary/5">
          <CardTitle className="text-2xl font-black text-gradient">Resumo da Contagem</CardTitle>
          <CardDescription className="text-base font-medium mt-1">Visão geral consolidada de todo o ativo biológico</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-primary/[0.03]">
                <TableRow className="border-b-primary/10">
                  <TableHead className="font-black text-primary uppercase tracking-widest text-[10px]">Cód</TableHead>
                  <TableHead className="font-black text-primary uppercase tracking-widest text-[10px]">Trabalhador</TableHead>
                  <TableHead className="text-right font-black text-primary uppercase tracking-widest text-[10px]">Seções</TableHead>
                  <TableHead className="text-right font-black text-primary uppercase tracking-widest text-[10px]">Base</TableHead>
                  <TableHead className="text-right font-black text-primary uppercase tracking-widest text-[10px]">Extras</TableHead>
                  <TableHead className="text-right font-black text-primary uppercase tracking-widest text-[10px]">Final</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {TREE_INVENTORY_DATA.map((worker) => (
                  <TableRow key={worker.id} className="hover:bg-primary/[0.02] transition-colors border-b-primary/5">
                    <TableCell>
                      <Badge variant="outline" className="font-black border-primary/20 text-primary">
                        {worker.code}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-bold text-foreground/80 uppercase">{worker.workerName}</TableCell>
                    <TableCell className="text-right font-bold text-muted-foreground">{worker.sections.length}</TableCell>
                    <TableCell className="text-right font-bold">{worker.totalTrees.toLocaleString()}</TableCell>
                    <TableCell className="text-right font-bold text-secondary">{worker.extraTrees?.toLocaleString() || "-"}</TableCell>
                    <TableCell className="text-right font-black text-primary text-lg">
                      {(worker.totalTrees + (worker.extraTrees || 0)).toLocaleString()}
                    </TableCell>
                  </TableRow>
                ))}
                <TableRow className="bg-accent/[0.02] border-b-primary/5">
                  <TableCell>
                    <Badge variant="outline" className="font-black border-accent/20 text-accent">01</Badge>
                  </TableCell>
                  <TableCell className="font-bold uppercase text-accent">Extra Adicional 01</TableCell>
                  <TableCell className="text-right">-</TableCell>
                  <TableCell className="text-right">-</TableCell>
                  <TableCell className="text-right font-bold">{ADDITIONAL_EXTRA_TREES_01.toLocaleString()}</TableCell>
                  <TableCell className="text-right font-black text-accent text-lg">
                    {ADDITIONAL_EXTRA_TREES_01.toLocaleString()}
                  </TableCell>
                </TableRow>
                <TableRow className="bg-secondary/[0.02] border-b-primary/5">
                  <TableCell>
                    <Badge variant="outline" className="font-black border-secondary/20 text-secondary">02</Badge>
                  </TableCell>
                  <TableCell className="font-bold uppercase text-secondary">Extra Adicional 02</TableCell>
                  <TableCell className="text-right">-</TableCell>
                  <TableCell className="text-right">-</TableCell>
                  <TableCell className="text-right font-bold">{ADDITIONAL_EXTRA_TREES_02.toLocaleString()}</TableCell>
                  <TableCell className="text-right font-black text-secondary text-lg">
                    {ADDITIONAL_EXTRA_TREES_02.toLocaleString()}
                  </TableCell>
                </TableRow>
                <TableRow className="bg-primary/5 font-black border-none">
                  <TableCell colSpan={3} className="text-lg uppercase tracking-wider">Total Geral</TableCell>
                  <TableCell className="text-right text-lg">
                    {TREE_INVENTORY_DATA.reduce((acc, w) => acc + w.totalTrees, 0).toLocaleString()}
                  </TableCell>
                  <TableCell className="text-right text-lg text-secondary">
                    {(ADDITIONAL_EXTRA_TREES_01 + ADDITIONAL_EXTRA_TREES_02).toLocaleString()}
                  </TableCell>
                  <TableCell className="text-right text-3xl text-gradient">{GRAND_TOTAL_TREES.toLocaleString()}</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
