"use client";

import React, { useEffect, useState } from "react";
import type { NotificationTask } from "../../lib/notification-store";

export default function NotificationsPage() {
  const [tasks, setTasks] = useState<NotificationTask[]>([]);
  const [form, setForm] = useState({ vehicleId: "", garageId: "", type: "maintenance", title: "", dueDate: "", enabled: true });

  useEffect(() => {
    (async () => {
      const res = await fetch("/api/notifications");
      const list = (await res.json()) as NotificationTask[];
      setTasks(Array.isArray(list) ? list : []);
    })();
  }, []);

  const refresh = async () => {
    const res = await fetch("/api/notifications");
    const list = (await res.json()) as NotificationTask[];
    setTasks(Array.isArray(list) ? list : []);
  };

  const saveTask = async () => {
    await fetch("/api/notifications", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
    setForm({ vehicleId: "", garageId: "", type: "maintenance", title: "", dueDate: "", enabled: true });
    await refresh();
  };

  const markComplete = async (taskId: string) => {
    await fetch("/api/notifications", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: taskId, completed: true, status: "completed" }) });
    await refresh();
  };

  const statusLabel = (task: NotificationTask) => {
    if (task.completed) return "Completed";
    if (task.status === "due_soon") return "Due Soon";
    if (task.status === "overdue") return "Overdue";
    return "Upcoming";
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-white">Notifications</h1>
      </div>

      <section className="rounded-2xl border border-white/8 bg-slate-900/40 p-4">
        <h2 className="text-lg font-semibold text-white">Create reminder</h2>
        <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-2">
          <input value={form.title} onChange={(e) => setForm((s) => ({ ...s, title: e.target.value }))} placeholder="Title" className="rounded-md bg-slate-900/60 px-3 py-2 text-sm text-slate-200" />
          <select value={form.type} onChange={(e) => setForm((s) => ({ ...s, type: e.target.value as any }))} className="rounded-md bg-slate-900/60 px-3 py-2 text-sm text-slate-200">
            <option value="licence">Licence expiration</option>
            <option value="registration">Registration renewal</option>
            <option value="protection">Protection</option>
            <option value="maintenance">Maintenance</option>
          </select>
          <input type="date" value={form.dueDate} onChange={(e) => setForm((s) => ({ ...s, dueDate: e.target.value }))} className="rounded-md bg-slate-900/60 px-3 py-2 text-sm text-slate-200" />
          <input value={form.vehicleId} onChange={(e) => setForm((s) => ({ ...s, vehicleId: e.target.value }))} placeholder="Vehicle ID (optional)" className="rounded-md bg-slate-900/60 px-3 py-2 text-sm text-slate-200" />
          <input value={form.garageId} onChange={(e) => setForm((s) => ({ ...s, garageId: e.target.value }))} placeholder="Garage ID (optional)" className="rounded-md bg-slate-900/60 px-3 py-2 text-sm text-slate-200" />
          <label className="inline-flex items-center gap-2 text-sm text-slate-300">
            <input type="checkbox" checked={form.enabled} onChange={(e) => setForm((s) => ({ ...s, enabled: e.target.checked }))} />
            Enabled
          </label>
        </div>
        <button onClick={saveTask} className="mt-4 rounded-md bg-amber-400 px-3 py-2 text-sm font-semibold text-slate-900">Create reminder</button>
      </section>

      <section className="rounded-2xl border border-white/8 bg-slate-900/40 p-4">
        <h2 className="text-lg font-semibold text-white">Upcoming Tasks</h2>
        <div className="mt-4 space-y-3">
          {tasks.map((task) => (
            <div key={task.id} className="rounded-xl border border-white/8 bg-slate-800/40 p-4">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <div className="font-semibold text-white">{task.title}</div>
                  <div className="text-sm text-slate-400">{task.type} • Due {task.dueDate}</div>
                </div>
                <div className="text-right text-sm text-slate-300">
                  <div>{statusLabel(task)}</div>
                  {!task.completed && !task.readonly ? <button onClick={() => markComplete(task.id)} className="mt-2 rounded-md bg-emerald-500/20 px-2 py-1 text-sm text-emerald-200">Mark completed</button> : null}
                  {task.readonly ? <div className="mt-2 text-xs text-slate-500">Derived from vehicle schedule</div> : null}
                </div>
              </div>
            </div>
          ))}
          {tasks.length === 0 ? <div className="rounded-xl border border-dashed border-white/8 p-4 text-sm text-slate-400">No reminders yet.</div> : null}
        </div>
      </section>
    </div>
  );
}
