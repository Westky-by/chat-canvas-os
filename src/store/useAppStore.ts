import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import * as seed from "@/data/mockData";
import type {
  Customer, CatalogItem, Conversation, Message, Booking, Inquiry,
  CustomerPreference, KnowledgeFile, AIFeedback, Campaign, Product, Order,
  PaymentSlip, RouteRecord, AIProvider, ChatIntegration, WebhookTestLog,
  NotificationRule, Role, User, AuditLog, UsageLog, ErrorLog, BackupJob,
  SecuritySettings, OwnerNotificationLog, CopilotMessage,
} from "@/types";
import { toast } from "sonner";

let _id = 1000;
const nid = (prefix = "X") => `${prefix}${++_id}`;
const now = () => new Date().toISOString();

interface AppState {
  customers: Customer[];
  catalog: CatalogItem[];
  conversations: Conversation[];
  messages: Message[];
  bookings: Booking[];
  inquiries: Inquiry[];
  customerPreferences: CustomerPreference[];
  uploadedKnowledgeFiles: KnowledgeFile[];
  aiFeedback: AIFeedback[];
  campaigns: Campaign[];
  products: Product[];
  orders: Order[];
  paymentSlips: PaymentSlip[];
  routes: RouteRecord[];
  aiProviders: AIProvider[];
  chatIntegrations: ChatIntegration[];
  webhookTestLogs: WebhookTestLog[];
  notificationRules: NotificationRule[];
  roles: Role[];
  users: User[];
  auditLogs: AuditLog[];
  usageLogs: UsageLog[];
  errorLogs: ErrorLog[];
  backupJobs: BackupJob[];
  securitySettings: SecuritySettings;
  ownerNotificationLogs: OwnerNotificationLog[];
  copilotMessages: CopilotMessage[];

  // Actions
  audit: (action: string, target: string, actor?: string) => void;
  notifyOwner: (trigger: string, message: string, channel?: "LINE" | "Telegram") => void;
  createBookingFromInquiry: (inquiryId: string) => void;
  assignAdmin: (inquiryId: string, admin: string) => void;
  markInquiryContacted: (inquiryId: string) => void;
  markInquiryClosed: (inquiryId: string) => void;
  approveKnowledge: (fileId: string) => void;
  rejectKnowledge: (fileId: string) => void;
  archiveKnowledge: (fileId: string) => void;
  uploadKnowledge: (name: string, category: string) => void;
  saveAIFeedback: (id: string, status: AIFeedback["status"], correction?: string) => void;
  createCampaign: (c: Partial<Campaign>) => void;
  pauseCampaign: (id: string) => void;
  requestCampaignApproval: (id: string) => void;
  updateStock: (id: string, stock: number) => void;
  linkCFKeyword: (id: string, kw: string) => void;
  confirmPayment: (orderId: string) => void;
  approvePaymentSlip: (slipId: string) => void;
  rejectPaymentSlip: (slipId: string) => void;
  calculateRoute: (origin: string, destination: string, provider: string, mode: RouteRecord["mode"]) => RouteRecord;
  saveRouteToBooking: (routeId: string, bookingId: string) => void;
  testAIProvider: (id: string) => void;
  rotateAIKey: (id: string) => void;
  toggleAIProvider: (id: string) => void;
  setPrimaryAI: (id: string) => void;
  testChatWebhook: (id: string) => void;
  toggleChannelConnection: (id: string) => void;
  sendWebhookEvent: (event: string, payload: string) => void;
  testOwnerNotification: (ruleId: string) => void;
  toggleRule: (ruleId: string) => void;
  togglePermission: (roleId: string, perm: string) => void;
  suspendUser: (id: string) => void;
  exportAuditLogs: () => void;
  exportUsageLogs: () => void;
  retryErrorLog: (id: string) => void;
  markErrorResolved: (id: string) => void;
  saveSecuritySettings: (s: Partial<SecuritySettings>) => void;
  runBackup: (target: "cloud" | "nas") => void;
  exportDatabase: () => void;
  exportFiles: () => void;
  addCatalogItemFromCopilot: (item: Partial<CatalogItem>) => void;
  addCopilotMessage: (sender: CopilotMessage["sender"], text: string) => void;
  addBooking: (b: Partial<Booking>) => void;
  confirmBooking: (id: string) => void;
  cancelBooking: (id: string) => void;
  addMessage: (conversationId: string, text: string, sender?: Message["sender"]) => void;
  sendCustomerMessageDemo: (text: string) => void;
  updateChatIntegration: (id: string, patch: Partial<ChatIntegration>) => void;
  addChatIntegration: (patch: Partial<ChatIntegration>) => void;
  deleteChatIntegration: (id: string) => void;
  updateAIProvider: (id: string, patch: Partial<AIProvider>) => void;
  addAIProvider: (patch: Partial<AIProvider>) => void;
  deleteAIProvider: (id: string) => void;
  updateNotificationRule: (id: string, patch: Partial<NotificationRule>) => void;
  addNotificationRule: (patch: Partial<NotificationRule>) => void;
  deleteNotificationRule: (id: string) => void;
  resetAll: () => void;

}

