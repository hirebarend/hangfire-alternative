require('dotenv').config();
import * as mongoDb from 'mongodb';
import { MongoDbQueueItemRepository } from './core/infrastructure/repositories/mongodb-queue-item.repository';

(async () => {
  const mongoClient = await mongoDb.MongoClient.connect(
    process.env.MONGODB_CONNECTION_STRING as string
  );

  const db = mongoClient.db('hangfire-alternative');

  const queueItemRepository = new MongoDbQueueItemRepository(db);

  await queueItemRepository.create('test', { hello: 'world' });

  while (true) {
    const queueItem = await queueItemRepository.next(
      new Date().getTime(),
      'test',
      60 * 1000
    );

    console.log(queueItem);

    if (!queueItem) {
      await new Promise((resolve) => setTimeout(resolve, 2000));

      continue;
    }

    console.log(queueItem.updatedAt - queueItem.createdAt);

    if (queueItem.updatedAt - queueItem.createdAt > 90000) {
      await queueItemRepository.acknowledge(queueItem.id);
    }
  }

  await mongoClient.close();
})();
