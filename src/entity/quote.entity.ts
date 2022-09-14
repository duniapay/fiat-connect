import { CryptoType, FiatType } from '@fiatconnect/fiatconnect-types'
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm'
import { ConversionType } from '../enums'

@Entity()
export class Quote {
  @PrimaryGeneratedColumn("uuid")
  id: string

  // @Column({ type: 'varchar', length: 255 })
  // country: string

  // @Column({ type: 'varchar', length: 255 })
  // region: string

  // @Column({
  //   name: 'fiatType',
  //   type: 'enum',
  //   enum: FiatType,
  // })
  // fiatType: FiatType

  // @Column({
  //   name: 'cryptoType',
  //   type: 'enum',
  //   enum: CryptoType,
  // })
  // cryptoType: CryptoType

  // @Column({ name: 'cryptoAmount', type: 'decimal', precision: 14, scale: 4 })
  // cryptoAmount: number

  // @Column({
  //   name: 'quote_type',
  //   type: 'enum',
  //   enum: ConversionType,
  // })
  // quoteType: ConversionType

  // @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  // createdAt: string

  // @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  // updatedAt: string

  // @Column({ name: 'guaranteedUntil', type: 'timestamptz' })
  // guaranteedUntil?: string
  @Column('simple-json')
  quote: {}
  @Column('simple-json')
  fiatAccount: {}
  @Column('simple-json')
  kyc: {}
}
