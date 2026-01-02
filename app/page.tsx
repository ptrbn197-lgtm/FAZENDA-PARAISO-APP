"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/lib/auth-context"
import { DashboardLayout } from "@/components/dashboard-layout"
import { SplashScreen } from "@/components/splash-screen"


export default function Home() {
  const [showSplash, setShowSplash] = useState(true)
  const { login, user } = useAuth()

  useEffect(() => {
    // Auto-login como admin se não houver usuário autenticado
    if (!user && showSplash === false) {
      login("admin", "admin123")
    }
  }, [showSplash, user, login])

  if (showSplash) {
    return <SplashScreen onComplete={() => setShowSplash(false)} />
  }

  return (
    <DashboardLayout />
  )
}
