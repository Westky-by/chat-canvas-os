import type {
  Customer, CatalogItem, Conversation, Message, Booking, Inquiry,
  CustomerPreference, KnowledgeFile, AIFeedback, Campaign, Product, Order,
  PaymentSlip, RouteRecord, AIProvider, ChatIntegration, WebhookTestLog,
  NotificationRule, Role, User, AuditLog, UsageLog, ErrorLog, BackupJob,
  SecuritySettings, OwnerNotificationLog, CopilotMessage,
} from "@/types";

const now = () => new Date().toISOString();
const ago = (mins: number) => new Date(Date.now() - mins * 60_000).toISOString();

export const customers: Customer[] = [
  { id: "C001", name: "คุณสมชาย ใจดี", channel: "LINE", phone: "081-234-5678", tier: "VIP", tags: ["พรีเมียม", "ลูกค้าประจำ"], lastActivity: ago(5) },
  { id: "C002", name: "คุณสมหญิง รักดี", channel: "Facebook", phone: "082-345-6789", tier: "Regular", tags: ["ครอบครัว"], lastActivity: ago(15) },
  { id: "C003", name: "Mr. John Smith", channel: "WhatsApp", phone: "+1-555-0123", tier: "VIP", tags: ["ต่างชาติ", "องค์กร"], lastActivity: ago(30) },
  { id: "C004", name: "คุณวิภา สดใส", channel: "Instagram", phone: "083-456-7890", tier: "New", tags: ["ลูกค้าใหม่"], lastActivity: ago(60) },
  { id: "C005", name: "คุณธนกร มั่งคั่ง", channel: "Telegram", phone: "084-567-8901", tier: "Regular", tags: ["รีเซลเลอร์"], lastActivity: ago(120) },
];

export const catalog: CatalogItem[] = [
  { id: "K001", title: "ห้องดีลักซ์ Zone A", price: 2500, cfKeyword: "A1", stock: 3, description: "ห้องวิวสระว่ายน้ำ พร้อมระเบียง", image: "https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=400", aiUsable: true },
  { id: "K002", title: "ห้องสวีท Zone B", price: 4500, cfKeyword: "B1", stock: 1, description: "สวีทขนาดใหญ่ พร้อมห้องนั่งเล่น", image: "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=400", aiUsable: true },
  { id: "K003", title: "ห้องสแตนดาร์ด Zone C", price: 1500, cfKeyword: "C1", stock: 5, description: "ห้องพักมาตรฐาน เตียงคิงไซส์", image: "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400", aiUsable: true },
  { id: "K004", title: "Villa Pool Zone D", price: 8500, cfKeyword: "D1", stock: 2, description: "วิลล่าสระว่ายน้ำส่วนตัว", image: "https://images.unsplash.com/photo-1582719508461-905c673771fd?w=400", aiUsable: false },
];

export const conversations: Conversation[] = [
  { id: "CV001", customerId: "C001", channel: "LINE", lastMessage: "มีห้องแบบไหนบ้างคะ", unread: 2, mode: "ai", updatedAt: ago(2) },
  { id: "CV002", customerId: "C002", channel: "Facebook", lastMessage: "ราคารวมอาหารเช้าไหม", unread: 0, mode: "ai", updatedAt: ago(10) },
  { id: "CV003", customerId: "C003", channel: "WhatsApp", lastMessage: "Can I book for next weekend?", unread: 1, mode: "admin", updatedAt: ago(25) },
  { id: "CV004", customerId: "C004", channel: "Instagram", lastMessage: "ขอดูรูปห้องสวีทหน่อยค่ะ", unread: 0, mode: "ai", updatedAt: ago(45) },
];

export const messages: Message[] = [
  { id: "M1", conversationId: "CV001", sender: "customer", text: "สวัสดีค่ะ มีห้องแบบไหนบ้างคะ", at: ago(8) },
  { id: "M2", conversationId: "CV001", sender: "ai", text: "สวัสดีค่ะ ทางเรามีห้องพัก 4 แบบให้เลือกค่ะ", at: ago(7), attachments: [{ type: "catalog", catalogId: "K001" }, { type: "catalog", catalogId: "K002" }, { type: "catalog", catalogId: "K003" }] },
  { id: "M3", conversationId: "CV001", sender: "customer", text: "สนใจ Zone A ค่ะ", at: ago(3) },
  { id: "M4", conversationId: "CV001", sender: "ai", text: "รับทราบค่ะ บันทึกความสนใจ Zone A เรียบร้อย กำลังแจ้งเจ้าของร้านค่ะ", at: ago(2) },
];

