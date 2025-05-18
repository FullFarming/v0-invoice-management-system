"use client"

import type React from "react"

import { createContext, useContext, useEffect, useState } from "react"

type User = {
  id: string
  email: string
  name: string
  role: "owner" | "member"
  team?: string
}

type AuthContextType = {
  user: User | null
  loading: boolean
  login: (email: string, password: string) => Promise<void>
  logout: () => void
  isOwner: () => boolean
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  login: async () => {},
  logout: () => {},
  isOwner: () => false,
})

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // 실제 구현에서는 세션 또는 토큰을 확인하여 사용자 정보를 가져옵니다
    const checkAuth = async () => {
      try {
        // 예시 사용자 데이터 (실제로는 API 호출로 대체)
        const userData = {
          id: "1",
          email: "user@example.com",
          name: "사용자",
          role: "owner" as const,
          team: "영업팀",
        }
        setUser(userData)
      } catch (error) {
        setUser(null)
      } finally {
        setLoading(false)
      }
    }

    checkAuth()
  }, [])

  const login = async (email: string, password: string) => {
    setLoading(true)
    try {
      // 실제 구현에서는 API 호출로 로그인 처리
      const userData = {
        id: "1",
        email,
        name: "사용자",
        role: "owner" as const,
        team: "영업팀",
      }
      setUser(userData)
    } catch (error) {
      throw new Error("로그인에 실패했습니다")
    } finally {
      setLoading(false)
    }
  }

  const logout = () => {
    setUser(null)
  }

  const isOwner = () => {
    return user?.role === "owner"
  }

  return <AuthContext.Provider value={{ user, loading, login, logout, isOwner }}>{children}</AuthContext.Provider>
}

export const useAuth = () => useContext(AuthContext)
