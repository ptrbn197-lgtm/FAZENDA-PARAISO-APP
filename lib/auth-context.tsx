"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import type { User, UserRole } from "./types"
import { supabase } from "./supabase"

interface AuthContextType {
  user: User | null
  login: (email: string, password: string) => Promise<boolean>
  logout: () => Promise<void>
  isLoading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Check active session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        fetchProfile(session.user.id, session.user.email!)
      } else {
        setIsLoading(false)
      }
    })

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        fetchProfile(session.user.id, session.user.email!)
      } else {
        setUser(null)
        setIsLoading(false)
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  const fetchProfile = async (userId: string, email: string) => {
    try {
      const { data, error } = await supabase
        .from("users")
        .select("*")
        .eq("id", userId)
        .single()

      if (error && error.code !== "PGRST116") {
        console.error("Error fetching profile:", error)
      }

      if (data) {
        setUser(data)
      } else {
        // Create profile if it doesn't exist (First login sync)
        // Determine role/name from email for simplified setup
        const name = email.split("@")[0]
        const role = determineRole(email)

        const newProfile: User = {
          id: userId,
          email,
          name,
          role,
          createdAt: new Date().toISOString(),
        }

        const { error: insertError } = await supabase
          .from("users")
          .insert([newProfile])

        if (!insertError) {
          setUser(newProfile)
        }
      }
    } catch (error) {
      console.error("Profile handling error:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const determineRole = (email: string): UserRole => {
    if (email.includes("admin")) return "admin"
    if (email.includes("fiscal")) return "inspector"
    return "worker"
  }

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      // Auto-append domain for quick logins if plain username provided
      let finalEmail = email
      if (!email.includes("@")) {
        finalEmail = `${email}@fazenda.com`
      }

      // Try signing in
      const { data, error } = await supabase.auth.signInWithPassword({
        email: finalEmail,
        password: password,
      })

      if (error) {
        // Handle "Email not confirmed" specifically
        if (error.message.includes("Email not confirmed")) {
          console.warn("⚠️ Autenticação: E-mail não verificado no Supabase.")
          // For the sake of the web app experience, we can't bypass this here 
          // without changing Supabase settings, but we should let the app proceed.
          return false
        }

        // For demo simplicity: If login fails, try to sign up automatically
        if (error.message.includes("Invalid login credentials")) {
          const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
            email: finalEmail,
            password: password,
          })

          if (signUpError) throw signUpError
          if (signUpData.user) return true
        }
        throw error
      }

      return !!data.user
    } catch (error) {
      console.error("Login error:", error)
      return false
    }
  }

  const logout = async () => {
    await supabase.auth.signOut()
    setUser(null)
  }

  return <AuthContext.Provider value={{ user, login, logout, isLoading }}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
