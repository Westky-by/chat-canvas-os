import { useState } from "react";
import { Bot, Send, Image as ImageIcon, Sparkles, Link2 } from "lucide-react";
import { Drawer } from "@/components/common/Drawer";
import { ActionButton } from "@/components/common/ActionButton";
import { useAppStore } from "@/store/useAppStore";
import { toast } from "sonner";

export function AICopilotDrawer() {
  const [open, setOpen] = useState(false);
  const [text, setText] = useState("");
  const messages = useAppStore((s) => s.copilotMessages);
  const addMsg = useAppStore((s) => s.addCopilotMessage);
  const addCatalog = useAppStore((s) => s.addCatalogItemFromCopilot);

  const send = () => {
    if (!text.trim()) return;
    const userText = text.trim();
    addMsg("user", userText);
    setText("");
    setTimeout(() => {
      const lower = userText.toLowerCase();
      if (lower.includes("เพิ่มห้อง") || lower.includes("เพิ่มสินค้า") || lower.includes("add room") || lower.includes("catalog")) {
        addCatalog({ title: `รายการใหม่: ${userText.slice(0, 30)}`, price: 1990, cfKeyword: "NEW1" });
        addMsg("copilot", "เพิ่มเข้า Visual Catalog เรียบร้อย และบันทึก audit log แล้วค่ะ");
      } else if (lower.includes("เตือน") || lower.includes("notify")) {
        useAppStore.getState().notifyOwner("Copilot manual", userText);
        addMsg("copilot", "ส่งแจ้งเตือนเจ้าของผ่าน LINE เรียบร้อยค่ะ");
      } else {
        addMsg("copilot", `รับคำสั่ง: "${userText}" (mock) — สามารถสั่งเพิ่มห้อง/สินค้า, เตือนเจ้าของ หรือเช็คการจองได้ค่ะ`);
      }
    }, 400);
  };

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-6 right-6 z-30 w-14 h-14 rounded-full bg-primary text-primary-foreground shadow-xl shadow-primary/30 flex items-center justify-center hover:scale-105 transition"
        aria-label="AI Copilot"
      >
        <Bot className="w-6 h-6" />
      </button>

      <Drawer open={open} onClose={() => setOpen(false)} title="AI Copilot" width="max-w-md">
        <div className="flex flex-col h-full">
          <div className="px-4 py-3 border-b border-border bg-surface-elevated/40 text-[11px] text-muted-foreground flex items-center gap-2">
            <Sparkles className="w-3 h-3 text-primary" />
            สั่งงานระบบด้วยภาษาธรรมชาติ • เพิ่ม/แก้ catalog, เตือนเจ้าของ, เช็คการจอง
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {messages.map((m) => (
              <div key={m.id} className={`flex ${m.sender === "user" ? "justify-end" : "justify-start"}`}>
                <div
                  className={`max-w-[80%] px-3 py-2 rounded-2xl text-xs ${
                    m.sender === "user"
                      ? "bg-primary text-primary-foreground rounded-br-sm"
                      : "bg-surface-elevated text-foreground rounded-bl-sm border border-border"
                  }`}
                >
                  {m.text}
                </div>
              </div>
            ))}
          </div>

          <div className="border-t border-border p-3 space-y-2">
            <div className="flex gap-1.5 flex-wrap">
              <ActionButton size="sm" variant="outline" icon={<ImageIcon className="w-3 h-3" />} onClick={() => toast.info("แนบรูปแล้ว (mock)")}>
                แนบรูป
              </ActionButton>
              <ActionButton size="sm" variant="outline" icon={<Link2 className="w-3 h-3" />} onClick={() => toast.success("ผูก Copilot กับ Telegram แล้ว (mock)")}>
                ผูก Telegram
              </ActionButton>
              <ActionButton size="sm" variant="outline" onClick={() => { addCatalog({ title: "ห้อง Demo จาก Copilot", price: 1500, cfKeyword: "DEMO" }); }}>
                เพิ่มสินค้าตัวอย่าง
              </ActionButton>
            </div>
            <div className="flex gap-2">
              <input
                value={text}
                onChange={(e) => setText(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && send()}
                placeholder="พิมพ์คำสั่ง เช่น เพิ่มห้อง Pool Suite ราคา 5500"
                className="flex-1 bg-background border border-border rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-primary"
              />
              <ActionButton variant="primary" onClick={send} icon={<Send className="w-3.5 h-3.5" />}>
                ส่ง
              </ActionButton>
            </div>
          </div>
        </div>
      </Drawer>
    </>
  );
}
