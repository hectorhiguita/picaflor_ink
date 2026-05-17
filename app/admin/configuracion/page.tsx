import { db } from "@/server/db";

export default async function AdminSettingsPage() {
  const settings = await db.siteSetting.findMany({
    orderBy: { key: "asc" },
    select: { key: true, valueJson: true },
  });

  return (
    <section>
      <h1 className="text-3xl font-bold">Configuración</h1>
      <div className="mt-6 grid gap-3">
        {settings.map((setting) => (
          <div key={setting.key} className="rounded-lg p-4" style={{ backgroundColor: "var(--color-surface)", border: "1px solid var(--color-border)" }}>
            <strong>{setting.key}</strong>
            <pre className="mt-2 overflow-x-auto text-xs" style={{ color: "var(--color-text-secondary)" }}>
              {JSON.stringify(setting.valueJson, null, 2)}
            </pre>
          </div>
        ))}
      </div>
    </section>
  );
}

