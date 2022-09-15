import { DBHelper } from '../../tests/helpers/db.helper'

beforeAll(async () => {
  await DBHelper.instance.setupdb()
})

afterAll(() => {
  DBHelper.instance.teardowndb()
})

describe('KYC Entity Tests', () => {
  test('should create an account', async () => {})
})
