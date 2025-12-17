import { prisma } from "@/lib/prisma"

export const PERMISSIONS = {
  // Pages
  VIEW_DASHBOARD: "view_dashboard",
  VIEW_TASKS: "view_tasks",
  VIEW_DOCUMENTS: "view_documents",
  VIEW_TRAININGS: "view_trainings",
  VIEW_CALENDAR: "view_calendar",
  VIEW_FEEDBACK: "view_feedback",
  VIEW_SETTINGS: "view_settings",

  // Management Features
  MANAGE_EMPLOYEES: "manage_employees",
  MANAGE_TEMPLATES: "manage_templates",
  MANAGE_POLICIES: "manage_policies",
  MANAGE_LIBRARY: "manage_library",
  MANAGE_TRAININGS: "manage_trainings",
  MANAGE_CALENDAR: "manage_calendar",
  VIEW_ANALYTICS: "view_analytics",

  // System
  MANAGE_PERMISSIONS: "manage_permissions",
}

export const PERMISSION_LABELS: Record<string, string> = {
  [PERMISSIONS.VIEW_DASHBOARD]: "Painel",
  [PERMISSIONS.VIEW_TASKS]: "Minhas Tarefas",
  [PERMISSIONS.VIEW_DOCUMENTS]: "Documentos / Jurídico",
  [PERMISSIONS.VIEW_TRAININGS]: "Treinamentos",
  [PERMISSIONS.VIEW_CALENDAR]: "Agenda",
  [PERMISSIONS.VIEW_FEEDBACK]: "Avaliações",
  [PERMISSIONS.VIEW_SETTINGS]: "Configurações",
  [PERMISSIONS.MANAGE_EMPLOYEES]: "Colaboradores",
  [PERMISSIONS.MANAGE_TEMPLATES]: "Templates Tarefas",
  [PERMISSIONS.MANAGE_POLICIES]: "Gestão de Jurídico",
  [PERMISSIONS.MANAGE_LIBRARY]: "Gestão de Documentos",
  [PERMISSIONS.MANAGE_TRAININGS]: "Gestão de Treinamentos",
  [PERMISSIONS.MANAGE_CALENDAR]: "Templates de Agendas",
  [PERMISSIONS.VIEW_ANALYTICS]: "Painel de Gestão",
  [PERMISSIONS.MANAGE_PERMISSIONS]: "Permissões de Acesso",
}

// Default assignment to ensure system works on first run
export async function seedPermissions() {
  // Check if any permission exists
  const count = await prisma.rolePermission.count()
  if (count > 0) return

  // Define defaults
  const defaults = [
    // HR has EVERYTHING
    ...Object.values(PERMISSIONS).map(p => ({ role: "HR", permission: p })),

    // MANAGER has Management Access + Basic
    { role: "MANAGER", permission: PERMISSIONS.VIEW_DASHBOARD },
    { role: "MANAGER", permission: PERMISSIONS.VIEW_TASKS },
    { role: "MANAGER", permission: PERMISSIONS.VIEW_DOCUMENTS },
    { role: "MANAGER", permission: PERMISSIONS.VIEW_TRAININGS },
    { role: "MANAGER", permission: PERMISSIONS.VIEW_CALENDAR },
    { role: "MANAGER", permission: PERMISSIONS.VIEW_FEEDBACK },
    { role: "MANAGER", permission: PERMISSIONS.VIEW_SETTINGS },
    { role: "MANAGER", permission: PERMISSIONS.MANAGE_POLICIES },
    { role: "MANAGER", permission: PERMISSIONS.MANAGE_LIBRARY },
    { role: "MANAGER", permission: PERMISSIONS.VIEW_ANALYTICS },

    // EMPLOYEE has Basic
    { role: "EMPLOYEE", permission: PERMISSIONS.VIEW_DASHBOARD },
    { role: "EMPLOYEE", permission: PERMISSIONS.VIEW_TASKS },
    { role: "EMPLOYEE", permission: PERMISSIONS.VIEW_DOCUMENTS },
    { role: "EMPLOYEE", permission: PERMISSIONS.VIEW_TRAININGS },
    { role: "EMPLOYEE", permission: PERMISSIONS.VIEW_CALENDAR },
    { role: "EMPLOYEE", permission: PERMISSIONS.VIEW_FEEDBACK },
    { role: "EMPLOYEE", permission: PERMISSIONS.VIEW_SETTINGS },

    // IT and others (Basic + Specifics?) - Giving basic for now
    { role: "IT", permission: PERMISSIONS.VIEW_DASHBOARD },
    { role: "IT", permission: PERMISSIONS.VIEW_TASKS },
    { role: "IT", permission: PERMISSIONS.VIEW_DOCUMENTS },
    { role: "IT", permission: PERMISSIONS.VIEW_SETTINGS },
    { role: "FINANCE", permission: PERMISSIONS.VIEW_DASHBOARD },
    { role: "FINANCE", permission: PERMISSIONS.VIEW_TASKS },
    { role: "FINANCE", permission: PERMISSIONS.VIEW_DOCUMENTS },
    { role: "FINANCE", permission: PERMISSIONS.VIEW_SETTINGS },
  ]

  for (const d of defaults) {
    await prisma.rolePermission.create({
      data: d
    }).catch(() => { }) // Ignore duplicates
  }
}
