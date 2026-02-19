import Queue from "better-queue";
import fs from "fs";

import { spawn } from "child_process";
import { Submission } from "./db";

const screenshotDir = "./public/screenshots";
if (!fs.existsSync(screenshotDir)) {
  fs.mkdirSync(screenshotDir);
}

interface IData {
  email: string;
  assignment: string;
  url: string;
}

interface IQueueTaskState {
  id: string;
  email: string;
  assignment: string;
  url: string;
  enqueuedAt: number;
  startedAt?: number;
  state: "queued" | "running";
  enqueueSeq: number;
}

interface ITaskHistoryEntry {
  id: string;
  email: string;
  assignment: string;
  status: string;
  exitCode: number;
  enqueuedAt: number | null;
  startedAt: number;
  finishedAt: number;
  waitMs: number;
  runMs: number;
  totalMs: number;
}

const taskStateById = new Map<string, IQueueTaskState>();
const taskHistory: ITaskHistoryEntry[] = [];
const maxHistoryEntries = 300;
let enqueueSequence = 0;
let queuedCount = 0;
let runningCount = 0;

function getTaskId(task: IData | any) {
  return `${task.assignment}_${task.email}`;
}

function queueLog(event: string, payload: Record<string, string | number>) {
  const details = Object.entries(payload)
    .map(([key, value]) => `${key}=${value}`)
    .join(" ");
  console.log(`[queue][${event}] ${details}`);
}

function pushHistory(entry: ITaskHistoryEntry) {
  taskHistory.unshift(entry);
  if (taskHistory.length > maxHistoryEntries) {
    taskHistory.pop();
  }
}

export function getTaskQueueSnapshot() {
  const now = Date.now();
  const queuedTasks = Array.from(taskStateById.values())
    .filter(task => task.state === "queued")
    .sort((left, right) => left.enqueueSeq - right.enqueueSeq)
    .map((task, index) => ({
      id: task.id,
      email: task.email,
      assignment: task.assignment,
      url: task.url,
      enqueuedAt: task.enqueuedAt,
      queuePosition: index + 1,
      waitingMs: now - task.enqueuedAt
    }));

  const runningTasks = Array.from(taskStateById.values())
    .filter(task => task.state === "running")
    .sort((left, right) => (left.startedAt || left.enqueuedAt) - (right.startedAt || right.enqueuedAt))
    .map(task => ({
      id: task.id,
      email: task.email,
      assignment: task.assignment,
      url: task.url,
      enqueuedAt: task.enqueuedAt,
      startedAt: task.startedAt || null,
      waitMs: task.startedAt ? task.startedAt - task.enqueuedAt : null,
      runningMs: task.startedAt ? now - task.startedAt : 0
    }));

  return {
    queuedCount,
    runningCount,
    queuedTasks,
    runningTasks,
    history: taskHistory
  };
}

function saveResult(task: any) {
  let resultObj: any = {
    numPassedTests: 0,
    numTotalTests: 0
  };
  try {
    resultObj = JSON.parse(task.result);
  } catch (e) {
      console.log("Unable to parse result", e, task);
  }
  return Submission.update(
    {
      check_content: task.result, // TODO: improve maybe filter to not reveal test source code?
      check_status: String(
        Math.round((resultObj.numPassedTests / resultObj.numTotalTests) * 100)
      ),
      check_date: new Date()
    },
    {
      where: {
        assignment: task.assignment,
        email: task.email
      }
    }
  );
}

export function spawnTestProcess(task: any, cb: (error: any, result: any) => void) {
  const taskId = getTaskId(task);
  const startedAt = Date.now();
  const state = taskStateById.get(taskId);
  const enqueuedAt = state ? state.enqueuedAt : null;
  if (queuedCount > 0) {
    queuedCount -= 1;
  }
  runningCount += 1;
  taskStateById.set(taskId, {
    id: taskId,
    email: task.email,
    assignment: task.assignment,
    url: task.url,
    enqueuedAt: enqueuedAt || startedAt,
    startedAt,
    state: "running",
    enqueueSeq: state ? state.enqueueSeq : ++enqueueSequence
  });
  queueLog("started", {
    user: task.email,
    assignment: task.assignment,
    waitMs: enqueuedAt ? startedAt - enqueuedAt : -1,
    queued: queuedCount,
    running: runningCount
  });

  const assignmentDir = `${screenshotDir}/${task.assignment}`;
  if (!fs.existsSync(assignmentDir)) {
    fs.mkdirSync(assignmentDir);
  }
  let result = "";
  let stderrOutput = "";
  let finalized = false;

  const finalizeTask = (status: string, finishedAt: number, exitCode?: number) => {
    if (finalized) {
      return;
    }
    finalized = true;
    const runMs = finishedAt - startedAt;
    const totalMs = enqueuedAt ? finishedAt - enqueuedAt : runMs;
    const waitMs = enqueuedAt ? startedAt - enqueuedAt : 0;
    runningCount = Math.max(runningCount - 1, 0);
    taskStateById.delete(taskId);
    pushHistory({
      id: taskId,
      email: task.email,
      assignment: task.assignment,
      status,
      exitCode: exitCode ?? -1,
      enqueuedAt,
      startedAt,
      finishedAt,
      waitMs,
      runMs,
      totalMs
    });
    queueLog("finished", {
      user: task.email,
      assignment: task.assignment,
      status,
      exitCode: exitCode ?? -1,
      runMs,
      totalMs,
      queued: queuedCount,
      running: runningCount
    });
  };

  const test = spawn(
    "node",
    ["node_modules/jest/bin/jest.js", task.assignment, "--json"],
    {
      env: {
        ...process.env,
        TestURL: task.url,
        TestUser: task.email
      },
    }
  );
  test.stdout.on("data", data => {
    const chunk = data.toString();
    result += chunk;
    // FOR debugging:
    // process.stdout.write(chunk);
  });
  test.stderr.on("data", data => {
    const chunk = data.toString();
    stderrOutput += chunk;
    // FOR debugging:
    // process.stderr.write(chunk);
  });
  test.on("error", err => {
    console.log("spawn err", err);
    finalizeTask("error", Date.now());
    cb(err, null);
  });
  test.on("close", code => {
    if (!result && code !== 0) {
      task.result = JSON.stringify({
        success: false,
        exitCode: code,
        stderr: stderrOutput
      });
    } else {
      task.result = result || "{}";
    }
    saveResult(task);
    finalizeTask(code === 0 ? "ok" : "failed", Date.now(), code ?? undefined);
    cb(null, task.result);
  });
}

const testQueue = new Queue(spawnTestProcess, {
  id: (task: IData, cb: any) => {
    cb(null, `${task.assignment}_${task.email}`);
  },
  concurrent: process.env.QUEUE_CONCURRENT || 1
});

export function starTest(data: IData) {
  return new Promise<void>((resolve, reject) => {
    const taskId = getTaskId(data);
    const now = Date.now();
    const currentState = taskStateById.get(taskId);
    if (!currentState || currentState.state === "running") {
      queuedCount += 1;
    }
    taskStateById.set(taskId, {
      id: taskId,
      email: data.email,
      assignment: data.assignment,
      url: data.url,
      enqueuedAt: now,
      state: "queued",
      enqueueSeq: ++enqueueSequence
    });
    queueLog("enqueued", {
      user: data.email,
      assignment: data.assignment,
      queuePosition: queuedCount,
      queued: queuedCount,
      running: runningCount
    });
    testQueue.push(data, () => {
        resolve();
    });
  });
}
