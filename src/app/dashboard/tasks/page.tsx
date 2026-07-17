import { TasksManager } from "@/components/dashboard/TasksManager";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "إدارة المهام | Gym System",
  description: "إدارة مهامك اليومية",
};

export default function TasksPage() {
  return (
    <div className="max-w-7xl mx-auto space-y-8">
      <TasksManager />
    </div>
  );
}
