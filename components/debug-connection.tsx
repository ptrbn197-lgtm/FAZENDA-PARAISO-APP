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
            const currentUrl = supabase['supabaseUrl'] as string
            const currentKey = supabase['supabaseKey'] as string

            if (!currentUrl || !currentUrl.includes('qxhrilukcdwqgetcjyva')) {
                throw new Error(`URL incorreta carregada: ${currentUrl}`)
            }

            // 2. Teste de Sessão (Simples)
            const { data, error } = await supabase.auth.getSession()

            const time = Date.now() - start

            if (error) {
                // Se for erro de chave, vamos ser bem específicos
                if (error.message.includes('Invalid API key')) {
                    throw new Error('A Chave API ("anon key") foi rejeitada pelo Supabase. Ela pode ter sido revogada ou não pertence a este projeto.')
                }
                throw error
            }

            setStatus('success')
            setMessage(`Conectado! Latência: ${time}ms`)
            setDetails({
                test: 'auth.getSession',
                url_check: 'OK',
                session: data.session ? 'Ativa' : 'Nenhuma',
                data
            })
        } catch (err: any) {
            console.error("Debug connection error:", err)
            setStatus('error')
            setMessage(err.message || 'Erro desconhecido')
            setDetails(err)
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
