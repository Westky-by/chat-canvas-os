import type { ReactNode } from "react";

export interface Column<T> {
  key: string;
  header: string;
  render?: (row: T) => ReactNode;
  className?: string;
}

export function DataTable<T extends { id: string }>({
  columns,
  data,
  empty = "ไม่มีข้อมูล",
}: {
  columns: Column<T>[];
  data: T[];
  empty?: string;
}) {
  return (
    <div className="overflow-x-auto rounded-xl border border-border bg-surface">
      <table className="w-full text-xs">
        <thead className="bg-surface-elevated">
          <tr>
            {columns.map((c) => (
              <th
                key={c.key}
                className={`text-left px-4 py-2.5 font-medium text-muted-foreground uppercase tracking-wider text-[10px] ${c.className ?? ""}`}
              >
                {c.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.length === 0 ? (
            <tr>
              <td colSpan={columns.length} className="text-center text-muted-foreground py-10">
                {empty}
              </td>
            </tr>
          ) : (
            data.map((row) => (
              <tr key={row.id} className="border-t border-border hover:bg-surface-hover transition">
                {columns.map((c) => (
                  <td key={c.key} className={`px-4 py-2.5 ${c.className ?? ""}`}>
                    {c.render ? c.render(row) : (row as Record<string, ReactNode>)[c.key]}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
