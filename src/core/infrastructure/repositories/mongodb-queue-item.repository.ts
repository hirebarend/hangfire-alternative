import * as mongoDb from 'mongodb';
import * as uuid from 'uuid';
import { QueueItem, QueueItemRepository } from '../../domain';

export class MongoDbQueueItemRepository implements QueueItemRepository {
  constructor(protected db: mongoDb.Db) {}

  public async acknowledge(id: string): Promise<QueueItem> {
    const collection: mongoDb.Collection<QueueItem> = this.db.collection<QueueItem>('queue-items');

    const document = await collection.findOneAndDelete({ id });

    if (!document) {
      throw new Error();
    }

    this.db.collection('queue-items-archive').insertOne({
      id: document.id,
      parameters: document.parameters,
      type: document.type,
    });

    return document;
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

    const collection: mongoDb.Collection<QueueItem> = this.db.collection<QueueItem>('queue-items');

    await collection.insertOne({
      ...queueItem,
    });

    return queueItem;
  }

  public async createMany(
    arr: Array<{ type: string; parameters: { [key: string]: string } }>
  ): Promise<Array<QueueItem>> {
    const queueItems = arr.map((x) => {
      return {
        createdAt: new Date().getTime(),
        id: uuid.v4(),
        lockedUntil: new Date().getTime(),
        parameters: x.parameters,
        type: x.type,
        updatedAt: new Date().getTime(),
      };
    });

    const collection: mongoDb.Collection = this.db.collection('queue-items');

    await collection.insertMany(queueItems);

    return queueItems;
  }

  public async next(
    timestamp: number,
    type: string,
    lockedUntilDuration: number
  ): Promise<QueueItem | null> {
    const collection: mongoDb.Collection<QueueItem> = this.db.collection<QueueItem>('queue-items');

    const document = await collection.findOneAndUpdate(
      {
        lockedUntil: { $lte: timestamp },
        type,
      },
      {
        $set: {
          lockedUntil: new Date().getTime() + lockedUntilDuration,
          updatedAt: new Date().getTime(),
        },
      }
    );

    if (!document) {
      return null;
    }

    return document;
  }
}
