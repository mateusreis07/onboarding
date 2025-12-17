"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Checkbox } from "@/components/ui/checkbox"
import { PERMISSIONS, PERMISSION_LABELS } from "@/lib/permissions"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Loader2, Settings } from "lucide-react"

interface RolePermission {
  role: string
  permission: string
}

interface SystemRole {
  id: string
  code: string
  label: string
  isActive: boolean
}

export default function PermissionsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [rolePermissions, setRolePermissions] = useState<RolePermission[]>([])
  const [systemRoles, setSystemRoles] = useState<SystemRole[]>([])
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(false)

  useEffect(() => {
    if (status === "loading") return
    if (!session || session.user?.role !== "HR") {
      router.push("/dashboard")
      return
    }
    fetchData()
  }, [session, status, router])

  async function fetchData() {
    try {
      const [permRes, rolesRes] = await Promise.all([
        fetch("/api/admin/permissions"),
        fetch("/api/admin/system/roles")
      ])
      if (permRes.ok) setRolePermissions(await permRes.json())
      if (rolesRes.ok) {
        const roles = await rolesRes.json()
        // Only show active roles
        setSystemRoles(roles.filter((r: SystemRole) => r.isActive))
      }
    } catch (e) { console.error(e) }
    finally { setLoading(false) }
  }

  async function handleToggle(role: string, permission: string, checked: boolean) {
    // Optimistic update
    const original = [...rolePermissions]
    if (checked) {
      setRolePermissions([...original, { role, permission }])
    } else {
      setRolePermissions(original.filter(rp => !(rp.role === role && rp.permission === permission)))
    }

    setUpdating(true)
    try {
      await fetch("/api/admin/permissions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role, permission, enabled: checked })
      })
    } catch (e) {
      // Revert
      setRolePermissions(original)
      console.error(e)
    } finally {
      setUpdating(false)
    }
  }

  const hasPermission = (role: string, permission: string) => {
    return rolePermissions.some(rp => rp.role === role && rp.permission === permission)
  }

  if (loading) return <div className="p-8 flex items-center gap-2"><Loader2 className="animate-spin" /> Carregando permissões...</div>

  // Group Permissions by category
  const groups = {
    "Páginas": Object.values(PERMISSIONS).filter(p => p.startsWith("view_") && p !== PERMISSIONS.VIEW_ANALYTICS),
    "Funcionalidades de Gestão": [
      PERMISSIONS.VIEW_ANALYTICS,
      ...Object.values(PERMISSIONS).filter(p => !p.startsWith("view_"))
    ],
  }

  return (
    <div className="p-8 space-y-8">
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Gestão de Permissões de Acesso</h2>
          <p className="text-muted-foreground">Configure quais funcionalidades cada perfil de usuário pode acessar.</p>
        </div>
        <Button variant="outline" onClick={() => router.push("/dashboard/settings/system")}>
          <Settings className="mr-2 h-4 w-4" />
          Gerenciar Funções
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Matriz de Permissões</CardTitle>
          <CardDescription>
            Marque para conceder acesso. {systemRoles.length} função(ões) ativa(s).
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[300px]">Funcionalidade</TableHead>
                {systemRoles.map(role => (
                  <TableHead key={role.code} className="text-center" title={role.label}>
                    {role.label}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {Object.entries(groups).map(([groupName, perms]) => (
                <>
                  <TableRow key={groupName} className="bg-gray-50 hover:bg-gray-50">
                    <TableCell colSpan={systemRoles.length + 1} className="font-semibold text-gray-900 py-3">
                      {groupName}
                    </TableCell>
                  </TableRow>
                  {perms.map(perm => (
                    <TableRow key={perm}>
                      <TableCell className="font-medium text-gray-700">
                        {PERMISSION_LABELS[perm] || perm}
                      </TableCell>
                      {systemRoles.map(role => (
                        <TableCell key={`${role.code}-${perm}`} className="text-center">
                          <Checkbox
                            checked={hasPermission(role.code, perm)}
                            onCheckedChange={(c) => handleToggle(role.code, perm, c as boolean)}
                            disabled={role.code === "HR"}
                            title={role.code === "HR" ? "RH Admin sempre possui acesso total" : `${role.label}: ${PERMISSION_LABELS[perm]}`}
                          />
                        </TableCell>
                      ))}
                    </TableRow>
                  ))}
                </>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
