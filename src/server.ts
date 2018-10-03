import bodyParser from "body-parser";
import express from "express";
import User from "./User";

const urlencodeParser = bodyParser.urlencoded({ extended: false });

async function ensureUser(req: express.Request, res: express.Response, next: express.NextFunction) {
    try {
        req.user = await User.fromToken(req.body.jwt);
        next();
    } catch(e){
        console.log(e);
        res.sendStatus(403);
    }
}

const app = express();
app.use(bodyParser.json());
app.use(express.static('public'));

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

app.post("/api/verify_token", ensureUser, (req: express.Request, res: express.Response) => {
    res.json(req.user);
  });

app.post("/api/submit_one", ensureUser, (req: express.Request, res: express.Response) => {
  console.log(req.user, req.body);
    /*
    req.body.jwt
  req.body.assignment
  req.body.url
  */
  // createOrUpdate
  res.sendStatus(200);
});

app.post("/api/submit_batch", (req: express.Request, res: express.Response) => {
    /*
    req.body.jwt
    if user.isAdmin && req.body.batch
    */
      // createOrUpdate for batch


});

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
if no session or jwt invalid redirect to login
display submission form
display listing
post submission
-> create or update current user or user if admin
-> import multiple?
force update own assignment
force update all of assignment if admin
pageres task
*/

app.listen(80, () => console.log("Example app listening on port 80!"));
