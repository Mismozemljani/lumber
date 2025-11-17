import type React from "react"
import type { Metadata } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import { UsersProvider } from "@/contexts/users-context"
import { AuthProvider } from "@/contexts/auth-context"
import { ItemsProvider } from "@/contexts/items-context"
import { ProjectsProvider } from "@/contexts/projects-context"
import { Toaster } from "@/components/ui/toaster"
import "./globals.css"

const _geist = Geist({ subsets: ["latin"] })
const _geistMono = Geist_Mono({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Magacin Sistem",
  description: "Sistem za upravljanje magacinom",
  generator: "v0.app",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="sr">
      <body className={`font-sans antialiased`}>
        <UsersProvider>
          <AuthProvider>
            <ProjectsProvider>
              <ItemsProvider>
                {children}
                <Toaster />
              </ItemsProvider>
            </ProjectsProvider>
          </AuthProvider>
        </UsersProvider>
        <Analytics />
      </body>
    </html>
  )
}
