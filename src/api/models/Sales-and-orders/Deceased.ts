import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, UpdateDateColumn, JoinColumn } from 'typeorm';
import { ObjectType, Field } from 'type-graphql';
import { Order } from './Order';

// Enum for gender
export enum Gender {
  MALE = 'male',
  FEMALE = 'female'
}

@ObjectType('SalesDeceased')
@Entity({ name: 'deceased' })
export class Deceased {
  @Field()
  @PrimaryGeneratedColumn('uuid')
  id: string;

  // Order relationship
  @Field(() => Order)
  @ManyToOne(() => Order, order => order.deceased, { onDelete: 'CASCADE', eager: false })
  @JoinColumn({ name: 'order_id' })
  order: Order;

  @Field()
  @Column({ name: 'order_id' })
  orderId: string;

  // Personal information
  @Field()
  @Column()
  name: string;

  @Field({ nullable: true })
  @Column({ name: 'birth_date', type: 'date', nullable: true })
  birthDate: Date;

  @Field({ nullable: true })
  @Column({ name: 'death_date', type: 'date', nullable: true })
  deathDate: Date;

  // Physical characteristics
  @Field({ nullable: true })
  @Column({ nullable: true })
  height: string;

  @Field({ nullable: true })
  @Column({ nullable: true })
  weight: string;

  @Field({ nullable: true })
  @Column({
    type: 'enum',
    enum: Gender,
    nullable: true
  })
  gender: Gender;

  // Embalming status
  @Field({ nullable: true })
  @Column({ name: 'is_embalmed', nullable: true })
  isEmbalmed: boolean;

  // Timestamps
  @Field()
  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @Field()
  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

}
