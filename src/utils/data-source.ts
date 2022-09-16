import 'reflect-metadata'
import { DataSource } from 'typeorm'
import * as dotenv from 'dotenv'

dotenv.config()

const DATABASE_PORT =
  process.env.DATABASE_PORT !== undefined
    ? parseInt(process.env.DATABASE_PORT, 10)
    : 8080

export const AppDataSource = new DataSource({
  type: 'postgres',
  // url: process.env.DATABASE_URL,
  host: 'localhost',
  username: 'postgres',
  password: 'admin',
  database: 'postgres',
  synchronize: true,
  logging: false,
  dropSchema: true,
  entities: ['src/entity/*.ts'],
  migrations: [],
  subscribers: [],
  ssl: false,
  // extra: {
  //   ssl: {
  //     rejectUnauthorized: false,
  //   },
  // },
})
