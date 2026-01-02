"use client"

import { useState } from "react"
import { ProductionRecording } from "@/components/production-recording"
import { TreeInventory } from "@/components/tree-inventory"
import { StimulationCalendar } from "@/components/stimulation-calendar"
import { PestControl } from "@/components/pest-control"
import { AttendanceTracker } from "@/components/attendance-tracker"
import { RainfallSimple } from "@/components/rainfall-simple"
import { BarChart3, Home, Trees, Droplet, Bug, Menu, UserCheck, CloudRain } from "lucide-react"
import Image from "next/image"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { ThemeToggle } from "@/components/theme-toggle"

type View = "home" | "attendance" | "production" | "trees" | "stimulation" | "pest-control" | "rainfall"

export function DashboardLayout() {
  const [currentView, setCurrentView] = useState<View>("home")
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const renderView = () => {
    switch (currentView) {
      case "attendance":
        return <AttendanceTracker />
      case "production":
        return <ProductionRecording />
      case "trees":
        return <TreeInventory />
      case "stimulation":
        return <StimulationCalendar />
      case "pest-control":
        return <PestControl />
      case "rainfall":
        return <RainfallSimple />
      case "home":
      default:
        return <HomeView setView={setCurrentView} />
    }
  }

  const NavigationItems = ({ onItemClick }: { onItemClick?: () => void }) => (
    <>
      <Button
        variant={currentView === "home" ? "default" : "outline"}
        onClick={() => {
          setCurrentView("home")
          onItemClick?.()
        }}
        className="gap-2 w-full sm:w-auto justify-start text-base"
      >
        <Home className="h-5 w-5" />
        <span className="font-medium">Início</span>
      </Button>
      <Button
        variant={currentView === "attendance" ? "default" : "outline"}
        onClick={() => {
          setCurrentView("attendance")
          onItemClick?.()
        }}
        className="gap-2 w-full sm:w-auto justify-start text-base"
      >
        <UserCheck className="h-5 w-5" />
        <span className="font-medium">Presença</span>
      </Button>
      <Button
        variant={currentView === "production" ? "default" : "outline"}
        onClick={() => {
          setCurrentView("production")
          onItemClick?.()
        }}
        className="gap-2 w-full sm:w-auto justify-start text-base"
      >
        <BarChart3 className="h-5 w-5" />
        <span className="font-medium">Produção</span>
      </Button>
      <Button
        variant={currentView === "trees" ? "default" : "outline"}
        onClick={() => {
          setCurrentView("trees")
          onItemClick?.()
        }}
        className="gap-2 w-full sm:w-auto justify-start text-base"
      >
        <Trees className="h-5 w-5" />
        <span className="font-medium">Árvores</span>
      </Button>
      <Button
        variant={currentView === "stimulation" ? "default" : "outline"}
        onClick={() => {
          setCurrentView("stimulation")
          onItemClick?.()
        }}
        className="gap-2 w-full sm:w-auto justify-start text-base"
      >
        <Droplet className="h-5 w-5" />
        <span className="font-medium">Estimulação</span>
      </Button>
      <Button
        variant={currentView === "pest-control" ? "default" : "outline"}
        onClick={() => {
          setCurrentView("pest-control")
          onItemClick?.()
        }}
        className="gap-2 w-full sm:w-auto justify-start text-base"
      >
        <Bug className="h-5 w-5" />
        <span className="font-medium">Pragas</span>
      </Button>
      <Button
        variant={currentView === "rainfall" ? "default" : "outline"}
        onClick={() => {
          setCurrentView("rainfall")
          onItemClick?.()
        }}
        className="gap-2 w-full sm:w-auto justify-start text-base"
      >
        <CloudRain className="h-5 w-5" />
        <span className="font-medium">Chuva</span>
      </Button>
    </>
  )

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-10 border-b bg-background/95 backdrop-blur">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 sm:gap-4 min-w-0 flex-1">
            <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center overflow-hidden flex-shrink-0">
              <Image
                src="/images/logo-fazenda-paraiso.png"
                alt="Fazenda Paraíso"
                width={40}
                height={40}
                className="object-contain brightness-0 invert"
                priority
              />
            </div>
            <div className="min-w-0 flex-1">
              <h1 className="text-xl font-bold truncate tracking-tight">Fazenda Paraíso</h1>
              <p className="text-xs text-muted-foreground truncate font-medium">Gestão do Seringal</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
              <SheetTrigger asChild className="md:hidden">
                <Button variant="outline" size="lg" className="h-12 w-12 bg-transparent">
                  <Menu className="h-6 w-6" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-80 p-6">
                <div className="mb-8">
                  <p className="font-semibold text-lg">Fazenda Paraíso</p>
                  <p className="text-base text-muted-foreground">Sistema de Gestão</p>
                </div>
                <nav className="flex flex-col gap-3">
                  <NavigationItems onItemClick={() => setMobileMenuOpen(false)} />
                </nav>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 sm:px-6 py-5 sm:py-8">
        <nav className="hidden md:flex gap-3 mb-8 overflow-x-auto pb-2">
          <NavigationItems />
        </nav>

        <main>{renderView()}</main>
      </div>
    </div>
  )
}

