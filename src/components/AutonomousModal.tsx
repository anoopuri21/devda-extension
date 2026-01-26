import React, { useState, useEffect } from "react";
import { X, Clock, Play, Trash2, CheckCircle, AlertCircle, Loader2 } from "lucide-react";
import { Button } from "./ui/Button";

interface ScheduledTask {
  id: string;
  description: string;
  scheduledTime: number;
  prompt: string;
  status: "pending" | "running" | "completed" | "failed";
  result?: string;
}

interface AutonomousModeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AutonomousModeModal({ isOpen, onClose }: AutonomousModeModalProps) {
  const [tasks, setTasks] = useState<ScheduledTask[]>([]);
  const [newTask, setNewTask] = useState("");
  const [scheduleTime, setScheduleTime] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      loadTasks();
    }
  }, [isOpen]);

  const loadTasks = async () => {
    const response = await chrome.runtime.sendMessage({ type: "GET_SCHEDULED_TASKS" });
    setTasks(response.tasks || []);
  };

  const scheduleTask = async () => {
    if (!newTask.trim() || !scheduleTime) return;

    setIsLoading(true);

    const scheduledTime = new Date(scheduleTime).getTime();

    await chrome.runtime.sendMessage({
      type: "SCHEDULE_TASK",
      description: newTask.split(" ").slice(0, 5).join(" ") + "...",
      scheduledTime,
      prompt: newTask,
    });

    setNewTask("");
    setScheduleTime("");
    await loadTasks();
    setIsLoading(false);
  };

  const cancelTask = async (taskId: string) => {
    await chrome.runtime.sendMessage({ type: "CANCEL_TASK", taskId });
    await loadTasks();
  };

  const formatTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleString("en-IN", {
      dateStyle: "short",
      timeStyle: "short",
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-card border border-border rounded-xl w-full max-w-lg max-h-[85vh] overflow-hidden shadow-2xl animate-scale-in">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border bg-gradient-primary">
          <div className="flex items-center gap-2 text-white">
            <Clock className="h-5 w-5" />
            <h2 className="text-lg font-semibold">Autonomous Mode</h2>
          </div>
          <button onClick={onClose} className="p-1.5 hover:bg-white/20 rounded-lg text-white">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 space-y-4 overflow-y-auto max-h-[60vh]">
          {/* New Task Form */}
          <div className="space-y-3">
            <label className="block text-sm font-medium">
              🤖 Schedule a Task
            </label>
            <textarea
              value={newTask}
              onChange={(e) => setNewTask(e.target.value)}
              placeholder="e.g., Kal subah tak login page + dark mode daal dena, main so jata hu..."
              className="input-base w-full h-20 resize-none"
            />
            <div className="flex gap-2">
              <input
                type="datetime-local"
                value={scheduleTime}
                onChange={(e) => setScheduleTime(e.target.value)}
                className="input-base flex-1"
              />
              <Button onClick={scheduleTask} disabled={isLoading || !newTask.trim()}>
                {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Play className="h-4 w-4" />}
              </Button>
            </div>
          </div>

          {/* Scheduled Tasks */}
          <div className="space-y-2">
            <label className="block text-sm font-medium">
              📋 Scheduled Tasks ({tasks.length})
            </label>

            {tasks.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Clock className="h-10 w-10 mx-auto mb-2 opacity-30" />
                <p className="text-sm">No tasks scheduled</p>
                <p className="text-xs">Schedule a task above!</p>
              </div>
            ) : (
              <div className="space-y-2">
                {tasks.map((task) => (
                  <div
                    key={task.id}
                    className="glass-card p-3 flex items-start justify-between gap-3"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        {task.status === "pending" && (
                          <Clock className="h-4 w-4 text-yellow-500" />
                        )}
                        {task.status === "running" && (
                          <Loader2 className="h-4 w-4 text-blue-500 animate-spin" />
                        )}
                        {task.status === "completed" && (
                          <CheckCircle className="h-4 w-4 text-green-500" />
                        )}
                        {task.status === "failed" && (
                          <AlertCircle className="h-4 w-4 text-red-500" />
                        )}
                        <span className="text-sm font-medium truncate">
                          {task.description}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        Scheduled: {formatTime(task.scheduledTime)}
                      </p>
                      {task.result && (
                        <p className="text-xs text-muted-foreground mt-1 truncate">
                          Result: {task.result.slice(0, 50)}...
                        </p>
                      )}
                    </div>
                    {task.status === "pending" && (
                      <button
                        onClick={() => cancelTask(task.id)}
                        className="p-1 text-muted-foreground hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-border bg-accent/30">
          <p className="text-xs text-muted-foreground text-center">
            💡 Tip: "Kal subah 6 baje tak ye feature add kar dena" - DEVDA will work while you sleep!
          </p>
        </div>
      </div>
    </div>
  );
}