import bodyParser from "body-parser";
import express from "express";
import { dbReady, Submission } from "./db";
import User from "./User";

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
  "/api/submit",
  ensureUser,
  (req: express.Request, res: express.Response) => {
    if (req.user.isAdmin && req.body.batch.length > 0) {
      req.body.batch.split("\n").forEach((entry: string) => {
        const [email, url] = entry.split(",");
        Submission.upsert({
          assignment: req.body.assignment,
          email,
          url
        }).then(
          () => {
            // TODO: queue parsing
          },
          () => {
            // TODO: handle unique constraints
          }
        );
      });
      res.sendStatus(200);
    } else {
      const data = {
        assignment: req.body.assignment,
        email: req.user.email,
        url: req.body.url
      };
      const instance = Submission.build(data);
      instance.validate().then(() => {
        return Submission.upsert(data)
          .then(created => {
            res.sendStatus(200);
            // TODO: queue parsing
          });
      }).catch(() => {
        res.sendStatus(500);
      });
    }
  }
);

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

/*
-> trigger queue

display listing
force update all of assignment if admin
pageres task

*/
dbReady.then(() => {
  console.log("sequelize synced");
});
app.listen(80, () => console.log("Example app listening on port 80!"));
