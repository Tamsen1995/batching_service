import { StampRequest } from "./StampRequest";

const BATCH_SIZE_LIMIT = 100;

interface Batch {
  requests: StampRequest[];
  deadline: number; // Unix timestamp indicating the latest time the batch can be processed
}

export class RequestAggregator {
  private batches: Batch[] = [];
  private intervalId?: NodeJS.Timeout;
  private processedBatches: Batch[] = [];

  constructor() {
    this.processBatches();
  }

  // calculates a deadline for the request based on the current time and the timeTolerance of the request.
  public addRequest(request: StampRequest): void {
    const deadline = Date.now() + request.timeTolerance * 1000;
    const batchIndex = this.findBatchIndex(deadline);

    // If the batchIndex is not -1, it means a suitable batch was found
    if (
      batchIndex !== -1 &&
      this.batches[batchIndex].requests.length < BATCH_SIZE_LIMIT
    ) {
      // Add the new request to the existing batch
      this.batches[batchIndex].requests.push(request);
    } else {
      // If no suitable batch was found (batchIndex is -1), or the batch is full, create a new batch
      // with the current request and deadline

      // this inserts the new batch at the correct position in the array O(n)
      this.batches.splice(batchIndex, 0, {
        requests: [request],
        deadline: deadline,
      });
    }

    // Sort the batches array in ascending order based on the deadline property of each batch.
    // This will put the batch with the earliest deadline at the start of the array.
    // (would implement a super efficient sorting algo for this in real life, but for now, this is fine.)
    this.batches.sort((a, b) => a.deadline - b.deadline);
  }

  // I could reduce time complexity of this by implementing a better search algorithm (potentially binary search)
  private findBatchIndex(deadline: number): number {
    return this.batches.findIndex((batch) => batch.deadline >= deadline);
  }

  private processBatches(): void {
    this.intervalId = setInterval(() => {
      const now = Date.now();
      while (this.batches.length > 0 && this.batches[0].deadline <= now) {
        const batchToProcess = this.batches.shift();

        if (!batchToProcess || batchToProcess.requests.length === 0) {
          continue; // Skip if the batch is empty
        }

        this.processedBatches.push(batchToProcess);

        // in case the blockchain service is down, we can retry processing the batch
        try {
          this.processBatch(batchToProcess);
        } catch (error) {
          console.error("Failed to process batch:", error);
        }
      }
    }, 1000); // Check every second
    // Longterm instead of checking every second, we could use a priority queue to keep track of the next batch to process instead of checking every second
    // and then probably some kinda event driven approach to process the batch when the deadline is reached.
  }

  public stopProcessing(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = undefined;
    }
  }

  private processBatch(batch: Batch): void {
    console.log("Processing batch with requests:", batch.requests);
    // this is would the actual processing of the batch would happen in real life
  }

  // this getter to access processedBatches from the test
  public getProcessedBatches(): Batch[] {
    return this.processedBatches;
  }
}
