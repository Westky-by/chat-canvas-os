import { useEffect, useState } from "react";
import { fmtRelative } from "@/utils/formatters";

export function RelativeTime({ iso }: { iso: string }) {
  const [text, setText] = useState("");
  useEffect(() => {
    setText(fmtRelative(iso));
    const t = setInterval(() => setText(fmtRelative(iso)), 30_000);
    return () => clearInterval(t);
  }, [iso]);
  return <span suppressHydrationWarning>{text || "—"}</span>;
}
