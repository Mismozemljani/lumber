"use client"

import { useAuth } from "@/contexts/auth-context"
import { Button } from "@/components/ui/button"
import { LogOut } from "lucide-react"
import { useRouter } from "next/navigation"
import Image from "next/image"

export function DashboardHeader() {
  const { user, logout } = useAuth()
  const router = useRouter()

  const handleLogout = () => {
    logout()
    router.push("/")
  }

  return (
    <header className="bg-card">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Image
              src="/images/lumberline-logo.png"
              alt="Lumberline Logo"
              width={180}
              height={60}
              className="object-contain"
              priority
            />
          </div>
          <div className="flex items-center gap-4">
            <span className="font-medium text-sm">{user?.name}</span>
            <Button variant="outline" size="sm" onClick={handleLogout}>
              <LogOut className="h-4 w-4 mr-2" />
              Odjava
            </Button>
          </div>
        </div>
      </div>
    </header>
  )
}