export const bookings: Booking[] = [
  { id: "B001", customerId: "C001", resource: "ห้องดีลักซ์ Zone A", date: "2026-07-15 14:00", status: "confirmed", price: 2500, relatedInquiryId: "I001" },
  { id: "B002", customerId: "C002", resource: "ห้องสวีท Zone B", date: "2026-07-20 15:00", status: "pending", price: 4500 },
  { id: "B003", customerId: "C003", resource: "Villa Pool D", date: "2026-08-01 14:00", status: "confirmed", price: 8500 },
];

export const inquiries: Inquiry[] = [
  { id: "I001", customerId: "C001", channel: "LINE", interestedItem: "ห้องดีลักซ์", interestedZone: "Zone A", lastMessage: "สนใจ Zone A ค่ะ", confidence: 0.92, status: "interested", assignedAdmin: "Admin1", createdAt: ago(5) },
  { id: "I002", customerId: "C002", channel: "Facebook", interestedItem: "ห้องสวีท", interestedZone: "Zone B", lastMessage: "ราคารวมอาหารเช้าไหม", confidence: 0.78, status: "new", createdAt: ago(15) },
  { id: "I003", customerId: "C003", channel: "WhatsApp", interestedItem: "Villa Pool", interestedZone: "Zone D", lastMessage: "Book next weekend", confidence: 0.95, status: "booking_requested", assignedAdmin: "Admin2", createdAt: ago(30) },
  { id: "I004", customerId: "C004", channel: "Instagram", interestedItem: "ห้องสวีท", interestedZone: "Zone B", lastMessage: "ขอดูรูป", confidence: 0.65, status: "new", createdAt: ago(60) },
];

export const customerPreferences: CustomerPreference[] = [
  { id: "P001", customerId: "C001", interestedItem: "ห้องดีลักซ์", interestedZone: "Zone A", preferredDateTime: "2026-07-15 14:00", people: 2, budget: 3000, specialRequest: "ขอวิวสระว่ายน้ำ", urgency: "high", leadStatus: "hot", sourceChannel: "LINE" },
  { id: "P002", customerId: "C002", interestedItem: "ห้องสวีท", interestedZone: "Zone B", preferredDateTime: "2026-07-20 15:00", people: 4, budget: 5000, specialRequest: "ครอบครัว มีเด็ก 2 คน", urgency: "medium", leadStatus: "warm", sourceChannel: "Facebook" },
];

export const uploadedKnowledgeFiles: KnowledgeFile[] = [
  { id: "F001", name: "room-pricelist-2026.pdf", type: "pdf", category: "ราคาห้องพัก", status: "approved", usedByAI: true, uploadedBy: "Owner", uploadedAt: ago(1440) },
  { id: "F002", name: "spa-menu.pdf", type: "pdf", category: "บริการเสริม", status: "pending", usedByAI: false, uploadedBy: "Admin1", uploadedAt: ago(180) },
  { id: "F003", name: "villa-photos.zip", type: "image", category: "รูปภาพ", status: "pending", usedByAI: false, uploadedBy: "Admin2", uploadedAt: ago(60) },
  { id: "F004", name: "old-menu-2024.pdf", type: "pdf", category: "เอกสารเก่า", status: "archived", usedByAI: false, uploadedBy: "Owner", uploadedAt: ago(20000) },
];

export const aiFeedback: AIFeedback[] = [
  { id: "FB001", question: "ห้องดีลักซ์มีอ่างจากุซซี่ไหม", aiAnswer: "ไม่มีค่ะ", correction: "มีค่ะ เฉพาะ Zone A ห้อง 301-305", status: "wrong", confidence: 0.55, conversationId: "CV002", createdAt: ago(120) },
  { id: "FB002", question: "เช็คเอาท์กี่โมง", aiAnswer: "12:00 น. ค่ะ", status: "correct", confidence: 0.98, createdAt: ago(240) },
];

