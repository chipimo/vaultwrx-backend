import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, UpdateDateColumn, JoinColumn } from 'typeorm';
import { ObjectType, Field } from 'type-graphql';
import { User, UserType } from './User';
import { Customer } from '../Store-employee-management/Customer';
import { Staff } from '../Store-employee-management/Staff';
import { Retailer } from '../Company/Retailer';

// Enum for profile types
export enum ProfileType {
  CUSTOMER = 'customer',
  STAFF = 'staff',
  RETAILER = 'retailer',
  ADMIN = 'admin'
}

@ObjectType()
@Entity({ name: 'user_profiles' })
export class UserProfile {
  @Field()
  @PrimaryGeneratedColumn('uuid')
  id: string;

  // User relationship
  @Field(() => User)
  @ManyToOne(() => User, user => user.profiles, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Field()
  @Column({ name: 'user_id' })
  userId: string;

  @Field()
  @Column({
    type: 'enum',
    enum: ProfileType
  })
  profileType: ProfileType;

  // Reference to the specific profile entity (customer, staff, or retailer)
  @Field({ nullable: true })
  @Column({ name: 'profile_entity_id', nullable: true })
  profileEntityId: string;

  @Field()
  @Column({ name: 'is_primary', default: false })
  isPrimary: boolean;

  @Field()
  @Column({ name: 'is_active', default: true })
  isActive: boolean;

  @Field({ nullable: true })
  @Column({ type: 'text', nullable: true })
  notes: string;

  // Profile-specific relationships (optional, for direct access)
  @Field(() => Customer, { nullable: true })
  @ManyToOne(() => Customer, { eager: false })
  @JoinColumn({ name: 'customer_id' })
  customer: Customer;

  @Field(() => Staff, { nullable: true })
  @ManyToOne(() => Staff, { eager: false })
  @JoinColumn({ name: 'staff_id' })
  staff: Staff;

  @Field(() => Retailer, { nullable: true })
  @ManyToOne(() => Retailer, { eager: false })
  @JoinColumn({ name: 'retailer_id' })
  retailer: Retailer;

  @Field({ nullable: true })
  @Column({ name: 'customer_id', nullable: true })
  customerId: string;

  @Field({ nullable: true })
  @Column({ name: 'staff_id', nullable: true })
  staffId: string;

  @Field({ nullable: true })
  @Column({ name: 'retailer_id', nullable: true })
  retailerId: string;

  // Timestamps
  @Field()
  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @Field()
  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
