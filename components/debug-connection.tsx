"use client"
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'

export function DebugConnection() {
    const [status, setStatus] = useState<'testing' | 'success' | 'error'>('testing')
    const [message, setMessage] = useState('Testando conexão...')
    const [details, setDetails] = useState<any>(null)

    const testConnection = async () => {
        setStatus('testing')
        setMessage('Verificando configuração e sessão...')
        try {
            const start = Date.now()

            // 1. Verificar configuração carregada
            const currentUrl = (supabase as any).supabaseUrl || process.env.NEXT_PUBLIC_SUPABASE_URL
            const currentKey = (supabase as any).supabaseKey || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

            if (!currentUrl) {
                throw new Error('A URL do Supabase está vazia. Verifique as variáveis de ambiente (dashboard do Vercel ou .env.local).')
            }

            // 2. Teste de Sessão
            const { data, error } = await supabase.auth.getSession()

            const time = Date.now() - start

            if (error) {
                if (error.message.includes('Invalid API key') || error.message.includes('apiKey')) {
                    throw new Error('A Chave API (anon key) parece inválida ou não foi carregada. Verifique se copiou a chave "anon public" corretamente.')
                }
                throw error
            }

            setStatus('success')
            setMessage(`Conectado! Latência: ${time}ms`)
            setDetails({
                test: 'auth.getSession',
                url_present: !!currentUrl,
                url_masked: currentUrl.replace(/(https:\/\/).*(.supabase.co)/, "$1***$2"),
                session: data.session ? 'Ativa' : 'Nenhuma',
                user: data.session?.user?.email || 'Deslogado',
            })
        } catch (err: any) {
            console.error("Debug connection error:", err)
            setStatus('error')
            setMessage(err.message || 'Erro desconhecido')
            setDetails({
                error: err.message,
                hint: "Verifique se você configurou NEXT_PUBLIC_SUPABASE_URL e NEXT_PUBLIC_SUPABASE_ANON_KEY no Vercel.",
                stack: err.stack
            })
        }
    }

    useEffect(() => {
        testConnection()
    }, [])

    if (status === 'success') return null // Se funcionar, fica invisível

    return (
        <div className="fixed bottom-4 right-4 z-50 p-4 rounded-lg shadow-xl border w-96 font-mono text-xs overflow-auto max-h-[80vh] bg-red-950 border-red-500 text-red-50">
            <h3 className="font-bold mb-2 text-lg">⚠️ Diagnóstico de Conexão</h3>

            <div className="mb-2">
                <strong>Status:</strong> {status.toUpperCase()}
            </div>

            <div className="mb-2 bg-black/30 p-2 rounded">
                <strong>Erro:</strong> {message}
            </div>

            {details && (
                <pre className="bg-black/50 p-2 rounded overflow-auto whitespace-pre-wrap">
                    {JSON.stringify(details, null, 2)}
                </pre>
            )}

            <button
                onClick={testConnection}
                className="mt-4 bg-white text-black px-4 py-2 rounded font-bold hover:bg-gray-200 w-full"
            >
                Tentar Novamente
            </button>

            <div className="mt-2 text-[10px] opacity-70">
                URL: {supabase['supabaseUrl'] || 'N/A'}<br />
                Key: {supabase['supabaseKey'] ? 'Presente' : 'Ausente'}
            </div>
        </div>
    )
}
