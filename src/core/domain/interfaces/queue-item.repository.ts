import { QueueItem } from '../entities';

export interface QueueItemRepository {
  acknowledge(id: string): Promise<QueueItem>;

  create(
    type: string,
    parameters: { [key: string]: string }
  ): Promise<QueueItem>;

  next(
    timestamp: number,
    type: string,
    lockedUntilDuration: number
  ): Promise<QueueItem | null>;
}
