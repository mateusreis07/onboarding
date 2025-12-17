"use client"

import { useState } from "react"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { LayoutDashboard, Users, FileText, Settings, LogOut, CheckSquare, BookOpen, Shield, Calendar, BarChart, Lock } from "lucide-react"
import { signOut, useSession } from "next-auth/react"
import { PERMISSIONS } from "@/lib/permissions"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

interface SidebarProps extends React.HTMLAttributes<HTMLDivElement> { }

export function Sidebar({ className }: SidebarProps) {
  const pathname = usePathname()
  const { data: session } = useSession()
  const [isLogoutDialogOpen, setIsLogoutDialogOpen] = useState(false)

  // Permissions Logic
  // Fallback to HR check if permissions array is missing (e.g. before re-login)
  const userPermissions = (session?.user as any)?.permissions || []
  const userRole = session?.user?.role

  const hasPermission = (p: string) => {
    // IF Permissions array exists, use it.
    if (userPermissions && userPermissions.length > 0) return userPermissions.includes(p)
    // Fallback for immediate rigorous HR check or if something failed
    if (userRole === "HR") return true

    // Default basic allow for dashboard if really nothing exists? No.
    return false
  }

  // Determine visibility of sections
  const showManagement = [
    PERMISSIONS.MANAGE_EMPLOYEES,
    PERMISSIONS.MANAGE_TEMPLATES,
    PERMISSIONS.MANAGE_POLICIES,
    PERMISSIONS.MANAGE_LIBRARY,
    PERMISSIONS.MANAGE_TRAININGS,
    PERMISSIONS.MANAGE_CALENDAR,
    PERMISSIONS.VIEW_ANALYTICS,
    PERMISSIONS.MANAGE_PERMISSIONS
  ].some(p => hasPermission(p))

  return (
    <div className={cn("pb-12 w-64 border-r min-h-screen bg-white dark:bg-gray-950", className)}>
      <div className="space-y-4 py-4">
        <div className="px-3 py-2">
          <h2 className="mb-2 px-4 text-lg font-semibold tracking-tight">
            Onboarding
          </h2>
          <div className="space-y-1">
            {hasPermission(PERMISSIONS.VIEW_DASHBOARD) && (
              <Link href="/dashboard">
                <Button variant={pathname === "/dashboard" ? "secondary" : "ghost"} className="w-full justify-start">
                  <LayoutDashboard className="mr-2 h-4 w-4" />
                  Painel
                </Button>
              </Link>
            )}
            {hasPermission(PERMISSIONS.VIEW_TASKS) && (
              <Link href="/dashboard/tasks">
                <Button variant={pathname === "/dashboard/tasks" ? "secondary" : "ghost"} className="w-full justify-start">
                  <CheckSquare className="mr-2 h-4 w-4" />
                  Minhas Tarefas
                </Button>
              </Link>
            )}

            {hasPermission(PERMISSIONS.VIEW_DOCUMENTS) && (
              <Link href="/dashboard/policies">
                <Button variant={pathname === "/dashboard/policies" ? "secondary" : "ghost"} className="w-full justify-start">
                  <Shield className="mr-2 h-4 w-4" />
                  Jurídico
                </Button>
              </Link>
            )}

            {hasPermission(PERMISSIONS.VIEW_DOCUMENTS) && (
              <Link href="/dashboard/documents">
                <Button variant={pathname === "/dashboard/documents" ? "secondary" : "ghost"} className="w-full justify-start">
                  <FileText className="mr-2 h-4 w-4" />
                  Documentos
                </Button>
              </Link>
            )}

            {hasPermission(PERMISSIONS.VIEW_TRAININGS) && (
              <Link href="/dashboard/trainings">
                <Button variant={pathname.startsWith("/dashboard/trainings") && !pathname.includes("manage") ? "secondary" : "ghost"} className="w-full justify-start">
                  <BookOpen className="mr-2 h-4 w-4" />
                  Treinamentos
                </Button>
              </Link>
            )}

            {hasPermission(PERMISSIONS.VIEW_CALENDAR) && (
              <Link href="/dashboard/calendar">
                <Button variant={pathname === "/dashboard/calendar" ? "secondary" : "ghost"} className="w-full justify-start">
                  <Calendar className="mr-2 h-4 w-4" />
                  Agenda
                </Button>
              </Link>
            )}

            {hasPermission(PERMISSIONS.VIEW_FEEDBACK) && (
              <Link href="/dashboard/feedback">
                <Button variant={pathname.startsWith("/dashboard/feedback") ? "secondary" : "ghost"} className="w-full justify-start">
                  <BarChart className="mr-2 h-4 w-4" />
                  Avaliações
                </Button>
              </Link>
            )}
          </div>
        </div>

        {/* Management Section */}
        {showManagement && (
          <div className="px-3 py-2">
            <h2 className="mb-2 px-4 text-lg font-semibold tracking-tight">Gestão</h2>
            <div className="space-y-1">
              {hasPermission(PERMISSIONS.VIEW_ANALYTICS) && (
                <Link href="/dashboard/analytics">
                  <Button variant={pathname.startsWith("/dashboard/analytics") ? "secondary" : "ghost"} className="w-full justify-start">
                    <BarChart className="mr-2 h-4 w-4" />
                    Painel de Gestão
                  </Button>
                </Link>
              )}

              {hasPermission(PERMISSIONS.MANAGE_EMPLOYEES) && (
                <Link href="/dashboard/employees">
                  <Button variant={pathname === "/dashboard/employees" ? "secondary" : "ghost"} className="w-full justify-start">
                    <Users className="mr-2 h-4 w-4" />
                    Colaboradores
                  </Button>
                </Link>
              )}
              {hasPermission(PERMISSIONS.MANAGE_TEMPLATES) && (
                <Link href="/dashboard/templates">
                  <Button variant={pathname === "/dashboard/templates" ? "secondary" : "ghost"} className="w-full justify-start">
                    <FileText className="mr-2 h-4 w-4" />
                    Templates Tarefas
                  </Button>
                </Link>
              )}

              {hasPermission(PERMISSIONS.MANAGE_POLICIES) && (
                <Link href="/dashboard/policies/management">
                  <Button variant={pathname.startsWith("/dashboard/policies/management") ? "secondary" : "ghost"} className="w-full justify-start">
                    <Shield className="mr-2 h-4 w-4" />
                    Gestão de Jurídico
                  </Button>
                </Link>
              )}

              {hasPermission(PERMISSIONS.MANAGE_LIBRARY) && (
                <Link href="/dashboard/documents/manage">
                  <Button variant={pathname.startsWith("/dashboard/documents/manage") ? "secondary" : "ghost"} className="w-full justify-start">
                    <BookOpen className="mr-2 h-4 w-4" />
                    Gestão de Documentos
                  </Button>
                </Link>
              )}

              {hasPermission(PERMISSIONS.MANAGE_TRAININGS) && (
                <Link href="/dashboard/trainings/manage">
                  <Button variant={pathname.startsWith("/dashboard/trainings/manage") ? "secondary" : "ghost"} className="w-full justify-start">
                    <BookOpen className="mr-2 h-4 w-4" />
                    Gestão de Treinamentos
                  </Button>
                </Link>
              )}

              {hasPermission(PERMISSIONS.MANAGE_CALENDAR) && (
                <Link href="/dashboard/calendar/templates">
                  <Button variant={pathname === "/dashboard/calendar/templates" ? "secondary" : "ghost"} className="w-full justify-start">
                    <Calendar className="mr-2 h-4 w-4" />
                    Templates de Agendas
                  </Button>
                </Link>
              )}

              {hasPermission(PERMISSIONS.MANAGE_PERMISSIONS) && (
                <Link href="/dashboard/settings/permissions">
                  <Button variant={pathname === "/dashboard/settings/permissions" ? "secondary" : "ghost"} className="w-full justify-start">
                    <Lock className="mr-2 h-4 w-4" />
                    Permissões de Acesso
                  </Button>
                </Link>
              )}

              {hasPermission(PERMISSIONS.MANAGE_PERMISSIONS) && (
                <Link href="/dashboard/settings/system">
                  <Button variant={pathname === "/dashboard/settings/system" ? "secondary" : "ghost"} className="w-full justify-start">
                    <Settings className="mr-2 h-4 w-4" />
                    Configurações do Sistema
                  </Button>
                </Link>
              )}
            </div>
          </div>
        )}

        {/* Settings & Logout */}
        <div className="mt-auto px-3 py-2">
          <div className="space-y-1">
            {hasPermission(PERMISSIONS.VIEW_SETTINGS) && (
              <Link href="/dashboard/settings">
                <Button variant={pathname === "/dashboard/settings" ? "secondary" : "ghost"} className="w-full justify-start">
                  <Settings className="mr-2 h-4 w-4" />
                  Configurações
                </Button>
              </Link>
            )}
          </div>
        </div>

        <div className="px-3 py-2 mt-auto">
          <Button
            variant="ghost"
            className="w-full justify-start text-red-500 hover:text-red-600 hover:bg-red-50"
            onClick={() => setIsLogoutDialogOpen(true)}
          >
            <LogOut className="mr-2 h-4 w-4" />
            Sair
          </Button>
        </div>
      </div>

      <Dialog open={isLogoutDialogOpen} onOpenChange={setIsLogoutDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmar Saída</DialogTitle>
            <DialogDescription>
              Tem certeza que deseja sair do sistema?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsLogoutDialogOpen(false)}>
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={() => signOut({ callbackUrl: "/login" })}
            >
              Sim, Sair
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
