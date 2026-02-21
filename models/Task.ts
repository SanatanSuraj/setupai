import type { ITask, TaskStatus } from "@/types";

export const taskStatuses: TaskStatus[] = ["pending", "in_progress", "completed", "blocked"];

export const taskSchema = {
  title: String,
  status: { type: String, enum: taskStatuses, default: "pending" },
  dependency: String,
  dueDate: Date,
  module: String,
};

export type { ITask };
