import 'reflect-metadata'
import { DataSource } from 'typeorm'
import * as dotenv from 'dotenv'

dotenv.config()

const RDS_PORT =
  process.env.RDS_PORT !== undefined ? parseInt(process.env.RDS_PORT, 10) : 5432

const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.RDS_HOSTNAME,
  port: RDS_PORT,
  username: process.env.RDS_USERNAME,
  password: process.env.RDS_PASSWORD,
  database: process.env.RDS_DB_NAME,
  synchronize: false,
  dropSchema: false,
  logging: false,
  entities: ['./build/src/entity/*.js'],
  migrations: [],
  subscribers: [],
  ssl: true,
  extra: {
    ssl: {
      rejectUnauthorized: false,
    },
  },
})

const DevDataSource = new DataSource({
  type: 'postgres',
  host: 'localhost',
  port: 5432,
  username: 'postgres',
  password: 'admin',
  database: 'postgres',
  synchronize: false,
  dropSchema: false,
  logging: false,
  entities: ['./build/src/entity/*.js'],
  migrations: [],
  subscribers: [],
})

export { DevDataSource, AppDataSource }
