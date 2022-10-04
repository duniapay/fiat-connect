import { CryptoType, FiatType } from '@fiatconnect/fiatconnect-types'
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  PrimaryColumn,
} from 'typeorm'
import { ConversionType } from '../enums'

@Entity()
export class Quote {
  @PrimaryColumn()
  id: string
  @Column('simple-json')
  quote: {}
  @Column('simple-json')
  fiatAccount: {}
  @Column('simple-json')
  kyc: {}
}
