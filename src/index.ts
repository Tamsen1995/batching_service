import express, { Request, Response } from "express";
import bodyParser from "body-parser";
import cors from "cors";
import { RequestAggregator } from "./RequestAggregator";
import { StampRequest } from "./StampRequest";

const app = express();
const PORT = 3001;
const aggregator = new RequestAggregator();

app.use(cors()); // Use cors middleware here
app.use(bodyParser.json());

app.post("/create_stamp", (req: Request, res: Response) => {
  console.log("Received a stamp request");
  const { objectCid, timeTolerance } = req.body;
  const request: StampRequest = {
    objectCid,
    timeTolerance,
    timestamp: Date.now(),
    signature: "mock_signature",
  };

  aggregator.addRequest(request);
  res.send({ message: "Batch stamp request added" });
});

app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
});
