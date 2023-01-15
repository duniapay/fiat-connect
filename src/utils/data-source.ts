import 'reflect-metadata'
import { DataSource } from 'typeorm'
import * as dotenv from 'dotenv'

dotenv.config()

const DATABASE_PORT =
  process.env.RDS_PORT !== undefined
    ? parseInt(process.env.RDS_PORT, 10)
    : 5432

export const AppDataSource = new DataSource({
  type: 'postgres',
  host:
    process.env.NODE_ENV === 'localhost'
      ? 'localhost'
      : process.env.RDS_HOSTNAME,
  port: process.env.RDS_PORT,
  username:
    process.env.NODE_ENV === 'localhost'
      ? 'postgres'
      : process.env.RDS_USERNAME,
  password:
    process.env.NODE_ENV === 'localhost'
      ? 'admin'
      : process.env.RDS_PASSWORD,
  database: 'postgres',
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
