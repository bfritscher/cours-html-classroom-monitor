import bodyParser from "body-parser";
import express from "express";
import Sequelize from "sequelize";
import fs from "fs";

import { dbReady, Submission } from "./db";

import User from "./User";
import { starTest } from "./validation";

const assignmentsFolder = './assignments_tests/';

const availableAssignments = [];
const fileRegex = /(.*)\.js/;
fs.readdirSync(assignmentsFolder).forEach(file => {
  const match = file.match(fileRegex);
  if (match) {
    availableAssignments.push(match[1]);
  }
});
console.log('available assignments', availableAssignments);

const urlencodeParser = bodyParser.urlencoded({ extended: false });

async function ensureUser(
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
) {
  try {
    req.user = await User.fromToken(req.body.jwt);
    next();
  } catch (e) {
    console.log(e);
    res.sendStatus(403);
  }
}

const app = express();
app.use(bodyParser.json());
app.use(express.static("public"));

app.get("/api", (req, res) => res.send("API OK"));

app.post(
  "/api/login",
  urlencodeParser,
  (req: express.Request, res: express.Response) => {
    res.send(
      `<script>localStorage.setItem('jwt', '${
        req.body.jwt
      }');window.location='/';</script>`
    );
  }
);

app.post(
  "/api/verify_token",
  ensureUser,
  (req: express.Request, res: express.Response) => {
    res.json(req.user);
  }
);

app.post(
  "/api/submissions",
  ensureUser,
  (req: express.Request, res: express.Response) => {
    const query: any = {
      where: {}
    };
    if (!req.user.isAdmin) {
      query.where.email = req.user.email;
    }
    if (req.body.assignment) {
      query.where.assignment = req.body.assignment;
    }
    if (req.user.isAdmin && !req.body.assignment) {
      query.group = "assignment";
      query.attributes = ["assignment",
        [Sequelize.fn('COUNT', Sequelize.col('*')), 'nb']];
    }
    Submission.findAll(query).then(submissions => {
      res.json(submissions);
    }, (e) => {
      console.log("query error", e);
      res.sendStatus(500);
    });
  }
);

app.post(
  "/api/submit",
  ensureUser,
  (req: express.Request, res: express.Response) => {
    if (req.user.isAdmin && req.body.batch.length > 0) {
      req.body.batch.split("\n").forEach((entry: string) => {
        const [email, url] = entry.split(",");
        const assignment = req.body.assignment;
        const data = {
          assignment,
          email,
          url
        };
        Submission.upsert(data).then(
          () => {
            starTest(data);
          },
          () => {
            // TODO: handle unique constraints
          }
        );
      });
      res.sendStatus(200);
    } else {
      if (availableAssignments.indexOf(req.body.assignment) === -1) {
        res.sendStatus(404);
        return;
      }
      const data = {
        assignment: req.body.assignment,
        email: req.user.email,
        url: req.body.url
      };
      const instance = Submission.build(data);
      instance
        .validate()
        .then(() => {
          return Submission.upsert(data).then(async created => {
            await starTest(data);
            res.sendStatus(200);
          });
        })
        .catch(() => {
          res.sendStatus(500);
        });
    }
  }
);

/*
TODO: force update all of assignment if admin
*/

app.post("/api/update", (req: express.Request, res: express.Response) => {
  /*
    req.body.jwt
    if user.isAdmin && req.body.assignment
        if req.body.user
            // update this
        else
         // update all
    else
        update this
    */
});

dbReady.then(() => {
  console.log("sequelize synced");
});
app.listen(80, () => console.log("app listening on port 80!"));
