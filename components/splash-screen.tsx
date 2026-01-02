"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import { supabase } from "@/lib/supabase"

interface SplashScreenProps {
  onComplete: () => void
}

export function SplashScreen({ onComplete }: SplashScreenProps) {
  const [fadeOut, setFadeOut] = useState(false)
  const [status, setStatus] = useState("Iniciando sistema...")

  useEffect(() => {
    // Debug de configuração e conexão
    const timer = setTimeout(() => {
      setFadeOut(true)
      setTimeout(onComplete, 500)
    }, 4000)

    // @ts-ignore - acessando url interna para debug
    const url = supabase.supabaseUrl
    const isOnline = navigator.onLine

    if (!url || url.includes("undefined")) {
      setStatus(`ERRO: URL do Banco não encontrada!`)
    } else {
      // Mostra os primeiros 8 caracteres do host para confirmar que é o projeto certo
      const projectID = url.split('.')[0].split('//')[1]
      setStatus(`${isOnline ? "Online" : "Offline"} | DB: ${projectID}`)
    }

    return () => clearTimeout(timer)
  }, [onComplete])

  return (
    <div
      className={`fixed inset-0 z-50 flex flex-col items-center justify-center transition-opacity duration-1000 ${fadeOut ? "opacity-0" : "opacity-100"
        }`}
    >
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <Image
          src="/images/splash-background.png"
          alt="Fazenda"
          fill
          className="object-cover brightness-[0.4]"
          priority
        />
      </div>

      <div className="relative z-10 flex flex-col items-center gap-8 animate-in fade-in zoom-in duration-1000">
        <div className="bg-white/10 backdrop-blur-md p-6 rounded-3xl shadow-2xl border border-white/20">
          <Image
            src="/images/logo-fazenda-paraiso.png"
            alt="Logo Fazenda Paraíso"
            width={140}
            height={140}
            className="brightness-0 invert opacity-90"
            priority
          />
        </div>

        <div className="text-center">
          <h1 className="text-5xl font-black tracking-tighter text-white drop-shadow-2xl">
            Fazenda Paraíso
          </h1>
          <p className="text-xl text-white/80 mt-2 font-medium tracking-wide">
            Gestão Florestal e Produção
          </p>
        </div>

        <div className="flex gap-3 mt-4">
          <div className="w-2.5 h-2.5 bg-white rounded-full animate-bounce [animation-delay:-0.3s]" />
          <div className="w-2.5 h-2.5 bg-white/60 rounded-full animate-bounce [animation-delay:-0.15s]" />
          <div className="w-2.5 h-2.5 bg-white/30 rounded-full animate-bounce" />
        </div>

        {/* Debug Info */}
        <p className="text-xs text-white/40 font-mono mt-8 border border-white/10 px-3 py-1.5 rounded-full bg-black/20">
          {status}
        </p>
      </div>
    </div>
  )
}
