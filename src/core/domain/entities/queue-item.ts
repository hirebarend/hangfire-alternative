export interface QueueItem {
  createdAt: number;

  id: string;

  lockedUntil: number;

  parameters: { [key: string]: string };

  type: string;

  updatedAt: number;
}
