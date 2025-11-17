"use client"

import type React from "react"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Plus, Trash2, Upload, FileText, Edit } from "lucide-react"
import { useProjects } from "@/contexts/projects-context"
import type { Project } from "@/lib/types"

interface ProjectManagementDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function ProjectManagementDialog({ open, onOpenChange }: ProjectManagementDialogProps) {
  const { projects, addProject, updateProject, deleteProject } = useProjects()
  const [editingId, setEditingId] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    name: "",
    start_date: "",
    end_date: "",
    color: "#3b82f6",
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (editingId) {
      updateProject(editingId, formData)
      setEditingId(null)
    } else {
      addProject(formData)
    }
    setFormData({ name: "", start_date: "", end_date: "", color: "#3b82f6" })
  }

  const handleEdit = (project: Project) => {
    setEditingId(project.id)
    setFormData({
      name: project.name,
      start_date: project.start_date,
      end_date: project.end_date,
      color: project.color,
    })
  }

  const handlePdfUpload = (projectId: string, file: File) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      const result = e.target?.result
      if (result) {
        updateProject(projectId, {
          pdf_url: result as string,
          pdf_document: file.name,
        })
      }
    }
    reader.readAsDataURL(file)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[95vw] max-h-[90vh] overflow-y-auto resize">
        <DialogHeader>
          <DialogTitle>Upravljanje Projektima</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mb-6">
          <div className="grid grid-cols-4 gap-4">
            <div>
              <Label htmlFor="name">Naziv Projekta</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="npr. A15"
                required
              />
            </div>
            <div>
              <Label htmlFor="start_date" className="font-semibold">
                Datum Početka <span className="text-red-500">*</span>
              </Label>
              <Input
                id="start_date"
                type="date"
                value={formData.start_date}
                onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                className="cursor-pointer"
                required
              />
              <p className="text-xs text-muted-foreground mt-1">Format: DD.MM.GGGG</p>
            </div>
            <div>
              <Label htmlFor="end_date" className="font-semibold">
                Datum Završetka <span className="text-red-500">*</span>
              </Label>
              <Input
                id="end_date"
                type="date"
                value={formData.end_date}
                onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                className="cursor-pointer"
                required
              />
              <p className="text-xs text-muted-foreground mt-1">Format: DD.MM.GGGG</p>
            </div>
            <div>
              <Label htmlFor="color">Boja Projekta</Label>
              <div className="flex gap-2">
                <Input
                  id="color"
                  type="color"
                  value={formData.color}
                  onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                  className="w-20 h-10 cursor-pointer"
                  required
                />
                <Input
                  type="text"
                  value={formData.color}
                  onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                  placeholder="#3b82f6"
                  className="flex-1"
                />
              </div>
            </div>
          </div>
          <Button type="submit">
            {editingId ? (
              <>
                <Edit className="h-4 w-4 mr-2" />
                Ažuriraj Projekat
              </>
            ) : (
              <>
                <Plus className="h-4 w-4 mr-2" />
                Dodaj Projekat
              </>
            )}
          </Button>
          {editingId && (
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setEditingId(null)
                setFormData({ name: "", start_date: "", end_date: "", color: "#3b82f6" })
              }}
            >
              Otkaži
            </Button>
          )}
        </form>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Boja</TableHead>
              <TableHead>Naziv</TableHead>
              <TableHead>Početak</TableHead>
              <TableHead>Završetak</TableHead>
              <TableHead>PDF Dokument</TableHead>
              <TableHead>Akcije</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {projects.map((project) => (
              <TableRow key={project.id}>
                <TableCell>
                  <div
                    className="w-8 h-8 rounded border border-slate-300"
                    style={{ backgroundColor: project.color }}
                    title={project.color}
                  />
                </TableCell>
                <TableCell className="font-medium">{project.name}</TableCell>
                <TableCell>{new Date(project.start_date).toLocaleDateString("sr-RS")}</TableCell>
                <TableCell>{new Date(project.end_date).toLocaleDateString("sr-RS")}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    {project.pdf_url ? (
                      <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm" asChild>
                          <a href={project.pdf_url} target="_blank" rel="noopener noreferrer">
                            <FileText className="h-4 w-4 mr-2" />
                            Pregled
                          </a>
                        </Button>
                        <span className="text-sm text-muted-foreground">{project.pdf_document}</span>
                      </div>
                    ) : (
                      <Label htmlFor={`pdf-${project.id}`} className="cursor-pointer">
                        <Button variant="outline" size="sm" asChild>
                          <span>
                            <Upload className="h-4 w-4 mr-2" />
                            Dodaj PDF
                          </span>
                        </Button>
                        <Input
                          id={`pdf-${project.id}`}
                          type="file"
                          accept=".pdf"
                          className="hidden"
                          onChange={(e) => {
                            const file = e.target.files?.[0]
                            if (file) handlePdfUpload(project.id, file)
                          }}
                        />
                      </Label>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => handleEdit(project)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="destructive" size="sm" onClick={() => deleteProject(project.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </DialogContent>
    </Dialog>
  )
}
