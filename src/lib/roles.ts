export const Role = {
  HR: "HR",
  MANAGER: "MANAGER",
  EMPLOYEE: "EMPLOYEE",
  IT: "IT",
  FINANCE: "FINANCE",
} as const;

export type RoleType = keyof typeof Role;
