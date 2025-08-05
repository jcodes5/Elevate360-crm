import type { UserRole, Resource, Action, Permission } from "@/types"

export const DEFAULT_PERMISSIONS: Record<UserRole, Permission[]> = {
  ADMIN: [
    {
      resource: "contacts",
      actions: ["create", "read", "update", "delete", "assign", "export"],
    },
    {
      resource: "deals",
      actions: ["create", "read", "update", "delete", "assign", "export"],
    },
    {
      resource: "campaigns",
      actions: ["create", "read", "update", "delete", "export"],
    },
    {
      resource: "appointments",
      actions: ["create", "read", "update", "delete", "assign", "export"],
    },
    {
      resource: "tasks",
      actions: ["create", "read", "update", "delete", "assign", "export"],
    },
    {
      resource: "workflows",
      actions: ["create", "read", "update", "delete", "export"],
    },
    {
      resource: "analytics",
      actions: ["read", "export"],
    },
    {
      resource: "settings",
      actions: ["read", "update"],
    },
    {
      resource: "users",
      actions: ["create", "read", "update", "delete"],
    },
  ],
  MANAGER: [
    {
      resource: "contacts",
      actions: ["create", "read", "update", "assign", "export"],
    },
    {
      resource: "deals",
      actions: ["create", "read", "update", "assign", "export"],
    },
    {
      resource: "campaigns",
      actions: ["create", "read", "update", "export"],
    },
    {
      resource: "appointments",
      actions: ["create", "read", "update", "assign", "export"],
    },
    {
      resource: "tasks",
      actions: ["create", "read", "update", "assign", "export"],
    },
    {
      resource: "workflows",
      actions: ["create", "read", "update"],
    },
    {
      resource: "analytics",
      actions: ["read", "export"],
    },
    {
      resource: "users",
      actions: ["read"],
    },
  ],
  AGENT: [
    {
      resource: "contacts",
      actions: ["create", "read", "update"],
    },
    {
      resource: "deals",
      actions: ["create", "read", "update"],
    },
    {
      resource: "campaigns",
      actions: ["read"],
    },
    {
      resource: "appointments",
      actions: ["create", "read", "update"],
    },
    {
      resource: "tasks",
      actions: ["create", "read", "update"],
    },
    {
      resource: "workflows",
      actions: ["read"],
    },
    {
      resource: "analytics",
      actions: ["read"],
    },
  ],
}

export class PermissionService {
  static hasPermission(userRole: UserRole, resource: Resource, action: Action): boolean {
    const rolePermissions = DEFAULT_PERMISSIONS[userRole]
    const resourcePermission = rolePermissions.find((p) => p.resource === resource)

    if (!resourcePermission) return false

    return resourcePermission.actions.includes(action)
  }

  static canAccessResource(userRole: UserRole, resource: Resource): boolean {
    const rolePermissions = DEFAULT_PERMISSIONS[userRole]
    return rolePermissions.some((p) => p.resource === resource)
  }

  static getResourceActions(userRole: UserRole, resource: Resource): Action[] {
    const rolePermissions = DEFAULT_PERMISSIONS[userRole]
    const resourcePermission = rolePermissions.find((p) => p.resource === resource)

    return resourcePermission?.actions || []
  }
}
