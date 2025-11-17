"use client"

import { useState, useRef, useEffect } from "react"
import { DashboardHeader } from "@/components/dashboard-header"
import { ItemsTable } from "@/components/items-table"
import { AddItemDialog } from "@/components/add-item-dialog"
import { ImportDialog } from "@/components/import-dialog"
import { ProjectReportDialog } from "@/components/project-report-dialog"
import { SupplierReportDialog } from "@/components/supplier-report-dialog"
import { NameReportDialog } from "@/components/name-report-dialog"
import { CodeReportDialog } from "@/components/code-report-dialog"
import { LocationReportDialog } from "@/components/location-report-dialog"
import { UserManagementDialog } from "@/components/user-management-dialog"
import { ProjectManagementDialog } from "@/components/project-management-dialog"
import { ProjectCalendar } from "@/components/project-calendar"
import { PdfViewerDialog } from "@/components/pdf-viewer-dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Plus, FileText, TrendingUp, Upload, Users, Hash, Type, RefreshCw, MapPin, Calendar, FolderKanban, Search, Download } from 'lucide-react'
import { useItems } from "@/contexts/items-context"
import { useProjects } from "@/contexts/projects-context"
import type { ImportRow, Project } from "@/lib/types"

export function AdminDashboard() {
  const { items, inputHistory, reservations, pickups, addItem, updateItem, deleteItem, refreshAll } = useItems()
  const { projects } = useProjects()
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isImportDialogOpen, setIsImportDialogOpen] = useState(false)
  const [selectedProject, setSelectedProject] = useState<string | null>(null)
  const [isSupplierReportOpen, setIsSupplierReportOpen] = useState(false)
  const [isNameReportOpen, setIsNameReportOpen] = useState(false)
  const [isCodeReportOpen, setIsCodeReportOpen] = useState(false)
  const [isLocationReportOpen, setIsLocationReportOpen] = useState(false)
  const [isUserManagementOpen, setIsUserManagementOpen] = useState(false)
  const [isProjectManagementOpen, setIsProjectManagementOpen] = useState(false)
  const [isCalendarOpen, setIsCalendarOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [pdfViewerState, setPdfViewerState] = useState<{ open: boolean; url: string; title: string }>({
    open: false,
    url: "",
    title: "",
  })

  const projectNames = Array.from(new Set(items.map((item) => item.project).filter(Boolean)))

  const filteredItems = items.filter((item) => {
    const query = searchQuery.toLowerCase()
    return (
      (item.code && item.code.toLowerCase().includes(query)) ||
      (item.name && item.name.toLowerCase().includes(query)) ||
      (item.project && item.project.toLowerCase().includes(query)) ||
      (item.supplier && item.supplier.toLowerCase().includes(query)) ||
      (item.lokacija && item.lokacija.toLowerCase().includes(query))
    )
  })

  const handleAddItem = (newItem: Parameters<typeof addItem>[0]) => {
    addItem(newItem)
    setIsAddDialogOpen(false)
  }

  const handleImport = (rows: ImportRow[]) => {
    rows.forEach((row) => {
      addItem({
        code: row.code,
        project: row.project || "Skladište",
        name: row.name,
        supplier: row.supplier,
        price: row.price,
        input: row.input,
        lokacija: row.lokacija,
        okov_ime: row.okov_ime,
        okov_cena: row.okov_cena,
        okov_kom: row.okov_kom,
        ploce_ime: row.ploce_ime,
        ploce_cena: row.ploce_cena,
        ploce_kom: row.ploce_kom,
        low_stock_threshold: row.low_stock_threshold || 10,
      })
    })
  }

  const handleViewPdf = (projectNameOrObj: string | Project) => {
    let project: Project | undefined

    if (typeof projectNameOrObj === "string") {
      project = projects.find((p) => p.name === projectNameOrObj)
    } else {
      project = projectNameOrObj
    }

    if (project?.pdf_url) {
      setPdfViewerState({
        open: true,
        url: project.pdf_url,
        title: `${project.name} - ${project.pdf_document || "PDF Dokument"}`,
      })
    }
  }

  const handleDownloadSample = () => {
    const headers = "šifra,projekat,naziv,dobavljač,cena,ulaz,lokacija\n"
    const rows = items
      .map(
        (item) =>
          `${item.code || ""},${item.project || ""},${item.name || ""},${item.supplier || ""},${item.price || 0},${item.input || 0},${item.lokacija || ""}`,
      )
      .join("\n")
    const csvContent = headers + rows

    const blob = new Blob(["\ufeff" + csvContent], { type: "text/csv;charset=utf-8;" })
    const link = document.createElement("a")
    link.href = URL.createObjectURL(blob)
    link.download = "primer-magacin-import.csv"
    link.click()
  }

  const topScrollRef = useRef<HTMLDivElement>(null)
  const tableScrollRef = useRef<HTMLDivElement>(null)
  const topScrollContentRef = useRef<HTMLDivElement>(null)

  // Sync scrollbars
  useEffect(() => {
    const topScroll = topScrollRef.current
    const tableScroll = tableScrollRef.current

    if (!topScroll || !tableScroll) return

    const handleTopScroll = () => {
      if (tableScroll) {
        tableScroll.scrollLeft = topScroll.scrollLeft
      }
    }

    const handleTableScroll = () => {
      if (topScroll) {
        topScroll.scrollLeft = tableScroll.scrollLeft
      }
    }

    topScroll.addEventListener("scroll", handleTopScroll)
    tableScroll.addEventListener("scroll", handleTableScroll)

    return () => {
      topScroll.removeEventListener("scroll", handleTopScroll)
      tableScroll.removeEventListener("scroll", handleTableScroll)
    }
  }, [])

  // Update top scrollbar width to match table width
  useEffect(() => {
    const updateScrollbarWidth = () => {
      const tableScroll = tableScrollRef.current
      const topScrollContent = topScrollContentRef.current

      if (tableScroll && topScrollContent) {
        const tableWidth = tableScroll.scrollWidth
        topScrollContent.style.width = `${tableWidth}px`
      }
    }

    // Update immediately and after delays to ensure table is rendered
    updateScrollbarWidth()
    const timeoutId1 = setTimeout(updateScrollbarWidth, 100)
    const timeoutId2 = setTimeout(updateScrollbarWidth, 500)

    window.addEventListener("resize", updateScrollbarWidth)

    return () => {
      clearTimeout(timeoutId1)
      clearTimeout(timeoutId2)
      window.removeEventListener("resize", updateScrollbarWidth)
    }
  }, [filteredItems, isCalendarOpen])

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <DashboardHeader />
      <main className="container mx-auto px-4 py-6">
        <div className="flex items-center justify-end mb-6">
          <div className="flex gap-2 flex-wrap">
            <Button variant="outline" onClick={refreshAll} title="Osveži podatke">
              <RefreshCw className="h-4 w-4 mr-2" />
              Osveži
            </Button>
            <Button variant="outline" onClick={() => setIsCalendarOpen(!isCalendarOpen)}>
              <Calendar className="h-4 w-4 mr-2" />
              Kalendar
            </Button>
            <Button variant="outline" onClick={() => setIsProjectManagementOpen(true)}>
              <FolderKanban className="h-4 w-4 mr-2" />
              Projekti
            </Button>
            <Button variant="outline" onClick={() => setIsUserManagementOpen(true)}>
              <Users className="h-4 w-4 mr-2" />
              Korisnici
            </Button>
            <Button variant="outline" onClick={() => setIsLocationReportOpen(true)}>
              <MapPin className="h-4 w-4 mr-2" />
              Izveštaj po Lokaciji
            </Button>
            <Button variant="outline" onClick={() => setIsNameReportOpen(true)}>
              <Type className="h-4 w-4 mr-2" />
              Izveštaj po Nazivu
            </Button>
            <Button variant="outline" onClick={() => setIsCodeReportOpen(true)}>
              <Hash className="h-4 w-4 mr-2" />
              Izveštaj po Šifri
            </Button>
            <Button variant="outline" onClick={() => setIsSupplierReportOpen(true)}>
              <TrendingUp className="h-4 w-4 mr-2" />
              Izveštaj po Dobavljačima
            </Button>
            <Button variant="ghost" onClick={handleDownloadSample}>
              <Download className="h-4 w-4 mr-2" />
              Preuzmi Primer
            </Button>
            <Button variant="outline" onClick={() => setIsImportDialogOpen(true)}>
              <Upload className="h-4 w-4 mr-2" />
              Uvezi iz Excel
            </Button>
            <Button onClick={() => setIsAddDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Dodaj Artikal
            </Button>
          </div>
        </div>

        <div className="mb-4">
          <div className="relative max-w-sm">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Pretraži po šifri, nazivu, projektu..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {projectNames.length > 0 && (
          <div className="mb-6">
            <h3 className="text-sm font-medium mb-3">Brzi pristup projektima:</h3>
            <div className="flex flex-wrap gap-2">
              {projectNames.map((projectName) => {
                const project = projects.find((p) => p.name === projectName)
                return (
                  <div key={projectName} className="flex gap-1 items-center">
                    <Button variant="outline" size="sm" onClick={() => setSelectedProject(projectName)}>
                      <FileText className="h-4 w-4 mr-2" />
                      {projectName}
                    </Button>
                    {project?.pdf_url && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleViewPdf(project)}
                        title={`Pregled ${project.pdf_document || "PDF"}`}
                      >
                        <FileText className="h-4 w-4 text-red-600" />
                      </Button>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        )}

        <div className={isCalendarOpen ? "grid lg:grid-cols-[1fr_70%] gap-4" : ""}>
          <div className={isCalendarOpen ? "overflow-auto" : ""}>
            <div className="border rounded-lg bg-card overflow-hidden">
              <div
                ref={topScrollRef}
                className="overflow-x-auto overflow-y-hidden bg-slate-200 dark:bg-slate-700 border-b border-slate-300 dark:border-slate-600"
                style={{ height: "18px" }}
              >
                <div ref={topScrollContentRef} style={{ height: "1px", width: "100%" }} />
              </div>
              <div ref={tableScrollRef} className="max-h-[280px] overflow-auto">
                <ItemsTable
                  items={filteredItems}
                  inputHistory={inputHistory}
                  reservations={reservations}
                  pickups={pickups}
                  onUpdateItem={updateItem}
                  onDeleteItem={deleteItem}
                  isAdmin={true}
                />
              </div>
            </div>
          </div>
          {isCalendarOpen && (
            <div className="overflow-auto">
              <ProjectCalendar
                projects={projects}
                reservations={reservations}
                pickups={pickups}
                items={items}
                onClose={() => setIsCalendarOpen(false)}
                onViewPdf={handleViewPdf}
              />
            </div>
          )}
        </div>

        <AddItemDialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen} onAddItem={handleAddItem} />
        <ImportDialog open={isImportDialogOpen} onOpenChange={setIsImportDialogOpen} onImport={handleImport} />

        {selectedProject && (
          <ProjectReportDialog
            project={selectedProject}
            items={items}
            open={!!selectedProject}
            onOpenChange={(open) => !open && setSelectedProject(null)}
          />
        )}
        <SupplierReportDialog open={isSupplierReportOpen} onOpenChange={setIsSupplierReportOpen} />
        <NameReportDialog open={isNameReportOpen} onOpenChange={setIsNameReportOpen} />
        <CodeReportDialog open={isCodeReportOpen} onOpenChange={setIsCodeReportOpen} />
        <LocationReportDialog open={isLocationReportOpen} onOpenChange={setIsLocationReportOpen} />
        <UserManagementDialog open={isUserManagementOpen} onOpenChange={setIsUserManagementOpen} />
        <ProjectManagementDialog open={isProjectManagementOpen} onOpenChange={setIsProjectManagementOpen} />
        <PdfViewerDialog
          open={pdfViewerState.open}
          onOpenChange={(open) => setPdfViewerState({ ...pdfViewerState, open })}
          pdfUrl={pdfViewerState.url}
          title={pdfViewerState.title}
        />
      </main>
    </div>
  )
}
