export {};

// Store for scheduled tasks
interface ScheduledTask {
  id: string;
  description: string;
  scheduledTime: number;
  prompt: string;
  status: "pending" | "running" | "completed" | "failed";
  result?: string;
}

let scheduledTasks: ScheduledTask[] = [];

// Initialize side panel behavior
chrome.sidePanel
  .setPanelBehavior({ openPanelOnActionClick: true })
  .catch(console.error);

// Load saved tasks on startup
chrome.storage.local.get("devda_scheduled_tasks", (result) => {
  if (result.devda_scheduled_tasks) {
    scheduledTasks = JSON.parse(result.devda_scheduled_tasks);
    checkScheduledTasks();
  }
});

// Check for due tasks every minute
setInterval(checkScheduledTasks, 60000);

async function checkScheduledTasks() {
  const now = Date.now();

  for (const task of scheduledTasks) {
    if (task.status === "pending" && task.scheduledTime <= now) {
      await executeTask(task);
    }
  }

  // Save updated tasks
  await chrome.storage.local.set({
    devda_scheduled_tasks: JSON.stringify(scheduledTasks),
  });
}

async function executeTask(task: ScheduledTask) {
  console.log(`[DEVDA] Executing scheduled task: ${task.description}`);
  task.status = "running";

  try {
    const response = await fetch("http://localhost:3000/api/agent", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        messages: [
          {
            role: "user",
            content: `[AUTONOMOUS MODE - Scheduled Task]

Task Description: ${task.description}

Original Request: ${task.prompt}

Complete this task and provide:
1. All code changes needed
2. Step-by-step implementation
3. Any files to create/modify
4. Testing instructions`,
          },
        ],
        includeContext: true,
      }),
    });

    const data = await response.json();
    task.status = "completed";
    task.result = data.content;

    // Notify user
    chrome.notifications.create({
      type: "basic",
      iconUrl: "assets/icon128.png",
      title: "DEVDA Task Completed",
      message: task.description,
    });
  } catch (error) {
    task.status = "failed";
    task.result = String(error);
    console.error("[DEVDA] Task failed:", error);
  }
}

// Message handlers
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  switch (message.type) {
    case "SCHEDULE_TASK":
      const task: ScheduledTask = {
        id: `task-${Date.now()}`,
        description: message.description,
        scheduledTime: message.scheduledTime,
        prompt: message.prompt,
        status: "pending",
      };
      scheduledTasks.push(task);
      chrome.storage.local.set({
        devda_scheduled_tasks: JSON.stringify(scheduledTasks),
      });
      sendResponse({ success: true, taskId: task.id });
      break;

    case "GET_SCHEDULED_TASKS":
      sendResponse({ tasks: scheduledTasks });
      break;

    case "CANCEL_TASK":
      scheduledTasks = scheduledTasks.filter((t) => t.id !== message.taskId);
      chrome.storage.local.set({
        devda_scheduled_tasks: JSON.stringify(scheduledTasks),
      });
      sendResponse({ success: true });
      break;

    case "CONSOLE_ERROR":
      // Store captured errors
      chrome.storage.local.get("devda_errors", (result) => {
        const errors = result.devda_errors ? JSON.parse(result.devda_errors) : [];
        errors.push(message.error);
        if (errors.length > 50) errors.shift();
        chrome.storage.local.set({ devda_errors: JSON.stringify(errors) });
      });
      break;

    case "COMPONENT_SELECTED":
      // Store selected component info
      chrome.storage.local.set({
        devda_selected_component: JSON.stringify(message.data),
      });
      break;

    case "OPEN_SIDE_PANEL":
      if (sender.tab?.id) {
        chrome.sidePanel.open({ tabId: sender.tab.id });
      }
      sendResponse({ success: true });
      break;

    case "GET_TAB_INFO":
      chrome.tabs.query({ active: true, currentWindow: true }).then((tabs) => {
        sendResponse({ tab: tabs[0] });
      });
      return true;
  }
});

console.log("[DEVDA] Background script loaded");