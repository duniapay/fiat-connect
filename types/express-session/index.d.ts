import { SiweMessage } from 'siwe';


declare module 'express-session' {
  interface Session {
    siwe: SiweMessage | null
  }
}


export {}