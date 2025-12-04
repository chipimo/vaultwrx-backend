import { Column, Entity, JoinColumn, ManyToOne, OneToOne, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { ObjectType, Field, Int } from 'type-graphql';
import { EntityBase } from '@base/infrastructure/abstracts/EntityBase';
import { User } from './User';
import { Company } from '../Company/Company';
import { Order } from '../Orders/Order';

@ObjectType()
@Entity({ name: 'funeral_directors' })
export class FuneralDirector extends EntityBase {
  @Field(() => String)
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Field(() => String)
  @Column({ name: 'user_id', type: 'uuid', unique: true })
  user_id: string;

  @Field(() => User, { nullable: true })
  @OneToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Field(() => String)
  @Column({ name: 'company_id', type: 'uuid' })
  company_id: string;

  @Field(() => Company, { nullable: true })
  @ManyToOne(() => Company, (company) => company.funeralDirectors)
  @JoinColumn({ name: 'company_id' })
  company: Company;

  @Field({ nullable: true })
  @Column({ name: 'license_number', nullable: true })
  licenseNumber: string;

  @Field({ nullable: true })
  @Column({ name: 'license_expiry', type: 'date', nullable: true })
  licenseExpiry: Date;

  @Field()
  @Column({ name: 'is_verified', default: false })
  isVerified: boolean;

  @Field({ nullable: true })
  @Column({ name: 'specialization', nullable: true })
  specialization: string;

  @Field(() => Int, { nullable: true })
  @Column({ name: 'years_of_experience', nullable: true })
  yearsOfExperience: number;

  // Order relationships
  @Field(() => [Order], { nullable: true })
  @OneToMany(() => Order, (order) => order.director, { cascade: false })
  orders: Order[];

  @Field()
  @Column({ name: 'created_at', type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @Field()
  @Column({ name: 'updated_at', type: 'timestamp', default: () => 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP' })
  updatedAt: Date;
}

