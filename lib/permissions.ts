export type Role = "owner" | "editor" | "viewer" | "none";
export type ShareRow = { user_id: number; role: string };

/** Single source of truth for access logic. Used by every API route. */
export function resolveRole(userId: number, ownerId: number, shares: ShareRow[]): Role {
  if (userId === ownerId) return "owner";
  const s = shares.find((x) => x.user_id === userId);
  if (!s) return "none";
  return s.role === "editor" ? "editor" : s.role === "viewer" ? "viewer" : "none";
}

export const canView = (r: Role) => r !== "none";
export const canEdit = (r: Role) => r === "owner" || r === "editor";
export const canShare = (r: Role) => r === "owner";
export const canDelete = (r: Role) => r === "owner";
