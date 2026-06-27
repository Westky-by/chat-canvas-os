# แผนเปลี่ยน Mock → Production จริง ทั้งระบบ

ปัจจุบัน "ใช้งานจริง" แล้ว: LINE webhook (รับ + AI ตอบ), Unified Inbox อ่าน DB จริง, AI Providers ผ่าน Lovable AI Gateway, Owner Auth. ที่เหลือเป็น zustand seed ใน `mockData.ts` — แผนนี้ย้ายเป็น Supabase + CRUD + Realtime ตามลำดับที่คุณเลือก โดยคง demo ไว้สำหรับบัญชีที่ไม่ใช่ owner.

## หลักการ
- ทุกตารางใหม่ใน `public.*` มี RLS + GRANT ครบ, owner เห็น+แก้ทุก row ผ่าน `has_role('owner')`
- ทุกหน้าเปลี่ยนจาก `useAppStore` → TanStack Query + `createServerFn`/Supabase client; เก็บ `mockData.ts` ไว้ fallback ตอน DB ว่าง
- ทุก webhook ใน `src/routes/api/public/webhook.$channel.ts` เพิ่ม signature verify + reply จริง โหลด token จาก secrets (เหมือนที่ LINE ทำแล้ว)

---

## Phase 1 — Customers / CRM / Notes  *(เริ่มก่อน)*
**DB**
- `customers` (name, channel, external_id, phone, email, tier, tags[], note, last_activity, owner_user_id)
- `customer_notes` (customer_id, body, created_by, created_at)
- เปิด Realtime + auto-create จาก webhook (LINE/TG/Meta) เมื่อเจอ external_user_id ใหม่

**UI**
- `CRMPage` ดึงจาก `customers` + แก้ tag/tier/note inline
- Unified Inbox อ้าง `customers` แทน mock — กดบทสนทนา → จับคู่ค้นโดย channel+external_id
- ปุ่ม "Open Chat" จาก CRM พา `?customer=<uuid>` ไป `/inbox`

## Phase 2 — Bookings / Orders / Payment Slips
**DB**
- `bookings`, `orders`, `order_items`, `payment_slips` (พร้อม FK → customers)
- Storage bucket `payment-slips` (private, signed URL)

**UI/Logic**
- BookingManager / Orders / SlipReview ใช้ Supabase + RLS
- Action buttons (Confirm/Reschedule/Cancel/Approve slip) เรียก `createServerFn`
- AI ในแชทเรียก server fn `createBookingFromConversation` ได้จริง (tool call)

## Phase 3 — Catalog / Products / Stock
**DB**
- `catalog_items`, `products` + Storage bucket `catalog-images` (public read)
- `product_stock_logs` สำหรับ audit

**UI**
- Visual Catalog & Product upload ภาพจริงเข้า Storage (แทน base64 ใน localStorage)
- AI ดึง catalog ตาม `cf_keyword` มาแนบในแชทอัตโนมัติ

## Phase 4 — AI Knowledge / Feedback / Campaigns / Logs
**DB**
- `knowledge_files` + bucket `ai-knowledge`
- `ai_feedback`, `campaigns`, `audit_logs`, `usage_logs`, `error_logs`, `owner_notifications`
- ทุก server fn เขียน `audit_logs`/`usage_logs` จริง; webhook ที่ error เขียน `error_logs`

**UI**
- หน้า Logs อ่าน DB จริง + filter/date range/CSV export จาก server fn
- Campaign "Broadcast" ส่งผ่าน LINE/TG จริง (batch with rate limit)

---

## Channels เพิ่มเติม (ขนานกับเฟส)

### Telegram
- เพิ่ม connector Telegram (ใช้ Lovable Connector Gateway → ไม่ต้องเก็บ bot token เอง)
- Webhook `/api/public/webhook/telegram` verify `X-Telegram-Bot-Api-Secret-Token`
- Reply ผ่าน `connector-gateway.lovable.dev/telegram/sendMessage`

### Messenger / Instagram (Meta)
- ใช้ Page Access Token ที่ผู้ใช้กรอกในหน้า Chat Integrations (เก็บใน DB ตาราง `chat_integrations` แทน localStorage)
- Webhook verify `X-Hub-Signature-256` ด้วย App Secret
- Reply ผ่าน `graph.facebook.com/v20.0/me/messages`

### WhatsApp Cloud API
- เก็บ Permanent Token + Phone Number ID ใน `chat_integrations`
- Webhook verify hub signature + verify_token challenge (GET)
- Reply ผ่าน `graph.facebook.com/v20.0/<PHONE_NUMBER_ID>/messages`

> Token ทุกช่องย้ายจาก `localStorage` (zustand persist) → ตาราง `chat_integrations` ใน DB เพื่อให้ server-side webhook อ่านได้จริง (ไม่งั้น webhook ไม่เห็น token เหมือนเคสที่เกิดกับ LINE ก่อนหน้า)

---

## Secrets ที่ต้องเพิ่ม
- `TELEGRAM_API_KEY` (ผ่าน connector — ผมจะเรียก standard_connectors--connect ให้)
- `META_APP_SECRET` (สำหรับ verify webhook signature ของ Messenger/IG/WhatsApp)
- `META_WEBHOOK_VERIFY_TOKEN` (สำหรับ GET challenge — generate ให้)
- WhatsApp/Meta Page tokens กรอกจาก UI Chat Integrations ลง DB

---

## ขนาดงาน & ลำดับส่ง
- **เทิร์นนี้:** เริ่ม Phase 1 (Customers + CRM + Notes) + ย้าย `chat_integrations` ไป DB — เป็นพื้นฐานที่อีก 3 เฟสและ 3 channel ต้องอ้าง
- **เทิร์นถัดไป:** Phase 2, แล้ว 3, แล้ว 4 ตามลำดับ
- **ขนานกัน:** Telegram (เร็วสุด) → Meta → WhatsApp
- หลังจบแต่ละเฟสจะให้คุณกด Publish เพื่อให้ webhook + DB ขึ้น production

ขอ approve แผนนี้แล้วผมจะเริ่ม Phase 1 + ย้าย chat_integrations ทันทีครับ.
