import 'reflect-metadata'
import { DataSource } from 'typeorm'

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: 'localhost',
  port: 5432,
  username: 'test',
  password: 'test',
  database: 'fiatconnect',
  synchronize: true,
  logging: false,
  entities: ['src/entity/*.ts'],
  migrations: [],
  subscribers: [],
})
