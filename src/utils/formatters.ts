export const fmtTHB = (n: number) =>
  new Intl.NumberFormat("th-TH", { style: "currency", currency: "THB", maximumFractionDigits: 0 }).format(n);

export const fmtNumber = (n: number) => new Intl.NumberFormat("th-TH").format(n);

export const fmtRelative = (iso: string) => {
  const diff = (Date.now() - new Date(iso).getTime()) / 1000;
  if (diff < 60) return `${Math.round(diff)} วินาทีที่แล้ว`;
  if (diff < 3600) return `${Math.round(diff / 60)} นาทีที่แล้ว`;
  if (diff < 86400) return `${Math.round(diff / 3600)} ชม.ที่แล้ว`;
  return `${Math.round(diff / 86400)} วันที่แล้ว`;
};

export const fmtDateTime = (iso: string) =>
  new Date(iso).toLocaleString("th-TH", { dateStyle: "short", timeStyle: "short" });
