export type ID = string;

export type Channel = "LINE" | "Facebook" | "Instagram" | "WhatsApp" | "Telegram" | "Website" | "Webhook";

export type InquiryStatus =
  | "new"
  | "interested"
  | "waiting_owner"
  | "booking_requested"
  | "contacted"
  | "closed";

export interface Customer {
  id: ID;
  name: string;
  channel: Channel;
  phone?: string;
  email?: string;
  tier: "VIP" | "Regular" | "New";
  tags: string[];
  lastActivity: string;
  note?: string;
}


export interface CatalogItem {
  id: ID;
  title: string;
  price: number;
  cfKeyword: string;
  stock: number;
  description: string;
  image: string;
  aiUsable: boolean;
}

export interface Conversation {
  id: ID;
  customerId: ID;
  channel: Channel;
  lastMessage: string;
  unread: number;
  mode: "ai" | "admin";
  updatedAt: string;
}

export interface Message {
  id: ID;
  conversationId: ID;
  sender: "customer" | "ai" | "admin";
  text: string;
  attachments?: { type: "image" | "catalog"; url?: string; catalogId?: ID }[];
  at: string;
}

export interface Booking {
  id: ID;
  customerId: ID;
  resource: string;
  date: string;
  status: "pending" | "confirmed" | "cancelled" | "rescheduled";
  price: number;
  relatedInquiryId?: ID;
}

export interface Inquiry {
  id: ID;
  customerId: ID;
  channel: Channel;
  interestedItem: string;
  interestedZone: string;
  lastMessage: string;
  confidence: number;
  status: InquiryStatus;
  assignedAdmin?: string;
  createdAt: string;
}

export interface CustomerPreference {
  id: ID;
  customerId: ID;
  interestedItem: string;
  interestedZone: string;
  preferredDateTime: string;
  people: number;
  budget: number;
  specialRequest: string;
  urgency: "low" | "medium" | "high";
  leadStatus: "cold" | "warm" | "hot";
  sourceChannel: Channel;
}

export interface KnowledgeFile {
  id: ID;
  name: string;
  type: "pdf" | "image" | "doc" | "csv";
  category: string;
  status: "pending" | "approved" | "rejected" | "archived";
  usedByAI: boolean;
  uploadedBy: string;
  uploadedAt: string;
}

export interface AIFeedback {
  id: ID;
  question: string;
  aiAnswer: string;
  correction?: string;
  status: "pending" | "correct" | "wrong" | "saved";
  confidence: number;
  conversationId?: ID;
  createdAt: string;
}

export interface Campaign {
  id: ID;
  name: string;
  type: "welcome" | "followup" | "broadcast" | "coupon" | "reminder" | "reactivation" | "abandoned";
  segment: string;
  channel: Channel;
  status: "draft" | "active" | "paused" | "completed";
  approval: "not_required" | "pending" | "approved" | "rejected";
  sent: number;
  conversion: number;
}

export interface Product {
  id: ID;
  name: string;
  sku: string;
  price: number;
  stock: number;
  status: "available" | "low" | "out" | "unavailable";
  catalogId?: ID;
  cfKeyword?: string;
  updatedAt: string;
}

export interface Order {
  id: ID;
  customerId: ID;
  items: string;
  amount: number;
  paymentStatus: "unpaid" | "pending_review" | "paid" | "refunded" | "cancelled";
  fulfillmentStatus: "pending" | "confirmed" | "shipped" | "completed" | "cancelled";
  channel: Channel;
  createdAt: string;
}

export interface PaymentSlip {
  id: ID;
  customerId: ID;
  orderId?: ID;
  bookingId?: ID;
  amount: number;
  uploadedAt: string;
  status: "pending" | "approved" | "rejected" | "needs_new";
  reviewer?: string;
}

export interface RouteRecord {
  id: ID;
  origin: string;
  destination: string;
  mode: "drive" | "walk" | "bike";
  provider: string;
  distanceKm?: number;
  etaMin?: number;
  createdAt: string;
}

export interface AIProvider {
  id: ID;
  name: "Gemini" | "OpenAI" | "Claude" | "Grok" | "Vertex AI" | "Custom" | "OpenAI-Compatible";
  status: "active" | "disabled";
  model: string;
  maskedKey: string;
  /** Raw key kept ONLY in localStorage (zustand persist), sent server-side per request when provided. */
  rawKey?: string;
  systemPrompt?: string;
  providerLabel?: string;
  role: "primary" | "fallback" | "manual";
  lastTested?: string;
  costLimit: number;
}

export type ChatChannelType =
  | "LINE"
  | "TELEGRAM"
  | "WHATSAPP"
  | "MESSENGER"
  | "INSTAGRAM"
  | "WEB"
  | "CUSTOM";

export interface ChatIntegration {
  id: ID;
  name: "LINE OA" | "Telegram" | "Facebook Messenger" | "Instagram DM" | "WhatsApp Business" | "Website Live Chat" | "Custom Webhook";
  channelType: ChatChannelType;
  status: "connected" | "disconnected" | "error";
  /** Path-only (e.g. /api/public/webhook/line). UI shows full origin + this path. */
  inboundPath: string;
  /** Outbound send endpoint (e.g. https://api.line.me/v2/bot/message/reply). */
  sendEndpoint: string;
  /** @deprecated kept for backwards compat with older entries; same as inboundPath when absent. */
  webhookUrl: string;
  maskedToken: string;
  /** Raw token kept ONLY in localStorage on the user's machine. */
  rawToken?: string;
  lastSync?: string;
  lastMessage?: string;
  error?: string;
}

export interface WebhookTestLog {
  id: ID;
  event: string;
  payload: string;
  response: string;
  status: "ok" | "error";
  at: string;
}

export interface NotificationRule {
  id: ID;
  trigger: string;
  channel: "LINE" | "Telegram" | "Email";
  template: string;
  enabled: boolean;
  lastSent?: string;
  priority: "low" | "medium" | "high";
}

export interface Role {
  id: ID;
  name: string;
  description: string;
  permissions: string[];
}

export interface User {
  id: ID;
  name: string;
  email: string;
  roleId: ID;
  status: "active" | "suspended" | "invited";
  lastLogin?: string;
}

export interface AuditLog {
  id: ID;
  at: string;
  actor: string;
  role: string;
  action: string;
  target: string;
  status: "success" | "failed";
  ip: string;
  details?: string;
}

export interface UsageLog {
  id: ID;
  at: string;
  feature: string;
  provider: string;
  model: string;
  tokens: number;
  cost: number;
  status: "ok" | "error";
  conversationId?: ID;
}

export interface ErrorLog {
  id: ID;
  at: string;
  source: string;
  type: string;
  message: string;
  status: "open" | "resolved" | "retrying";
  retries: number;
  ownerNotified: boolean;
}

export interface BackupJob {
  id: ID;
  target: "cloud" | "nas";
  lastBackup: string;
  size: string;
  retention: string;
  nextSchedule: string;
  status: "ok" | "running" | "failed";
}

export interface SecuritySettings {
  require2FA: boolean;
  sessionTimeoutMin: number;
  ipAllowlist: string[];
  loginAlerts: boolean;
  dataExportApproval: boolean;
  secretRotationDays: number;
  disableInactive: boolean;
  webhookSignatureValidation: boolean;
}

export interface OwnerNotificationLog {
  id: ID;
  at: string;
  trigger: string;
  channel: "LINE" | "Telegram" | "Email";
  message: string;
  status: "sent" | "failed";
}

export interface CopilotMessage {
  id: ID;
  sender: "user" | "copilot";
  text: string;
  at: string;
}
