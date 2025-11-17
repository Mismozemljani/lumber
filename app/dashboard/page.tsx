"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import { AdminDashboard } from "@/components/admin-dashboard"
import { ReservationDashboard } from "@/components/reservation-dashboard"
import { PickupDashboard } from "@/components/pickup-dashboard"

export default function DashboardPage() {
  const { user, isLoading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/")
    }
  }, [user, isLoading, router])

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Učitavanje...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <div className="min-h-screen bg-background">
      {user.role === "MAGACIN_ADMIN" && <AdminDashboard />}
      {user.role === "REZERVACIJA" && <ReservationDashboard />}
      {user.role === "PREUZIMANJE" && <PickupDashboard />}
    </div>
  )
}
