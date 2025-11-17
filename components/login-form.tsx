"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useAuth } from "@/contexts/auth-context"
import { useToast } from "@/hooks/use-toast"

export function LoginForm() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const { login } = useAuth()
  const router = useRouter()
  const { toast } = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const success = await login(email, password)

      if (success) {
        toast({
          title: "Uspešna prijava",
          description: "Dobrodošli u sistem upravljanja magacinom.",
        })
        router.push("/dashboard")
      } else {
        toast({
          title: "Greška",
          description: "Pogrešan email ili lozinka.",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Greška",
        description: "Došlo je do greške prilikom prijave.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="text-2xl">Prijava</CardTitle>
        <CardDescription>Unesite vaše podatke za pristup sistemu</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="korisnik@magacin.rs"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Lozinka</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? "Prijava..." : "Prijavite se"}
          </Button>
        </form>
        <div className="mt-4 text-sm text-muted-foreground">
          <p className="font-semibold mb-2">Demo nalozi:</p>
          <ul className="space-y-1 text-xs">
            <li>Admin: admin@magacin.rs</li>
            <li>Rezervacija: rezervacija@magacin.rs</li>
            <li>Preuzimanje: preuzimanje@magacin.rs</li>
          </ul>
          <p className="mt-2 text-xs">Lozinka: bilo šta</p>
        </div>
      </CardContent>
    </Card>
  )
}
