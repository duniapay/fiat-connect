import 'reflect-metadata'
import { DataSource } from 'typeorm'
import * as dotenv from 'dotenv'

dotenv.config()

const DATABASE_PORT =
  process.env.DATABASE_PORT !== undefined
    ? parseInt(process.env.DATABASE_PORT, 10)
    : 5432

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DATABASE_HOST,
  port: DATABASE_PORT,
  username: 'postgres',
  password: 'admin',
  database: 'postgres',
  synchronize: process.env.NODE_ENV === 'development' ? true : false,
  dropSchema: process.env.NODE_ENV === 'development' ? true : false,
  logging: false,
  entities: ['src/entity/*.ts'],
  migrations: [],
  subscribers: [],
  // ssl: true,
  // extra: {
  //   ssl: {
  //     rejectUnauthorized: false,
  //   },
  // },
})
