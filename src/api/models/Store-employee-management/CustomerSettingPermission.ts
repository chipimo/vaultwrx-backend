import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, UpdateDateColumn, JoinColumn } from 'typeorm';
import { ObjectType, Field } from 'type-graphql';
import { Customer } from './Customer';

@ObjectType()
@Entity({ name: 'customer_setting_permissions' })
export class CustomerSettingPermission {
  @Field()
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Field(() => Customer)
  @ManyToOne(() => Customer, { eager: false })
  @JoinColumn({ name: 'customer_id' })
  customer: Customer;

  @Field()
  @Column({ name: 'customer_id' })
  customerId: string;

  @Field()
  @Column({ name: 'setting_key' })
  settingKey: string;

  @Field()
  @Column({ name: 'is_allowed', default: true })
  isAllowed: boolean;

  @Field({ nullable: true })
  @Column({ type: 'text', nullable: true })
  description: string;

  @Field()
  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @Field()
  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}

