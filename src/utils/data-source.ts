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
  host:
    process.env.NODE_ENV === 'localhost'
      ? 'localhost'
      : process.env.DATABASE_HOST,
  port: DATABASE_PORT,
  username:
    process.env.NODE_ENV === 'localhost'
      ? 'postgres'
      : process.env.DATABASE_USER,
  password:
    process.env.NODE_ENV === 'localhost'
      ? 'admin'
      : process.env.DATABASE_PASSWORD,
  database:
    process.env.NODE_ENV === 'localhost'
      ? 'postgres'
      : process.env.DATABASE_NAME,
  synchronize: false,
  dropSchema: false,
  logging: false,
  entities: ['./src/entity/*.ts'],
  migrations: [],
  subscribers: [],
  // ssl: true,
  // extra: {
  //   ssl: {
  //     rejectUnauthorized: false,
  //   },
  // },
})