export const campaigns: Campaign[] = [
  { id: "CP001", name: "ต้อนรับลูกค้าใหม่", type: "welcome", segment: "ลูกค้าใหม่ 7 วัน", channel: "LINE", status: "active", approval: "approved", sent: 145, conversion: 23 },
  { id: "CP002", name: "Follow-up Booking", type: "followup", segment: "ค้างจอง", channel: "LINE", status: "active", approval: "approved", sent: 89, conversion: 12 },
  { id: "CP003", name: "โปรโมชั่นพิเศษ ก.ค.", type: "broadcast", segment: "VIP ทั้งหมด", channel: "LINE", status: "draft", approval: "pending", sent: 0, conversion: 0 },
  { id: "CP004", name: "คูปองวันเกิด", type: "coupon", segment: "วันเกิดเดือนนี้", channel: "LINE", status: "active", approval: "approved", sent: 34, conversion: 8 },
  { id: "CP005", name: "เตือนวันจอง", type: "reminder", segment: "จองล่วงหน้า 1 วัน", channel: "LINE", status: "active", approval: "approved", sent: 56, conversion: 50 },
  { id: "CP006", name: "ดึงลูกค้ากลับ", type: "reactivation", segment: "ไม่ active 60 วัน", channel: "LINE", status: "paused", approval: "approved", sent: 23, conversion: 2 },
  { id: "CP007", name: "ตะกร้าค้าง", type: "abandoned", segment: "สอบถามแต่ไม่จอง", channel: "LINE", status: "active", approval: "approved", sent: 67, conversion: 15 },
];

export const products: Product[] = [
  { id: "PR001", name: "ห้องดีลักซ์ Zone A", sku: "ROOM-A-DLX", price: 2500, stock: 3, status: "available", catalogId: "K001", cfKeyword: "A1", updatedAt: ago(60) },
  { id: "PR002", name: "ห้องสวีท Zone B", sku: "ROOM-B-STE", price: 4500, stock: 1, status: "low", catalogId: "K002", cfKeyword: "B1", updatedAt: ago(120) },
  { id: "PR003", name: "ห้องสแตนดาร์ด Zone C", sku: "ROOM-C-STD", price: 1500, stock: 5, status: "available", catalogId: "K003", cfKeyword: "C1", updatedAt: ago(180) },
  { id: "PR004", name: "Villa Pool D", sku: "VILLA-D", price: 8500, stock: 0, status: "out", catalogId: "K004", cfKeyword: "D1", updatedAt: ago(240) },
];

export const orders: Order[] = [
  { id: "O001", customerId: "C001", items: "ห้องดีลักซ์ Zone A x1", amount: 2500, paymentStatus: "paid", fulfillmentStatus: "confirmed", channel: "LINE", createdAt: ago(120) },
  { id: "O002", customerId: "C002", items: "ห้องสวีท Zone B x1", amount: 4500, paymentStatus: "pending_review", fulfillmentStatus: "pending", channel: "Facebook", createdAt: ago(60) },
  { id: "O003", customerId: "C003", items: "Villa Pool D x1", amount: 8500, paymentStatus: "paid", fulfillmentStatus: "confirmed", channel: "WhatsApp", createdAt: ago(30) },
];

export const paymentSlips: PaymentSlip[] = [
  { id: "SL001", customerId: "C002", orderId: "O002", amount: 4500, uploadedAt: ago(50), status: "pending" },
  { id: "SL002", customerId: "C001", orderId: "O001", amount: 2500, uploadedAt: ago(150), status: "approved", reviewer: "Admin1" },
];

export const routes: RouteRecord[] = [
  { id: "RT001", origin: "สนามบินสุวรรณภูมิ", destination: "โรงแรม Main Shop", mode: "drive", provider: "Google Maps", distanceKm: 35.4, etaMin: 45, createdAt: ago(180) },
];

export const aiProviders: AIProvider[] = [
  {
    id: "AI001",
    name: "Gemini",
    providerLabel: "Lovable AI / Google Gemini API",
    status: "active",
    model: "google/gemini-2.5-flash-lite",
    maskedKey: "—",
    role: "primary",
    costLimit: 0,
    systemPrompt: "คุณคือผู้ช่วย AI ของร้าน ตอบลูกค้าอย่างสุภาพ กระชับ และเป็นมิตร",
  },
];

