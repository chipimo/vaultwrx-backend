import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, JoinColumn } from 'typeorm';
import { ObjectType, Field } from 'type-graphql';
import { Order } from './Order';
import { Customer } from '../Store-employee-management/Customer';

// Enum for photo types based on UI requirements
export enum PhotoType {
  CERTIFICATE = 'certificate',
  TRAVEL = 'travel',
  PERMIT = 'permit',
  AUTHORIZATION = 'authorization',
  CREMATION = 'cremation',
  CUSTOMIZATION = 'customization',
  OTHER = 'other'
}

@ObjectType('SalesPhoto')
@Entity({ name: 'photos' })
export class Photo {
  @Field()
  @PrimaryGeneratedColumn('uuid')
  id: string;

  // Order relationship
  @Field(() => Order)
  @ManyToOne(() => Order, order => order.photos, { onDelete: 'CASCADE', eager: false })
  @JoinColumn({ name: 'order_id' })
  order: Order;

  // User relationship (using Customer as the user entity)
  @Field(() => Customer, { nullable: true })
  @ManyToOne(() => Customer, { eager: false })
  @JoinColumn({ name: 'user_id' })
  user: Customer;

  @Field()
  @Column({ name: 'order_id' })
  orderId: string;

  // User relationship
  @Field()
  @Column({ name: 'user_id' })
  userId: string;

  // File information
  @Field()
  @Column()
  url: string;

  @Field()
  @Column({
    type: 'enum',
    enum: PhotoType,
    default: PhotoType.OTHER
  })
  type: PhotoType;

  @Field({ nullable: true })
  @Column({ name: 'file_name', nullable: true })
  fileName: string;

  @Field({ nullable: true })
  @Column({ name: 'file_size', type: 'int', nullable: true })
  fileSize: number;

  @Field({ nullable: true })
  @Column({ name: 'mime_type', nullable: true })
  mimeType: string;

  // Timestamps
  @Field()
  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

}
