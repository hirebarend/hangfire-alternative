import * as mongoDb from 'mongodb';
import * as uuid from 'uuid';
import { QueueItem, QueueItemRepository } from '../../domain';

export class MongoDbQueueItemRepository implements QueueItemRepository {
  constructor(protected db: mongoDb.Db) {}

  public async acknowledge(id: string): Promise<QueueItem> {
    const collection: mongoDb.Collection = this.db.collection('queue-items');

    const document = await collection.findOneAndDelete({ id });

    if (!document.value) {
      throw new Error();
    }

    return document.value as unknown as QueueItem;
  }

  public async create(
    type: string,
    parameters: { [key: string]: string }
  ): Promise<QueueItem> {
    const queueItem: QueueItem = {
      createdAt: new Date().getTime(),
      id: uuid.v4(),
      lockedUntil: new Date().getTime(),
      parameters,
      type,
      updatedAt: new Date().getTime(),
    };

    const collection: mongoDb.Collection = this.db.collection('queue-items');

    await collection.insertOne({
      ...queueItem,
    });

    return queueItem;
  }

  public async next(
    timestamp: number,
    type: string
  ): Promise<QueueItem | null> {
    const collection: mongoDb.Collection = this.db.collection('queue-items');

    const modifyResult = await collection.findOneAndUpdate(
      {
        lockedUntil: { $lte: timestamp },
        type,
      },
      {
        $set: {
          lockedUntil: new Date().getTime() + 60 * 1000,
          updatedAt: new Date().getTime(),
        },
      }
    );

    if (!modifyResult.value) {
      return null;
    }

    return modifyResult.value as unknown as QueueItem;
  }
}
