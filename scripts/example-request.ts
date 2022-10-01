import { ethers } from 'ethers'
import { ensureLeading0x } from '@celo/utils/lib/address'
import fetch from 'node-fetch'
import { generateNonce, SiweMessage } from 'siwe'

const DOMAIN = 'localhost'
const BASE_URL = 'http://localhost:8080'

/**
 * This function shows how to use SIWE for authentication with a local server via the FiatConnect API.
 *
 * (Note that the transferId given is 'test', which probably won't exist. Note also that this function doesn't start
 *  the local server. It's just an example that you can optionally borrow from for integration testing.)
 */
async function main() {
  // deepcode ignore HardcodedNonCryptoSecret: <debug>
  const privateKey =
    '0x9999999999999999999999999999999999999999999999999999999999999999'
  const publicKey = new ethers.utils.SigningKey(privateKey).compressedPublicKey
  const accountAddress = ethers.utils.computeAddress(ensureLeading0x(publicKey))
  const wallet = new ethers.Wallet(privateKey)

  const expirationDate = new Date(Date.now() + 14400000) // 4 hours from now
  const myURL = new URL(BASE_URL)
  const hostname = myURL.hostname

  const siweMessage = new SiweMessage({
    address: wallet.address,
    statement: 'Sign in with Ethereum',
    domain: hostname,
    uri: `${BASE_URL}/auth/login`,
    // uri: `https://${DOMAIN}`,
    version: '1',
    chainId: 44787,
    nonce: generateNonce(),
    expirationTime: expirationDate.toISOString(),
  })
  const message = siweMessage.prepareMessage()
  const signature = await wallet.signMessage(message)

  const authResponse = await fetch(`${BASE_URL}/auth/login`, {
    method: 'POST',
    body: JSON.stringify({ message, signature }),
    headers: { 'Content-Type': 'application/json' },
  })

  if (!authResponse.ok) {
    console.log('Auth request failed:', await authResponse.text())
    return
  }

  // set-cookie will be of the form:
  // api-starter=<cookie-val>; Path=/; Expires=Fri, 22 Apr 2022 10:36:40 GMT; HttpOnly; SameSite=Strict
  const authCookie = authResponse.headers.raw()['set-cookie'][0]
  console.log(authCookie)
}

main()
