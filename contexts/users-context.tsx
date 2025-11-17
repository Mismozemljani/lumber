"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import type { User } from "@/lib/types"
import { mockUsers } from "@/lib/mock-data"

interface UsersContextType {
  users: User[]
  addUser: (user: Omit<User, "id">) => void
  updateUser: (id: string, updates: Partial<User>) => void
  deleteUser: (id: string) => void
  getUserByEmail: (email: string) => User | undefined
}

const UsersContext = createContext<UsersContextType | undefined>(undefined)

export function UsersProvider({ children }: { children: ReactNode }) {
  const [users, setUsers] = useState<User[]>([])
  const [isInitialized, setIsInitialized] = useState(false)

  // Load users from localStorage on mount
  useEffect(() => {
    const loadedUsers = localStorage.getItem("warehouse_users")
    setUsers(loadedUsers ? JSON.parse(loadedUsers) : mockUsers)
    setIsInitialized(true)
  }, [])

  // Save users to localStorage whenever they change
  useEffect(() => {
    if (!isInitialized) return
    localStorage.setItem("warehouse_users", JSON.stringify(users))
  }, [users, isInitialized])

  const addUser = (userData: Omit<User, "id">) => {
    const newUser: User = {
      ...userData,
      id: Date.now().toString(),
    }
    setUsers((prev) => [...prev, newUser])
  }

  const updateUser = (id: string, updates: Partial<User>) => {
    setUsers((prev) =>
      prev.map((user) =>
        user.id === id
          ? {
              ...user,
              ...updates,
            }
          : user,
      ),
    )
  }

  const deleteUser = (id: string) => {
    setUsers((prev) => prev.filter((user) => user.id !== id))
  }

  const getUserByEmail = (email: string) => {
    return users.find((u) => u.email === email)
  }

  return (
    <UsersContext.Provider
      value={{
        users,
        addUser,
        updateUser,
        deleteUser,
        getUserByEmail,
      }}
    >
      {children}
    </UsersContext.Provider>
  )
}

export function useUsers() {
  const context = useContext(UsersContext)
  if (!context) {
    throw new Error("useUsers must be used within UsersProvider")
  }
  return context
}
