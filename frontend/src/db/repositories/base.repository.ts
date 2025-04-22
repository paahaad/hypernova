import { DbClient } from '../setup';

export class BaseRepository {
  protected db: DbClient;

  constructor(db: DbClient) {
    this.db = db;
  }
} 