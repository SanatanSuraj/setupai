"use client";

import { useState } from "react";
import { CheckCircle2, Plus, X } from "lucide-react";

export function ActiveTasks() {
  const [tasks, setTasks] = useState([
    { label: "Finalize Rent Agreement", status: "done", date: "Oct 24" },
    { label: "Submit Fire NOC Application", status: "pending", date: "Oct 28" },
    { label: "Procure Biochemistry Analyzer", status: "todo", date: "Nov 02" },
    { label: "Staffing - Hire Phlebotomists", status: "todo", date: "Nov 05" },
  ]);
  const [isAdding, setIsAdding] = useState(false);
  const [newTask, setNewTask] = useState("");

  const toggleTask = (index: number) => {
    setTasks((prev) =>
      prev.map((task, i) => {
        if (i === index) {
          return { ...task, status: task.status === "done" ? "todo" : "done" };
        }
        return task;
      })
    );
  };

  const addTask = () => {
    if (!newTask.trim()) {
      setIsAdding(false);
      return;
    }
    const date = new Date().toLocaleDateString("en-US", { month: "short", day: "2-digit" });
    setTasks([...tasks, { label: newTask, status: "todo", date }]);
    setNewTask("");
    setIsAdding(false);
  };

  return (
    <div className="space-y-3">
      {tasks.map((task, i) => (
        <div
          key={i}
          onClick={() => toggleTask(i)}
          className="flex items-center justify-between p-3.5 bg-slate-50/50 border border-slate-100 rounded-2xl hover:bg-slate-50 transition-colors cursor-pointer group"
        >
          <div className="flex items-center gap-3">
            {task.status === "done" ? (
              <CheckCircle2 size={20} className="text-emerald-500 shrink-0" />
            ) : (
              <div
                className={`w-5 h-5 border-2 rounded-full shrink-0 group-hover:border-blue-400 ${
                  task.status === "pending"
                    ? "border-amber-400"
                    : "border-slate-300"
                }`}
              />
            )}
            <span
              className={`text-sm font-bold ${
                task.status === "done"
                  ? "text-slate-400 line-through"
                  : "text-slate-700"
              }`}
            >
              {task.label}
            </span>
          </div>
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
            {task.date}
          </span>
        </div>
      ))}

      {isAdding ? (
        <div className="flex items-center gap-2 p-2 border border-blue-200 rounded-2xl bg-blue-50/50 animate-in fade-in slide-in-from-top-2">
          <input
            autoFocus
            type="text"
            value={newTask}
            onChange={(e) => setNewTask(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && addTask()}
            placeholder="Enter task name..."
            className="flex-1 bg-transparent border-none text-sm outline-none text-slate-700 placeholder:text-slate-400 px-2"
          />
          <button
            onClick={addTask}
            className="p-1.5 hover:bg-blue-200 rounded-xl text-blue-600 transition-colors"
          >
            <Plus size={16} />
          </button>
          <button
            onClick={() => setIsAdding(false)}
            className="p-1.5 hover:bg-red-200 rounded-xl text-red-500 transition-colors"
          >
            <X size={16} />
          </button>
        </div>
      ) : (
        <button
          onClick={() => setIsAdding(true)}
          className="mt-4 flex w-full py-3 border-2 border-dashed border-slate-200 rounded-2xl text-slate-400 text-xs font-black uppercase tracking-widest hover:border-blue-300 hover:text-blue-500 transition-all justify-center items-center gap-2"
        >
          <Plus size={14} /> New Roadmap Task
        </button>
      )}
    </div>
  );
}