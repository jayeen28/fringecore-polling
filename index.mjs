import express from "express";
import { blockingGet, push } from "./challenge.mjs";

const app = express();

app.get("/blocking-get", async (req, res) => {
  res.json(await blockingGet(req.query.key));
});

app.post("/push", express.json(), async (req, res) => {
  await push(req.query.key, req.body);
  res.json({});
});

app.listen(3031, "0.0.0.0", () => {
  console.log(`LISTENING ON http://0.0.0.0:3031`);
});
