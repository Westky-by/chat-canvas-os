import { PageContainer } from "@/components/layout/PageContainer";
import { ActionButton } from "@/components/common/ActionButton";
import { StatusBadge } from "@/components/common/StatusBadge";
import { useAppStore } from "@/store/useAppStore";
import { RelativeTime } from "@/components/common/RelativeTime";
import { Cloud, HardDrive, Download, Play, Database, FileText, AlertTriangle } from "lucide-react";

export function BackupExportPage() {
  const jobs = useAppStore((s) => s.backupJobs);
  const run = useAppStore((s) => s.runBackup);
  const exportDB = useAppStore((s) => s.exportDatabase);
  const exportFiles = useAppStore((s) => s.exportFiles);

  return (
    <PageContainer title="Backup & Export" description="Cloud คือ production • NAS ใช้สำหรับ backup และ archive เท่านั้น">
      <div className="bg-info/10 border border-info/30 text-info rounded-xl p-3 text-xs flex items-center gap-2">
        <AlertTriangle className="w-4 h-4" /> Production รันบน Cloud — NAS ใช้สำหรับ backup, archive, รายงานส่งออก และ disaster recovery เท่านั้น
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {jobs.map((j) => (
          <div key={j.id} className="bg-surface border border-border rounded-xl p-5">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${j.target === "cloud" ? "bg-primary/10 text-primary" : "bg-info/10 text-info"}`}>
                  {j.target === "cloud" ? <Cloud className="w-5 h-5" /> : <HardDrive className="w-5 h-5" />}
                </div>
                <div>
                  <div className="font-semibold text-sm capitalize">{j.target === "cloud" ? "Cloud Production Backup" : "NAS Archive Backup"}</div>
                  <div className="text-[11px] text-muted-foreground">{j.target === "cloud" ? "หลัก • Disaster recovery" : "สำรอง • ไฟล์ archive และรายงาน"}</div>
                </div>
              </div>
              <StatusBadge label={j.status} variant="success" />
            </div>
            <div className="grid grid-cols-2 gap-2 text-[11px]">
              <Info label="Last backup" value={<RelativeTime iso={j.lastBackup} />} />
              <Info label="Size" value={j.size} />
              <Info label="Retention" value={j.retention} />
              <Info label="Next schedule" value={j.nextSchedule} />
            </div>
            <div className="flex gap-2 mt-3 pt-3 border-t border-border">
              <ActionButton size="sm" variant="primary" icon={<Play className="w-3 h-3" />} onClick={() => run(j.target)}>Run Backup</ActionButton>
              <ActionButton size="sm" icon={<Download className="w-3 h-3" />} onClick={() => exportFiles()}>Download Report</ActionButton>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-surface border border-border rounded-xl p-5">
        <h3 className="text-sm font-semibold mb-3">Export & Disaster Recovery</h3>
        <div className="flex flex-wrap gap-2">
          <ActionButton variant="primary" icon={<Database className="w-3 h-3" />} onClick={exportDB}>Export Database</ActionButton>
          <ActionButton icon={<FileText className="w-3 h-3" />} onClick={exportFiles}>Export Files</ActionButton>
          <ActionButton variant="outline" icon={<Download className="w-3 h-3" />} onClick={exportFiles}>Download Recovery Report</ActionButton>
        </div>
        <ul className="text-[11px] text-muted-foreground mt-4 space-y-1 list-disc pl-5">
          <li>เข้ารหัสไฟล์สำรองทั้ง at-rest และ in-transit</li>
          <li>ทดสอบ restore ทุกเดือนเพื่อยืนยันว่าไฟล์ใช้งานได้จริง</li>
          <li>เก็บไฟล์ archive บน NAS อย่างน้อย 180 วัน</li>
          <li>มี runbook สำหรับ disaster recovery</li>
        </ul>
      </div>
    </PageContainer>
  );
}

const Info = ({ label, value }: { label: string; value: string }) => (
  <div className="bg-background rounded-lg px-2 py-1.5">
    <div className="text-muted-foreground text-[10px] uppercase tracking-wider">{label}</div>
    <div className="text-xs font-medium mt-0.5">{value}</div>
  </div>
);