const mask = (raw: string) => (raw.length <= 4 ? "••••" : `•••• ${raw.slice(-4)}`);

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
  customers: [...seed.customers],
  catalog: [...seed.catalog],
  conversations: [...seed.conversations],
  messages: [...seed.messages],
  bookings: [...seed.bookings],
  inquiries: [...seed.inquiries],
  customerPreferences: [...seed.customerPreferences],
  uploadedKnowledgeFiles: [...seed.uploadedKnowledgeFiles],
  aiFeedback: [...seed.aiFeedback],
  campaigns: [...seed.campaigns],
  products: [...seed.products],
  orders: [...seed.orders],
  paymentSlips: [...seed.paymentSlips],
  routes: [...seed.routes],
  aiProviders: [...seed.aiProviders],
  chatIntegrations: [...seed.chatIntegrations],
  webhookTestLogs: [...seed.webhookTestLogs],
  notificationRules: [...seed.notificationRules],
  roles: [...seed.roles],
  users: [...seed.users],
  auditLogs: [...seed.auditLogs],
  usageLogs: [...seed.usageLogs],
  errorLogs: [...seed.errorLogs],
  backupJobs: [...seed.backupJobs],
  securitySettings: { ...seed.securitySettings },
  ownerNotificationLogs: [...seed.ownerNotificationLogs],
  copilotMessages: [...seed.copilotMessages],

  audit: (action, target, actor = "CurrentUser") =>
    set((s) => ({
      auditLogs: [
        { id: nid("A"), at: now(), actor, role: "Admin", action, target, status: "success", ip: "127.0.0.1" },
        ...s.auditLogs,
      ],
    })),

  notifyOwner: (trigger, message, channel = "LINE") => {
    set((s) => ({
      ownerNotificationLogs: [
        { id: nid("ON"), at: now(), trigger, channel, message, status: "sent" },
        ...s.ownerNotificationLogs,
      ],
    }));
    get().audit("notify_owner", trigger);
    toast.success(`แจ้งเตือนเจ้าของผ่าน ${channel} เรียบร้อย`);
  },

  createBookingFromInquiry: (inquiryId) => {
    const inq = get().inquiries.find((i) => i.id === inquiryId);
    if (!inq) return;
    const id = nid("B");
    set((s) => ({
      bookings: [
        { id, customerId: inq.customerId, resource: `${inq.interestedItem} ${inq.interestedZone}`, date: new Date(Date.now() + 86400000).toISOString().slice(0, 16).replace("T", " "), status: "pending", price: 2500, relatedInquiryId: inquiryId },
        ...s.bookings,
      ],
      inquiries: s.inquiries.map((i) => (i.id === inquiryId ? { ...i, status: "booking_requested" } : i)),
    }));
    get().audit("create_booking", id);
    toast.success(`สร้างการจอง ${id} จาก inquiry ${inquiryId}`);
  },

  assignAdmin: (inquiryId, admin) => {
    set((s) => ({ inquiries: s.inquiries.map((i) => (i.id === inquiryId ? { ...i, assignedAdmin: admin } : i)) }));
    get().audit("assign_admin", inquiryId);
    toast.success(`มอบหมาย ${admin}`);
  },

  markInquiryContacted: (id) => {
    set((s) => ({ inquiries: s.inquiries.map((i) => (i.id === id ? { ...i, status: "contacted" } : i)) }));
    get().audit("mark_contacted", id);
    toast.success("อัปเดตสถานะเป็น 'ติดต่อแล้ว'");
  },
  markInquiryClosed: (id) => {
    set((s) => ({ inquiries: s.inquiries.map((i) => (i.id === id ? { ...i, status: "closed" } : i)) }));
    get().audit("mark_closed", id);
    toast.success("ปิด inquiry เรียบร้อย");
  },

  uploadKnowledge: (name, category) => {
    const id = nid("F");
    set((s) => ({
      uploadedKnowledgeFiles: [
        { id, name, type: "pdf", category, status: "pending", usedByAI: false, uploadedBy: "CurrentUser", uploadedAt: now() },
        ...s.uploadedKnowledgeFiles,
      ],
    }));
    get().audit("upload_knowledge", id);
    toast.info("อัปโหลดเรียบร้อย รอ Admin อนุมัติก่อน AI จะใช้งานได้");
  },
  approveKnowledge: (id) => {
    set((s) => ({ uploadedKnowledgeFiles: s.uploadedKnowledgeFiles.map((f) => (f.id === id ? { ...f, status: "approved", usedByAI: true } : f)) }));
    get().audit("approve_knowledge", id);
    toast.success("อนุมัติเอกสารแล้ว AI พร้อมใช้งาน");
  },
  rejectKnowledge: (id) => {
    set((s) => ({ uploadedKnowledgeFiles: s.uploadedKnowledgeFiles.map((f) => (f.id === id ? { ...f, status: "rejected", usedByAI: false } : f)) }));
    get().audit("reject_knowledge", id);
    toast.warning("ปฏิเสธเอกสารแล้ว");
  },
  archiveKnowledge: (id) => {
    set((s) => ({ uploadedKnowledgeFiles: s.uploadedKnowledgeFiles.map((f) => (f.id === id ? { ...f, status: "archived", usedByAI: false } : f)) }));
    get().audit("archive_knowledge", id);
    toast.info("ย้ายเข้าคลังเก็บ");
  },

  saveAIFeedback: (id, status, correction) => {
    set((s) => ({ aiFeedback: s.aiFeedback.map((f) => (f.id === id ? { ...f, status, correction: correction ?? f.correction } : f)) }));
    get().audit("save_ai_feedback", id);
    toast.success("บันทึก feedback แล้ว");
  },

  createCampaign: (c) => {
    const id = nid("CP");
    set((s) => ({
      campaigns: [
        { id, name: c.name ?? "New Campaign", type: c.type ?? "broadcast", segment: c.segment ?? "ทั้งหมด", channel: c.channel ?? "LINE", status: "draft", approval: c.type === "broadcast" ? "pending" : "approved", sent: 0, conversion: 0 },
        ...s.campaigns,
      ],
    }));
    get().audit("create_campaign", id);
    toast.success("สร้างแคมเปญแล้ว");
  },
  pauseCampaign: (id) => {
    set((s) => ({ campaigns: s.campaigns.map((c) => (c.id === id ? { ...c, status: "paused" } : c)) }));
    toast.info("หยุดแคมเปญชั่วคราว");
  },
  requestCampaignApproval: (id) => {
    set((s) => ({ campaigns: s.campaigns.map((c) => (c.id === id ? { ...c, approval: "pending" } : c)) }));
    get().audit("request_campaign_approval", id);
    toast.info("ส่งขออนุมัติเจ้าของแล้ว");
  },

  updateStock: (id, stock) => {
    set((s) => ({ products: s.products.map((p) => (p.id === id ? { ...p, stock, status: stock === 0 ? "out" : stock < 3 ? "low" : "available", updatedAt: now() } : p)) }));
    toast.success("อัปเดตสต็อกแล้ว");
  },
  linkCFKeyword: (id, kw) => {
    set((s) => ({ products: s.products.map((p) => (p.id === id ? { ...p, cfKeyword: kw } : p)) }));
    toast.success(`ผูก CF keyword "${kw}" แล้ว`);
  },

  confirmPayment: (orderId) => {
    set((s) => ({ orders: s.orders.map((o) => (o.id === orderId ? { ...o, paymentStatus: "paid" } : o)) }));
    get().audit("confirm_payment", orderId);
    toast.success("ยืนยันการชำระเงินแล้ว");
  },
  approvePaymentSlip: (slipId) => {
    const slip = get().paymentSlips.find((s) => s.id === slipId);
    set((s) => ({
      paymentSlips: s.paymentSlips.map((p) => (p.id === slipId ? { ...p, status: "approved", reviewer: "CurrentUser" } : p)),
      orders: slip?.orderId ? s.orders.map((o) => (o.id === slip.orderId ? { ...o, paymentStatus: "paid" } : o)) : s.orders,
    }));
    get().audit("approve_payment_slip", slipId);
    toast.success("อนุมัติสลิปการชำระเงินแล้ว");
  },
  rejectPaymentSlip: (slipId) => {
    set((s) => ({ paymentSlips: s.paymentSlips.map((p) => (p.id === slipId ? { ...p, status: "rejected", reviewer: "CurrentUser" } : p)) }));
    get().audit("reject_payment_slip", slipId);
    toast.warning("ปฏิเสธสลิปแล้ว");
  },

  calculateRoute: (origin, destination, provider, mode) => {
    const id = nid("RT");
    const route: RouteRecord = {
      id, origin, destination, mode, provider,
      distanceKm: +(Math.random() * 40 + 5).toFixed(1),
      etaMin: Math.round(Math.random() * 60 + 10),
      createdAt: now(),
    };
    set((s) => ({ routes: [route, ...s.routes] }));
    toast.success(`คำนวณเส้นทาง: ${route.distanceKm} กม. ~${route.etaMin} นาที (mock)`);
    return route;
  },
  saveRouteToBooking: (routeId, bookingId) => {
    get().audit("save_route_to_booking", `${routeId}->${bookingId}`);
    toast.success("ผูกเส้นทางเข้ากับการจองแล้ว");
  },

  testAIProvider: (id) => {
    set((s) => ({ aiProviders: s.aiProviders.map((p) => (p.id === id ? { ...p, lastTested: now() } : p)) }));
    get().audit("test_ai_provider", id);
    toast.success("ทดสอบเชื่อมต่อ AI สำเร็จ (mock)");
  },
  rotateAIKey: (id) => {
    set((s) => ({ aiProviders: s.aiProviders.map((p) => (p.id === id ? { ...p, maskedKey: `•••• ${Math.random().toString(36).slice(2, 6)}` } : p)) }));
    get().audit("rotate_ai_key", id);
    toast.success("หมุน API key แล้ว (Production: server-side only)");
  },
  toggleAIProvider: (id) => {
    set((s) => ({ aiProviders: s.aiProviders.map((p) => (p.id === id ? { ...p, status: p.status === "active" ? "disabled" : "active" } : p)) }));
    toast.info("สลับสถานะ provider แล้ว");
  },
  setPrimaryAI: (id) => {
    set((s) => ({ aiProviders: s.aiProviders.map((p) => ({ ...p, role: p.id === id ? "primary" : p.role === "primary" ? "fallback" : p.role })) }));
    toast.success("ตั้งเป็น Primary แล้ว");
  },

  testChatWebhook: (id) => {
    get().audit("test_chat_webhook", id);
    toast.success("ส่ง test event เข้า webhook แล้ว");
  },
  toggleChannelConnection: (id) => {
    set((s) => ({ chatIntegrations: s.chatIntegrations.map((c) => (c.id === id ? { ...c, status: c.status === "connected" ? "disconnected" : "connected" } : c)) }));
    toast.info("สลับสถานะการเชื่อมต่อ");
  },

  sendWebhookEvent: (event, payload) => {
    const id = nid("WT");
    set((s) => ({
      webhookTestLogs: [
        { id, event, payload, response: "200 OK (mock)", status: "ok", at: now() },
        ...s.webhookTestLogs,
      ],
    }));
    toast.success(`ส่งอีเวนต์ ${event} เรียบร้อย`);
  },

  testOwnerNotification: (ruleId) => {
    const r = get().notificationRules.find((n) => n.id === ruleId);
    if (!r) return;
    get().notifyOwner(r.trigger, `[TEST] ${r.template}`, r.channel === "Email" ? "LINE" : r.channel);
  },
  toggleRule: (ruleId) => {
    set((s) => ({ notificationRules: s.notificationRules.map((r) => (r.id === ruleId ? { ...r, enabled: !r.enabled } : r)) }));
    toast.info("สลับสถานะกฎ");
  },

  togglePermission: (roleId, perm) => {
    set((s) => ({
      roles: s.roles.map((r) =>
        r.id === roleId
          ? { ...r, permissions: r.permissions.includes(perm) ? r.permissions.filter((p) => p !== perm) : [...r.permissions, perm] }
          : r
      ),
    }));
    get().audit("toggle_permission", `${roleId}:${perm}`);
    toast.success("อัปเดตสิทธิ์แล้ว");
  },
  suspendUser: (id) => {
    set((s) => ({ users: s.users.map((u) => (u.id === id ? { ...u, status: u.status === "suspended" ? "active" : "suspended" } : u)) }));
    get().audit("suspend_user", id);
    toast.warning("สลับสถานะผู้ใช้");
  },

  exportAuditLogs: () => {
    get().audit("export_audit_logs", "all");
    toast.success("ส่งออก Audit Logs แล้ว (mock CSV)");
  },
  exportUsageLogs: () => toast.success("ส่งออก Usage Logs แล้ว (mock CSV)"),

  retryErrorLog: (id) => {
    set((s) => ({ errorLogs: s.errorLogs.map((e) => (e.id === id ? { ...e, retries: e.retries + 1, status: "retrying" } : e)) }));
    toast.info("กำลัง retry...");
  },
  markErrorResolved: (id) => {
    set((s) => ({ errorLogs: s.errorLogs.map((e) => (e.id === id ? { ...e, status: "resolved" } : e)) }));
    toast.success("ทำเครื่องหมายว่าแก้ไขแล้ว");
  },

  saveSecuritySettings: (s2) => {
    set((s) => ({ securitySettings: { ...s.securitySettings, ...s2 } }));
    get().audit("save_security_settings", "settings");
    toast.success("บันทึกการตั้งค่าความปลอดภัยแล้ว");
  },

  runBackup: (target) => {
    set((s) => ({ backupJobs: s.backupJobs.map((b) => (b.target === target ? { ...b, lastBackup: now(), status: "ok" } : b)) }));
    get().audit("run_backup", target);
    toast.success(`รัน backup (${target}) เรียบร้อย`);
  },
  exportDatabase: () => toast.success("ส่งออกฐานข้อมูลแล้ว (mock)"),
  exportFiles: () => toast.success("ส่งออกไฟล์แล้ว (mock)"),

  addCatalogItemFromCopilot: (item) => {
    const id = nid("K");
    set((s) => ({
      catalog: [
        {
          id,
          title: item.title ?? "รายการใหม่จาก Copilot",
          price: item.price ?? 1000,
          cfKeyword: item.cfKeyword ?? "NEW1",
          stock: item.stock ?? 1,
          description: item.description ?? "เพิ่มผ่าน AI Copilot",
          image: item.image ?? "https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=400",
          aiUsable: true,
        },
        ...s.catalog,
      ],
    }));
    get().audit("copilot_add_catalog", id);
    toast.success(`Copilot เพิ่มรายการ ${id} เข้า Visual Catalog`);
  },
  addCopilotMessage: (sender, text) => {
    set((s) => ({ copilotMessages: [...s.copilotMessages, { id: nid("CM"), sender, text, at: now() }] }));
  },

  addBooking: (b) => {
    const id = nid("B");
    set((s) => ({
      bookings: [
        { id, customerId: b.customerId ?? "C001", resource: b.resource ?? "ห้องใหม่", date: b.date ?? "2026-08-01 14:00", status: "pending", price: b.price ?? 2000 },
        ...s.bookings,
      ],
    }));
    get().audit("add_booking", id);
    toast.success("สร้างการจองแล้ว");
  },
  confirmBooking: (id) => {
    set((s) => ({ bookings: s.bookings.map((b) => (b.id === id ? { ...b, status: "confirmed" } : b)) }));
    get().audit("confirm_booking", id);
    toast.success("ยืนยันการจอง");
  },
  cancelBooking: (id) => {
    set((s) => ({ bookings: s.bookings.map((b) => (b.id === id ? { ...b, status: "cancelled" } : b)) }));
    get().audit("cancel_booking", id);
    toast.warning("ยกเลิกการจอง");
  },

  addMessage: (conversationId, text, sender = "admin") => {
    set((s) => ({
      messages: [...s.messages, { id: nid("M"), conversationId, sender, text, at: now() }],
      conversations: s.conversations.map((c) => (c.id === conversationId ? { ...c, lastMessage: text, updatedAt: now() } : c)),
    }));
  },

  sendCustomerMessageDemo: (text) => {
    const conv = get().conversations[0];
    if (!conv) return;
    get().addMessage(conv.id, text, "customer");
    toast.info(`ลูกค้าส่ง: "${text}"`);
  },

  updateChatIntegration: (id, patch) => {
    const next: Partial<ChatIntegration> = { ...patch };
    const raw = (patch as { rawToken?: string }).rawToken;
    if (raw) {
      next.maskedToken = mask(raw);
      next.rawToken = raw;
    }
    set((s) => ({ chatIntegrations: s.chatIntegrations.map((c) => (c.id === id ? { ...c, ...next } : c)) }));
    get().audit("update_chat_integration", id);
    toast.success("บันทึกการตั้งค่า channel แล้ว");
  },
  addChatIntegration: (patch) => {
    const id = nid("CH");
    const raw = (patch as { rawToken?: string }).rawToken;
    const channelType = (patch.channelType ?? "CUSTOM") as ChatIntegration["channelType"];
    const inboundPath = patch.inboundPath ?? `/api/public/webhook/${channelType.toLowerCase()}`;
    set((s) => ({
      chatIntegrations: [
        {
          id,
          name: patch.name ?? "Custom Webhook",
          channelType,
          status: patch.status ?? "disconnected",
          inboundPath,
          sendEndpoint: patch.sendEndpoint ?? "",
          webhookUrl: patch.webhookUrl ?? inboundPath,
          maskedToken: raw ? mask(raw) : patch.maskedToken ?? "—",
          rawToken: raw,
          lastSync: patch.lastSync,
          lastMessage: patch.lastMessage,
          error: patch.error,
        },
        ...s.chatIntegrations,
      ],
    }));
    get().audit("add_chat_integration", id);
    toast.success(`เพิ่มช่องทาง ${patch.name ?? "Custom"} แล้ว`);
  },
  deleteChatIntegration: (id) => {
    set((s) => ({ chatIntegrations: s.chatIntegrations.filter((c) => c.id !== id) }));
    get().audit("delete_chat_integration", id);
    toast.warning("ลบช่องทางแล้ว");
  },

  updateAIProvider: (id, patch) => {
    const next: Partial<AIProvider> = { ...patch };
    const raw = (patch as { rawKey?: string }).rawKey;
    if (raw) {
      next.maskedKey = mask(raw);
      next.rawKey = raw;
    }
    set((s) => ({ aiProviders: s.aiProviders.map((p) => (p.id === id ? { ...p, ...next } : p)) }));
    get().audit("update_ai_provider", id);
    toast.success("บันทึก provider แล้ว");
  },
  addAIProvider: (patch) => {
    const id = nid("AI");
    const raw = (patch as { rawKey?: string }).rawKey;
    set((s) => ({
      aiProviders: [
        {
          id,
          name: patch.name ?? "Custom",
          providerLabel: patch.providerLabel ?? "Lovable AI / Google Gemini API",
          status: patch.status ?? "active",
          model: patch.model ?? "google/gemini-2.5-flash-lite",
          systemPrompt: patch.systemPrompt ?? "",
          maskedKey: raw ? mask(raw) : patch.maskedKey ?? "—",
          rawKey: raw,
          role: patch.role ?? "primary",
          costLimit: patch.costLimit ?? 1000,
          lastTested: patch.lastTested,
        },
        ...s.aiProviders,
      ],
    }));
    get().audit("add_ai_provider", id);
    toast.success(`เพิ่ม provider ${patch.name ?? "Custom"} แล้ว`);
  },
  deleteAIProvider: (id) => {
    set((s) => ({ aiProviders: s.aiProviders.filter((p) => p.id !== id) }));
    get().audit("delete_ai_provider", id);
    toast.warning("ลบ provider แล้ว");
  },

  updateNotificationRule: (id, patch) => {
    set((s) => ({ notificationRules: s.notificationRules.map((r) => (r.id === id ? { ...r, ...patch } : r)) }));
    get().audit("update_notification_rule", id);
    toast.success("บันทึกกฎแล้ว");
  },
  addNotificationRule: (patch) => {
    const id = nid("NR");
    set((s) => ({
      notificationRules: [
        {
          id,
          trigger: patch.trigger ?? "custom_event",
          channel: patch.channel ?? "LINE",
          template: patch.template ?? "",
          enabled: patch.enabled ?? true,
          priority: patch.priority ?? "medium",
          lastSent: patch.lastSent,
        },
        ...s.notificationRules,
      ],
    }));
    get().audit("add_notification_rule", id);
    toast.success("เพิ่มกฎใหม่แล้ว");
  },
  deleteNotificationRule: (id) => {
    set((s) => ({ notificationRules: s.notificationRules.filter((r) => r.id !== id) }));
    get().audit("delete_notification_rule", id);
    toast.warning("ลบกฎแล้ว");
  },

  resetAll: () => {
    // ล้างทุกอย่างเป็น 0 / ว่างทั้งหมด — ไม่มี mock data ค้าง
    set((s) => ({
      ...s,
      // Main / CRM / Inbox
      customers: [],
      catalog: [],
      conversations: [],
      messages: [],
      bookings: [],
      inquiries: [],
      customerPreferences: [],
      uploadedKnowledgeFiles: [],
      aiFeedback: [],
      campaigns: [],
      products: [],
      orders: [],
      paymentSlips: [],
      routes: [],
      // Integrations
      aiProviders: [],
      chatIntegrations: [],
      webhookTestLogs: [],
      notificationRules: [],
      ownerNotificationLogs: [],
      // Admin & Security
      roles: [],
      users: [],
      backupJobs: [],
      securitySettings: {
        require2FA: false,
        sessionTimeoutMin: 0,
        ipAllowlist: [],
        loginAlerts: false,
        dataExportApproval: false,
        secretRotationDays: 0,
        disableInactive: false,
        webhookSignatureValidation: false,
      },
      // Logs
      auditLogs: [],
      usageLogs: [],
      errorLogs: [],
      copilotMessages: [],
    }));
    toast.success("ล้างข้อมูลทั้งหมดเรียบร้อย — เริ่มต้นจาก 0");
  },
    }),
    {
      name: "app-os-settings-v1",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        aiProviders: state.aiProviders,
        chatIntegrations: state.chatIntegrations,
        notificationRules: state.notificationRules,
        securitySettings: state.securitySettings,
      }),
    },
  ),
);






