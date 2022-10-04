import { expect } from 'chai'
import { isSupportedGeo, isValidAmount } from '../utils/quote/index.utils'
import { CryptoType, FiatType } from '@fiatconnect/fiatconnect-types'

describe('/quote', () => {
  describe('Validate Amounts', () => {
    it('Should throw CryptoAmountTooHigh when cryptoAmount exceeds limit', async () => {
      const quote = {
        fiatType: FiatType.XOF,
        cryptoType: CryptoType.cUSD,
        fiatAmount: '4',
        cryptoAmount: '800.39',
        country: 'BF',
        region: undefined,
      }
      expect(() => isValidAmount(quote)).to.throw(Error, 'CryptoAmountTooHigh')
    })
    it('Should throw FiatAmountTooHigh when fiatAmount exceeds limit', async () => {
      const quote = {
        fiatType: FiatType.XOF,
        cryptoType: CryptoType.cUSD,
        fiatAmount: '4000000',
        cryptoAmount: '0.39',
        country: 'BF',
        region: undefined,
      }
      expect(() => isValidAmount(quote)).to.throw(Error, 'FiatAmountTooHigh')
    })

    it('Should throw Invalid parameters when fiatAmount and cryptoAmount are undefined', async () => {
      const quote = {
        fiatType: FiatType.XOF,
        cryptoType: CryptoType.cUSD,
        fiatAmount: undefined,
        cryptoAmount: undefined,
        country: 'BF',
        region: undefined,
      }
      expect(() => isValidAmount(quote)).to.throw(Error, 'InvalidParameters')
    })

    it('Should throw  InvalidParameters if the amount contains special characters', async () => {
      const quote = {
        fiatType: FiatType.XOF,
        cryptoType: CryptoType.cUSD,
        fiatAmount: '4.000.000',
        cryptoAmount: '0.39',
        country: 'BF',
        region: undefined,
      }
      expect(() => isValidAmount(quote)).to.throw(Error, 'InvalidParameters')
    })

    it('Should throw InvalidParameters if the amount contains letters', async () => {
      const quote = {
        fiatType: FiatType.XOF,
        cryptoType: CryptoType.cUSD,
        fiatAmount: '400e',
        cryptoAmount: '0.39',
        country: 'BF',
        region: undefined,
      }
      expect(() => isValidAmount(quote)).to.throw(Error, 'InvalidParameters')
    })

    it('Should throw  InvalidParameters if the amount contains special characters', async () => {
      const quote = {
        fiatType: FiatType.XOF,
        cryptoType: CryptoType.cUSD,
        fiatAmount: '400$',
        cryptoAmount: '0.39',
        country: 'BF',
        region: undefined,
      }
      expect(() => isValidAmount(quote)).to.throw(Error, 'InvalidParameters')
    })

    it('Should pass with valid parameters', async () => {
      const quote = {
        cryptoType: CryptoType.cUSD,
        fiatType: FiatType.XOF,
        cryptoAmount: '0.01',
        country: 'BF',
      }
      expect(isValidAmount(quote)).to.be.true
    })

    it('Should pass when only fiatAmount is provided', async () => {
      const quote = {
        fiatType: FiatType.XOF,
        cryptoType: CryptoType.cUSD,
        fiatAmount: '4000',
        country: 'BF',
        region: undefined,
      }
      expect(isValidAmount(quote)).to.be.true
    })

    it('Should pass when only cryptoAmount is provided', async () => {
      const quote = {
        fiatType: FiatType.XOF,
        cryptoType: CryptoType.cUSD,
        cryptoAmount: '0.39',
        country: 'BF',
        region: undefined,
      }
      expect(isValidAmount(quote)).to.be.true
    })
  })

  describe('Validate Geos', () => {
    it('Should throw  InvalidParameters if the country is empty', async () => {
      const quote = {
        fiatType: FiatType.XOF,
        cryptoType: CryptoType.cUSD,
        fiatAmount: '400',
        cryptoAmount: '0.39',
        country: '',
        region: undefined,
      }
      expect(() => isSupportedGeo(quote)).to.throw(Error, 'InvalidParameters')
    })

    it('Should throw FiatNotSupported if fiat currency is not supported for country', async () => {
      const quote = {
        fiatType: FiatType.XOF,
        cryptoType: CryptoType.cUSD,
        fiatAmount: '400',
        cryptoAmount: '0.39',
        country: 'CMR',
        region: undefined,
      }
      expect(() => isSupportedGeo(quote)).to.throw(Error, 'FiatNotSupported')
    })
  })
})
