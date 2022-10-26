import {
  QuoteRequestBody,
  FiatConnectError,
  FiatType,
  CryptoType,
} from '@fiatconnect/fiatconnect-types'
import axios from 'axios'
import {
  MIN_CRYPTO_AMOUNT,
  MAX_CRYPTO_AMOUNT,
  MIN_FIAT_AMOUNT,
  MAX_FIAT_AMOUNT,
  SUPPORTED_COUNTRY_CODE,
} from '../../constants'

function isValidAmount(body: QuoteRequestBody) {
  if(body.cryptoAmount?.includes('e+'))
    throw new Error(FiatConnectError.CryptoAmountTooHigh)
  if (!isNumber(body)) {
    console.log('isValidAmount')
    throw new Error(FiatConnectError.InvalidParameters)
  }
  const cryptoAmount =
    body.cryptoAmount !== null ? Number(body?.cryptoAmount) : null
  const fiatAmount = body.fiatAmount !== null ? Number(body.fiatAmount) : null
  if (cryptoAmount === null && fiatAmount === null) {
    throw new Error(FiatConnectError.InvalidParameters)
  }
  if (cryptoAmount === undefined && fiatAmount === undefined) {
    throw new Error(FiatConnectError.InvalidParameters)
  }

  if (cryptoAmount !== undefined) {
    if (cryptoAmount! < MIN_CRYPTO_AMOUNT) {
      throw new Error(FiatConnectError.CryptoAmountTooLow)
    } else if (cryptoAmount! > MAX_CRYPTO_AMOUNT) {
      throw new Error(FiatConnectError.CryptoAmountTooHigh)
    }
  }
  // Validate Fiat amount
  if (fiatAmount !== undefined) {
    if (fiatAmount! < MIN_FIAT_AMOUNT) {
      throw new Error(FiatConnectError.FiatAmountTooLow)
    } else if (fiatAmount! > MAX_FIAT_AMOUNT) {
      throw new Error(FiatConnectError.FiatAmountTooHigh)
    }
  }
  return true
}

function isNumber(obj: QuoteRequestBody): boolean {
  const aphabeticChars = /^-?\d+\.?\d*$/
  if (obj.cryptoAmount && obj.fiatAmount) {
    return (
      aphabeticChars.test(obj.fiatAmount!) &&
      aphabeticChars.test(obj.cryptoAmount!)
    )
  } else if (obj.cryptoAmount) {
    return aphabeticChars.test(obj.cryptoAmount)
  } else {
    return aphabeticChars.test(obj.fiatAmount!)
  }
}

function isSupportedGeo(obj: QuoteRequestBody) {
  // is Geo Supported
  if (obj.country === '') {
    throw new Error(FiatConnectError.InvalidParameters)
  }

  const isSupported = SUPPORTED_COUNTRY_CODE.find((ctr) => {
    return obj.country === ctr
  })

  if (!isSupported) {
    throw new Error(FiatConnectError.GeoNotSupported)
  }

  const isV = isSupportedFiat(obj)
  const isX = isSupportedCrypto(obj)

  // FIXME:
  // Fiat and Crypto currencies should be allowed in User Geo
  if (!isV) {
    console.log('FiatConnectError isSupportedFiat')
    throw new Error(FiatConnectError.FiatNotSupported)
  }
  if (!isX) {
    console.log('FiatConnectError isSupportedCrypto')
    throw new Error(FiatConnectError.CryptoNotSupported)
  }
  return true
}
async function requestRate(
  params: CryptoType,
  coinMarketCapUrl: string,
  coinMarketCapKey: string,
) {
  const d = await axios.get(
    `${coinMarketCapUrl}/cryptocurrency/quotes/latest`,
    {
      headers: {
        'X-CMC_PRO_API_KEY': coinMarketCapKey,
      },
      params: { symbol: params },
    },
  )
  return d.data?.data
}
function isSupportedFiat(body: QuoteRequestBody) {
  if (body.country === 'CMR' && body.fiatType === FiatType.XOF) {
    return false
  }
  return true
}

/// Verify if is supported Crypto
function isSupportedCrypto(body: QuoteRequestBody) {
  if (body.cryptoType === CryptoType.cREAL) {
    return false
  }
  return true
}

export { requestRate, isSupportedGeo, isValidAmount }