export const chatIntegrations: ChatIntegration[] = [
  { id: "CH001", name: "LINE OA", channelType: "LINE", status: "disconnected", inboundPath: "/api/public/webhook/line", sendEndpoint: "https://api.line.me/v2/bot/message/reply", webhookUrl: "/api/public/webhook/line", maskedToken: "—" },
  { id: "CH002", name: "Telegram", channelType: "TELEGRAM", status: "disconnected", inboundPath: "/api/public/webhook/telegram", sendEndpoint: "https://api.telegram.org/bot<TOKEN>/sendMessage", webhookUrl: "/api/public/webhook/telegram", maskedToken: "—" },
  { id: "CH003", name: "Facebook Messenger", channelType: "MESSENGER", status: "disconnected", inboundPath: "/api/public/webhook/messenger", sendEndpoint: "https://graph.facebook.com/v20.0/me/messages", webhookUrl: "/api/public/webhook/messenger", maskedToken: "—" },
  { id: "CH004", name: "Instagram DM", channelType: "INSTAGRAM", status: "disconnected", inboundPath: "/api/public/webhook/instagram", sendEndpoint: "https://graph.facebook.com/v20.0/me/messages", webhookUrl: "/api/public/webhook/instagram", maskedToken: "—" },
  { id: "CH005", name: "WhatsApp Business", channelType: "WHATSAPP", status: "disconnected", inboundPath: "/api/public/webhook/whatsapp", sendEndpoint: "https://graph.facebook.com/v20.0/<PHONE_NUMBER_ID>/messages", webhookUrl: "/api/public/webhook/whatsapp", maskedToken: "—" },
  { id: "CH006", name: "Website Live Chat", channelType: "WEB", status: "disconnected", inboundPath: "/api/public/webhook/web", sendEndpoint: "", webhookUrl: "/api/public/webhook/web", maskedToken: "—" },
  { id: "CH007", name: "Custom Webhook", channelType: "CUSTOM", status: "disconnected", inboundPath: "/api/public/webhook/custom", sendEndpoint: "", webhookUrl: "/api/public/webhook/custom", maskedToken: "—" },
];

export const webhookTestLogs: WebhookTestLog[] = [
  { id: "WT001", event: "customer_message", payload: "{...}", response: "200 OK", status: "ok", at: ago(60) },
  { id: "WT002", event: "booking_request", payload: "{...}", response: "200 OK", status: "ok", at: ago(120) },
];

export const notificationRules: NotificationRule[] = [
  { id: "NR001", trigger: "ลูกค้าเลือกห้อง/โซน/สินค้า", channel: "LINE", template: "🛏️ ลูกค้า {name} สนใจ {item} โซน {zone}", enabled: true, lastSent: ago(5), priority: "high" },
  { id: "NR002", trigger: "ขอจอง", channel: "LINE", template: "📅 มีคำขอจอง {item} วันที่ {date}", enabled: true, lastSent: ago(30), priority: "high" },
  { id: "NR003", trigger: "ตรวจพบเบอร์โทร", channel: "Telegram", template: "📞 เบอร์โทร {phone} จาก {name}", enabled: true, priority: "medium" },
  { id: "NR004", trigger: "ลูกค้าขอส่วนลด", channel: "LINE", template: "💸 ขอส่วนลด: {detail}", enabled: true, priority: "medium" },
  { id: "NR005", trigger: "ตรวจพบการร้องเรียน", channel: "LINE", template: "⚠️ ร้องเรียน: {detail}", enabled: true, priority: "high" },
  { id: "NR006", trigger: "AI confidence ต่ำ", channel: "Telegram", template: "🤖 AI ตอบไม่ชัวร์: {q}", enabled: true, priority: "low" },
  { id: "NR007", trigger: "รอตรวจสอบสลิป", channel: "LINE", template: "🧾 มีสลิปรอตรวจสอบ", enabled: true, priority: "high" },
];

export const roles: Role[] = [
  { id: "R1", name: "Owner", description: "เจ้าของระบบ สิทธิ์สูงสุด ลบไม่ได้", permissions: ["*"] },
  { id: "R2", name: "Admin", description: "ผู้ดูแลระบบ", permissions: ["inbox.write","booking.write","product.write","ai.train"] },
  { id: "R3", name: "Manager", description: "ผู้จัดการ", permissions: ["inbox.read","booking.write","report.read"] },
  { id: "R4", name: "Agent", description: "เจ้าหน้าที่ตอบแชท", permissions: ["inbox.write"] },
  { id: "R5", name: "Viewer", description: "ดูเท่านั้น", permissions: ["*.read"] },
  { id: "R6", name: "Finance", description: "ฝ่ายการเงิน", permissions: ["payment.write","report.read"] },
  { id: "R7", name: "Developer", description: "นักพัฒนา", permissions: ["integration.write","webhook.test"] },
];

