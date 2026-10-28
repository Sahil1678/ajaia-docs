import { describe, expect, it } from "vitest";
import { canDelete, canEdit, canShare, canView, resolveRole } from "../lib/permissions";

const shares = [{ user_id: 2, role: "editor" }, { user_id: 3, role: "viewer" }];

describe("resolveRole", () => {
  it("owner", () => expect(resolveRole(1, 1, shares)).toBe("owner"));
  it("editor", () => expect(resolveRole(2, 1, shares)).toBe("editor"));
  it("viewer", () => expect(resolveRole(3, 1, shares)).toBe("viewer"));
  it("stranger gets none", () => expect(resolveRole(99, 1, shares)).toBe("none"));
  it("unknown role string is treated as none", () => expect(resolveRole(5, 1, [{ user_id: 5, role: "admin" }])).toBe("none"));
});

describe("capabilities", () => {
  it("only owner/editor can edit", () => {
    expect(canEdit("owner")).toBe(true); expect(canEdit("editor")).toBe(true);
    expect(canEdit("viewer")).toBe(false); expect(canEdit("none")).toBe(false);
  });
  it("only owner can share or delete", () => {
    expect(canShare("owner")).toBe(true); expect(canShare("editor")).toBe(false);
    expect(canDelete("owner")).toBe(true); expect(canDelete("viewer")).toBe(false);
  });
  it("viewer can view, stranger cannot", () => {
    expect(canView("viewer")).toBe(true); expect(canView("none")).toBe(false);
  });
});
