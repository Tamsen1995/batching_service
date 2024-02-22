import { RequestAggregator } from "./RequestAggregator";
import { StampRequest } from "./StampRequest";

describe("RequestAggregator", () => {
  let aggregator: RequestAggregator;

  beforeEach(() => {
    aggregator = new RequestAggregator();
  });

  afterEach(() => {
    aggregator.stopProcessing();
  });
  test("should add request to a batch", () => {
    const request: StampRequest = {
      objectCid: "cid",
      timeTolerance: 10,
      timestamp: Date.now(),
      signature: "mock_signature",
    };

    aggregator.addRequest(request);

    const processedBatches = aggregator.getProcessedBatches();
    expect(processedBatches).toHaveLength(0); // No batch should be processed yet

    const batches = (aggregator as any).batches; // Access private property for testing
    expect(batches).toHaveLength(1); // One batch should be created
    expect(batches[0].requests).toContainEqual(request); // The batch should contain the added request
  });

  test("should stop processing batches", () => {
    aggregator.stopProcessing();

    const intervalId = (aggregator as any).intervalId; // Access private property for testing
    expect(intervalId).toBeUndefined(); // Interval ID should be undefined after stopping processing
  });
});