export const users: User[] = [
  { id: "U1", name: "Owner Main", email: "owner@shop.local", roleId: "R1", status: "active", lastLogin: ago(30) },
  { id: "U2", name: "Admin หนึ่ง", email: "admin1@shop.local", roleId: "R2", status: "active", lastLogin: ago(60) },
  { id: "U3", name: "Admin สอง", email: "admin2@shop.local", roleId: "R2", status: "active", lastLogin: ago(120) },
  { id: "U4", name: "Agent เอ", email: "agent@shop.local", roleId: "R4", status: "active", lastLogin: ago(15) },
  { id: "U5", name: "Finance ฝ่าย", email: "finance@shop.local", roleId: "R6", status: "active", lastLogin: ago(240) },
];

export const auditLogs: AuditLog[] = [
  { id: "A1", at: ago(5), actor: "Admin1", role: "Admin", action: "approve_payment_slip", target: "SL001", status: "success", ip: "203.0.113.5" },
  { id: "A2", at: ago(20), actor: "Owner", role: "Owner", action: "rotate_ai_key", target: "AI001", status: "success", ip: "203.0.113.1" },
  { id: "A3", at: ago(60), actor: "Admin2", role: "Admin", action: "create_booking", target: "B003", status: "success", ip: "203.0.113.7" },
];

export const usageLogs: UsageLog[] = [
  { id: "UL1", at: ago(5), feature: "chat_reply", provider: "Gemini", model: "gemini-2.0-flash", tokens: 1240, cost: 0.012, status: "ok", conversationId: "CV001" },
  { id: "UL2", at: ago(15), feature: "visual_catalog", provider: "Gemini", model: "gemini-2.0-flash", tokens: 850, cost: 0.008, status: "ok", conversationId: "CV001" },
  { id: "UL3", at: ago(45), feature: "knowledge_search", provider: "OpenAI", model: "text-embedding-3", tokens: 450, cost: 0.002, status: "ok" },
];

export const errorLogs: ErrorLog[] = [
  { id: "EL1", at: ago(120), source: "line-webhook", type: "TimeoutError", message: "LINE webhook timeout 5s", status: "resolved", retries: 2, ownerNotified: true },
  { id: "EL2", at: ago(30), source: "ai-gateway", type: "RateLimitError", message: "Gemini rate limit hit", status: "open", retries: 3, ownerNotified: true },
];

export const backupJobs: BackupJob[] = [
  { id: "BK1", target: "cloud", lastBackup: ago(180), size: "1.2 GB", retention: "30 วัน", nextSchedule: "ทุกวัน 02:00", status: "ok" },
  { id: "BK2", target: "nas", lastBackup: ago(720), size: "8.4 GB", retention: "180 วัน", nextSchedule: "ทุกสัปดาห์ อาทิตย์ 03:00", status: "ok" },
];

export const securitySettings: SecuritySettings = {
  require2FA: true,
  sessionTimeoutMin: 60,
  ipAllowlist: ["203.0.113.0/24"],
  loginAlerts: true,
  dataExportApproval: true,
  secretRotationDays: 90,
  disableInactive: true,
  webhookSignatureValidation: true,
};

export const ownerNotificationLogs: OwnerNotificationLog[] = [
  { id: "ON1", at: ago(5), trigger: "ลูกค้าเลือก Zone A", channel: "LINE", message: "🛏️ คุณสมชาย สนใจห้องดีลักซ์ Zone A", status: "sent" },
  { id: "ON2", at: ago(60), trigger: "ขอจอง", channel: "LINE", message: "📅 ขอจอง Villa Pool D วันที่ 1 ส.ค.", status: "sent" },
];

export const copilotMessages: CopilotMessage[] = [
  { id: "CM1", sender: "copilot", text: "สวัสดีค่ะ ฉันคือ AI Copilot ใช้สั่งการระบบได้เลย เช่น เพิ่มห้องใหม่ ตรวจการจอง หรือเตือนเจ้าของ", at: ago(60) },
];
