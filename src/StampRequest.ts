export interface StampRequest {
  objectCid: string;
  timeTolerance: number; // Time tolerance in seconds
  timestamp: number; // The timestamp when the request was received
  signature: string;
}
