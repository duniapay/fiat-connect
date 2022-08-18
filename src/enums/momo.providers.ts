/**
 * @enum MomoProviders is an enumeraton of the different mobile money providers that exist on our platform
 */
enum MomoProviders {
  ORANGE = 'ORANGE',
  MOOV = 'MOOV',
  MTN = 'MTN',
}

/**
 * @enum MomoTxType is an enumeraton of the different account types that exist on our platform
 */
enum MomoTxType {
  COLLECT = 'COLLECT',
  TRANSFER = 'TRANSFER',
}

export { MomoProviders, MomoTxType }