function HomeView({ setView }: { setView: (view: View) => void }) {
  return (
    <div className="space-y-8 py-4">
      <div className="max-w-2xl">
        <h2 className="text-4xl font-bold mb-2 tracking-tight">Bem-vindo!</h2>
        <p className="text-lg text-muted-foreground">Sistema para controle de sangria, produção e gestão florestal.</p>
      </div>
      <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
        <Button
          variant="outline"
          className="h-auto p-6 flex flex-col items-start gap-4 hover:border-primary transition-all group"
          onClick={() => setView("attendance")}
        >
          <div className="p-3 rounded-lg bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
            <UserCheck className="h-6 w-6" />
          </div>
          <div className="text-left">
            <h3 className="font-bold text-lg mb-1">Registro de Presença</h3>
            <p className="text-sm text-muted-foreground">Sangria, faltas e inspeções</p>
          </div>
        </Button>

        <Button
          variant="outline"
          className="h-auto p-6 flex flex-col items-start gap-4 hover:border-secondary transition-all group"
          onClick={() => setView("production")}
        >
          <div className="p-3 rounded-lg bg-secondary/10 text-secondary group-hover:bg-secondary group-hover:text-secondary-foreground transition-colors">
            <BarChart3 className="h-6 w-6" />
          </div>
          <div className="text-left">
            <h3 className="font-bold text-lg mb-1">Produção</h3>
            <p className="text-sm text-muted-foreground">Registrar produção em kg</p>
          </div>
        </Button>

        <Button
          variant="outline"
          className="h-auto p-6 flex flex-col items-start gap-4 hover:border-chart-3 transition-all group"
          onClick={() => setView("trees")}
        >
          <div className="p-3 rounded-lg bg-chart-3/10 text-chart-3 group-hover:bg-chart-3 group-hover:text-white transition-colors">
            <Trees className="h-6 w-6" />
          </div>
          <div className="text-left">
            <h3 className="font-bold text-lg mb-1">Árvores</h3>
            <p className="text-sm text-muted-foreground">Inventário e contagem</p>
          </div>
        </Button>

        <Button
          variant="outline"
          className="h-auto p-6 flex flex-col items-start gap-4 hover:border-chart-4 transition-all group"
          onClick={() => setView("stimulation")}
        >
          <div className="p-3 rounded-lg bg-chart-4/10 text-chart-4 group-hover:bg-chart-4 group-hover:text-white transition-colors">
            <Droplet className="h-6 w-6" />
          </div>
          <div className="text-left">
            <h3 className="font-bold text-lg mb-1">Estimulação</h3>
            <p className="text-sm text-muted-foreground">Controle de aplicação de Ethrel</p>
          </div>
        </Button>

        <Button
          variant="outline"
          className="h-auto p-6 flex flex-col items-start gap-4 hover:border-destructive transition-all group"
          onClick={() => setView("pest-control")}
        >
          <div className="p-3 rounded-lg bg-destructive/10 text-destructive group-hover:bg-destructive group-hover:text-destructive-foreground transition-colors">
            <Bug className="h-6 w-6" />
          </div>
          <div className="text-left">
            <h3 className="font-bold text-lg mb-1">Controle de Pragas</h3>
            <p className="text-sm text-muted-foreground">Fiscalização de pragas e doenças</p>
          </div>
        </Button>

        <Button
          variant="outline"
          className="h-auto p-6 flex flex-col items-start gap-4 hover:border-blue-500 transition-all group"
          onClick={() => setView("rainfall")}
        >
          <div className="p-3 rounded-lg bg-blue-500/10 text-blue-500 group-hover:bg-blue-500 group-hover:text-white transition-colors">
            <CloudRain className="h-6 w-6" />
          </div>
          <div className="text-left">
            <h3 className="font-bold text-lg mb-1">Chuva</h3>
            <p className="text-sm text-muted-foreground">Registro de precipitação (mm)</p>
          </div>
        </Button>

      </div>
    </div>
  )
}
