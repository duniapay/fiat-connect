import { DBHelper } from '../../tests/helpers/db.helper'

beforeAll(async () => {
  await DBHelper.instance.setupdb()
})

afterAll(() => {
  DBHelper.instance.teardowndb()
})

describe('Transfer Entity Tests', () => {
  test('should create an account', async () => {})
})
