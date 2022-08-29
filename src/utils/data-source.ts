import 'reflect-metadata'
import { DataSource } from 'typeorm'
import * as dotenv from 'dotenv'

dotenv.config()

const DEFAULT_PORT = process.env.PORT !== undefined ? Number(process.env.PORT) : 8080

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DATABASE_URL,
  port: Number(process.env.DATABASE_PORT),
  username: process.env.DATABASE_USERNAME,
  password: process.env.DATABASE_PASSWORD,
  database: process.env.DATABASE_NAME,
  synchronize: true,
  logging: false,
  entities: ['src/entity/*.ts'],
  migrations: [],
  subscribers: [],
})
