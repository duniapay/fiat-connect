import { ethers } from 'ethers'
import { AddKycParams, FiatConnectClient } from '@fiatconnect/fiatconnect-sdk'
import { Network } from '@fiatconnect/fiatconnect-types'

async function main() {
    try {
        const wallet = ethers.Wallet.createRandom()

        const fiatConnectClient = new FiatConnectClient(
            {
              baseUrl: 'https://cico-staging.dunia.africa',
              network: Network.Alfajores,
              accountAddress: wallet.address,
              apiKey: `12333333`
            },
            (message: string) => wallet.signMessage(message),
          )
          const loginResult = await fiatConnectClient.login()
          console.log(loginResult)

    } catch (error) {
        console.log(error)
    }
}

main();