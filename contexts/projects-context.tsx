"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import type { Project } from "@/lib/types"
import { mockProjects } from "@/lib/mock-data"

interface ProjectsContextType {
  projects: Project[]
  addProject: (project: Omit<Project, "id" | "created_at" | "updated_at">) => void
  updateProject: (id: string, updates: Partial<Project>) => void
  deleteProject: (id: string) => void
  getProjectByName: (name: string) => Project | undefined
}

const ProjectsContext = createContext<ProjectsContextType | undefined>(undefined)

export function ProjectsProvider({ children }: { children: ReactNode }) {
  const [projects, setProjects] = useState<Project[]>([])
  const [isInitialized, setIsInitialized] = useState(false)

  useEffect(() => {
    const loadedProjects = localStorage.getItem("warehouse_projects")
    setProjects(loadedProjects ? JSON.parse(loadedProjects) : mockProjects)
    setIsInitialized(true)
  }, [])

  useEffect(() => {
    if (!isInitialized) return
    localStorage.setItem("warehouse_projects", JSON.stringify(projects))
  }, [projects, isInitialized])

  const addProject = (projectData: Omit<Project, "id" | "created_at" | "updated_at">) => {
    const newProject: Project = {
      ...projectData,
      id: Date.now().toString(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }
    setProjects((prev) => [...prev, newProject])
  }

  const updateProject = (id: string, updates: Partial<Project>) => {
    setProjects((prev) =>
      prev.map((project) =>
        project.id === id
          ? {
              ...project,
              ...updates,
              updated_at: new Date().toISOString(),
            }
          : project,
      ),
    )
  }

  const deleteProject = (id: string) => {
    setProjects((prev) => prev.filter((project) => project.id !== id))
  }

  const getProjectByName = (name: string) => {
    return projects.find((p) => p.name === name)
  }

  return (
    <ProjectsContext.Provider
      value={{
        projects,
        addProject,
        updateProject,
        deleteProject,
        getProjectByName,
      }}
    >
      {children}
    </ProjectsContext.Provider>
  )
}

export function useProjects() {
  const context = useContext(ProjectsContext)
  if (!context) {
    throw new Error("useProjects must be used within ProjectsProvider")
  }
  return context
}
