import { Column, Entity, OneToMany, OneToOne, PrimaryGeneratedColumn, JoinColumn } from 'typeorm';
import { ObjectType, Field, Int } from 'type-graphql';
import { EntityBase } from '@base/infrastructure/abstracts/EntityBase';
import { User } from '../Users/User';
import { Retailer } from '../Users/Retailer';
import { Customer } from '../Users/Customer';
import { Staff } from '../Users/Staff';
import { FuneralDirector } from '../Users/FuneralDirector';
import { Product } from '../Products/Product';
import { Color } from '../Products/Color';
import { Location } from '../Products/Location';
import { ServiceExtra } from '../Products/ServiceExtra';
import { Order } from '../Orders/Order';

export enum CompanyType {
  RETAILER = 'retailer',
}

@ObjectType()
@Entity({ name: 'companies' })
export class Company extends EntityBase {
  @Field(() => String)
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Field()
  @Column()
  name: string;

  @Field({ nullable: true })
  @Column({ nullable: true })
  description: string;

  @Field({ nullable: true })
  @Column({ nullable: true })
  address: string;

  @Field({ nullable: true })
  @Column({ nullable: true })
  phone: string;

  @Field({ nullable: true })
  @Column({ nullable: true })
  email: string;

  @Field()
  @Column({
    type: 'varchar',
    length: '50',
    default: 'retailer',
  })
  type: string;

  @Field(() => String, { nullable: true })
  @Column({ name: 'retailer_id', type: 'uuid', nullable: true, unique: true })
  retailer_id: string;

  @Field(() => Retailer, { nullable: true })
  @OneToOne(() => Retailer, (retailer) => retailer.company, { nullable: true })
  @JoinColumn({ name: 'retailer_id' })
  retailer: Retailer;

  @Field()
  @Column({ name: 'created_at', type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @Field()
  @Column({ name: 'updated_at', type: 'timestamp', default: () => 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP' })
  updatedAt: Date;

  // All users linked to this company (customers, staff, funeral directors)
  @Field(() => [User], { nullable: true })
  @OneToMany(() => User, (user) => user.company)
  users: User[];

  // Relationships with specific user type models
  @Field(() => [Customer], { nullable: true })
  @OneToMany(() => Customer, (customer) => customer.company)
  customers: Customer[];

  @Field(() => [Staff], { nullable: true })
  @OneToMany(() => Staff, (staff) => staff.company)
  staff: Staff[];

  @Field(() => [FuneralDirector], { nullable: true })
  @OneToMany(() => FuneralDirector, (funeralDirector) => funeralDirector.company)
  funeralDirectors: FuneralDirector[];

  // Product relationships
  @Field(() => [Product], { nullable: true })
  @OneToMany(() => Product, (product) => product.company)
  products: Product[];

  @Field(() => [Color], { nullable: true })
  @OneToMany(() => Color, (color) => color.company)
  colors: Color[];

  @Field(() => [Location], { nullable: true })
  @OneToMany(() => Location, (location) => location.company)
  locations: Location[];

  @Field(() => [ServiceExtra], { nullable: true })
  @OneToMany(() => ServiceExtra, (serviceExtra) => serviceExtra.company)
  serviceExtras: ServiceExtra[];

  @Field(() => [Order], { nullable: true })
  @OneToMany(() => Order, (order) => order.company)
  orders: Order[];
}

