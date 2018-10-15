import Queue from "better-queue";
import fs from "fs";

import { spawn } from "child_process";
import { Submission } from "./db";

const screenshotDir = "./public/screenshots";
if (!fs.existsSync(screenshotDir)) {
  fs.mkdirSync(screenshotDir);
}

function saveResult(task: any) {
  let resultObj: any = {
    numPassedTests: 0,
    numTotalTests: 0
  };
  try {
    resultObj = JSON.parse(task.result);
  } catch (e) {
      console.log("Unable to parse result", e);
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

function spawnTestProcess(task: any, cb: (error: any, result: any) => void) {
  const assignmentDir = `${screenshotDir}/${task.assignment}`;
  if (!fs.existsSync(assignmentDir)) {
    fs.mkdirSync(assignmentDir);
  }
  let result = "";
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
    result += data.toString();
  });
  test.on("error", err => {
    console.log("spawn err", err);
    cb(err, null);
  });
  test.on("close", code => {
    task.result = result;
    saveResult(task);
    cb(null, result);
  });
}

const testQueue = new Queue(spawnTestProcess, {
  id: (task: IData, cb: any) => {
    cb(null, `${task.assignment}_${task.email}`);
  }
});

interface IData {
  email: string;
  assignment: string;
  url: string;
}
export function starTest(data: IData) {
  return new Promise((resolve, reject) => {
    testQueue.push(data, () => {
        resolve();
    });
  });
}
