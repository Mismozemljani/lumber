"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Plus, Trash2, Key } from "lucide-react"
import { useUsers } from "@/contexts/users-context"

interface UserManagementDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function UserManagementDialog({ open, onOpenChange }: UserManagementDialogProps) {
  const { users, addUser, deleteUser } = useUsers()
  const [newUserName, setNewUserName] = useState("")
  const [newUserEmail, setNewUserEmail] = useState("")
  const [newUserRole, setNewUserRole] = useState<"MAGACIN_ADMIN" | "REZERVACIJA" | "PREUZIMANJE">("REZERVACIJA")
  const [newUserCode, setNewUserCode] = useState("")

  const handleAddUser = () => {
    if (!newUserName.trim()) return

    addUser({
      name: newUserName,
      email: newUserEmail || `${newUserName.toLowerCase().replace(/\s+/g, ".")}@magacin.rs`,
      role: newUserRole,
      userCode: newUserCode.trim() || undefined,
    })

    setNewUserName("")
    setNewUserEmail("")
    setNewUserRole("REZERVACIJA")
    setNewUserCode("")
  }

  const handleDeleteUser = (userId: string) => {
    deleteUser(userId)
  }

  const adminUsers = users.filter((u) => u.role === "MAGACIN_ADMIN")
  const reservationUsers = users.filter((u) => u.role === "REZERVACIJA")
  const pickupUsers = users.filter((u) => u.role === "PREUZIMANJE")

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[95vw] max-h-[90vh] overflow-y-auto resize">
        <DialogHeader>
          <DialogTitle>Upravljanje Korisnicima</DialogTitle>
          <DialogDescription>Dodajte ili uklonite korisnike za sve uloge</DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          <div className="border rounded-lg p-4">
            <h3 className="font-medium mb-4">Dodaj Novog Korisnika</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="userName">Ime i Prezime *</Label>
                <Input
                  id="userName"
                  value={newUserName}
                  onChange={(e) => setNewUserName(e.target.value)}
                  placeholder="Marko Marković"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="userEmail">Email (opciono)</Label>
                <Input
                  id="userEmail"
                  type="email"
                  value={newUserEmail}
                  onChange={(e) => setNewUserEmail(e.target.value)}
                  placeholder="marko@magacin.rs"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="userRole">Uloga *</Label>
                <Select value={newUserRole} onValueChange={(value: any) => setNewUserRole(value)}>
                  <SelectTrigger id="userRole">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="MAGACIN_ADMIN">Administrator</SelectItem>
                    <SelectItem value="REZERVACIJA">Rezervacija</SelectItem>
                    <SelectItem value="PREUZIMANJE">Preuzimanje</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="userCode" className="flex items-center gap-2">
                  <Key className="h-4 w-4" />
                  Jedinstvena Šifra (opciono)
                </Label>
                <Input
                  id="userCode"
                  value={newUserCode}
                  onChange={(e) => setNewUserCode(e.target.value)}
                  placeholder="npr. USR001"
                  maxLength={20}
                />
              </div>
            </div>
            <Button onClick={handleAddUser} className="mt-4">
              <Plus className="h-4 w-4 mr-2" />
              Dodaj Korisnika
            </Button>
          </div>

          <div className="border rounded-lg p-4">
            <h3 className="font-medium mb-4">Administratori</h3>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Ime</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Šifra</TableHead>
                  <TableHead className="w-[100px]">Akcije</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {adminUsers.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>{user.name}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell className="font-mono">{(user as any).userCode || "-"}</TableCell>
                    <TableCell>
                      <Button variant="ghost" size="sm" onClick={() => handleDeleteUser(user.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          <div className="border rounded-lg p-4">
            <h3 className="font-medium mb-4">Korisnici za Rezervacije</h3>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Ime</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Šifra</TableHead>
                  <TableHead className="w-[100px]">Akcije</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {reservationUsers.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>{user.name}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell className="font-mono">{(user as any).userCode || "-"}</TableCell>
                    <TableCell>
                      <Button variant="ghost" size="sm" onClick={() => handleDeleteUser(user.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          <div className="border rounded-lg p-4">
            <h3 className="font-medium mb-4">Korisnici za Preuzimanja</h3>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Ime</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Šifra</TableHead>
                  <TableHead className="w-[100px]">Akcije</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pickupUsers.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>{user.name}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell className="font-mono">{(user as any).userCode || "-"}</TableCell>
                    <TableCell>
                      <Button variant="ghost" size="sm" onClick={() => handleDeleteUser(user.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
