export const PERMISSIONS = [
  "inbox.read", "inbox.write",
  "booking.read", "booking.write",
  "product.read", "product.write",
  "payment.read", "payment.write",
  "ai.train", "ai.config",
  "integration.read", "integration.write",
  "webhook.test",
  "report.read",
  "user.manage",
  "secrets.manage",
] as const;
export type Permission = (typeof PERMISSIONS)[number];

export const hasPermission = (rolePerms: string[], perm: string) =>
  rolePerms.includes("*") || rolePerms.includes(perm) || rolePerms.includes(`${perm.split(".")[0]}.*`);
