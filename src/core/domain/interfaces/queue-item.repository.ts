import { QueueItem } from '../entities';

export interface QueueItemRepository {
  acknowledge(id: string): Promise<QueueItem>;

  create(
    type: string,
    parameters: { [key: string]: string }
  ): Promise<QueueItem>;

  createMany(
    arr: Array<{ type: string; parameters: { [key: string]: string } }>
  ): Promise<Array<QueueItem>>;

  next(
    timestamp: number,
    type: string,
    lockedUntilDuration: number
  ): Promise<QueueItem | null>;
}
