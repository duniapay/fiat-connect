import { DataSource } from 'typeorm'
import Database from 'better-sqlite3'

export class DBHelper {
  private static _instance: DBHelper

  private constructor() {}

  public static get instance(): DBHelper {
    if (!this._instance) this._instance = new DBHelper()

    return this._instance
  }

  private dbConnect!: DataSource
  private db!: any

  public async setupdb() {
    this.db = new Database(':memory:', { verbose: console.log })
    this.dbConnect = new DataSource({
      name: 'default',
      type: 'better-sqlite3',
      database: ':memory:',
      entities: ['src/entity/**/*.ts'],
      synchronize: true,
    })
  }

  public teardowndb() {
    this.dbConnect.destroy()
    this.db.close()
  }
}
