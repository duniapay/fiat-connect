import {
  CryptoType,
  FiatType,
  TransferStatus,
  TransferType,
} from '@fiatconnect/fiatconnect-types'
import { Entity, Column, PrimaryGeneratedColumn, PrimaryColumn } from 'typeorm'

@Entity()
export class Transfer {
  @PrimaryColumn('uuid')
  id: string

  @Column({ name: 'fiatAccountId', type: 'varchar', length: 255 })
  fiatAccountId: string

  @Column({ name: 'quoteId', type: 'varchar', length: 255 })
  quoteId: string

  @Column({ type: 'varchar', length: 255 })
  transferAddress?: string

  @Column({
    name: 'transferStatus',
    type: 'enum',
    enum: TransferStatus,
  })
  status?: TransferStatus

  @Column({
    name: 'transferType',
    type: 'enum',
    enum: TransferType,
  })
  transferType?: TransferType

  @Column({
    name: 'fiatType',
    type: 'enum',
    enum: FiatType,
  })
  fiatType: any
  @Column({
    name: 'cryptoType',
    type: 'enum',
    enum: CryptoType,
  })
  cryptoType: any
  @Column({ name: 'amountProvided' })
  amountProvided: string
  @Column({ name: 'amountReceived' })
  amountReceived: string
  @Column({ name: 'fee' })
  fee: string
}
