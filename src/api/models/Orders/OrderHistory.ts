import {
  Column,
  Entity,
  OneToMany,
  ManyToOne,
  PrimaryColumn,
  JoinColumn,
} from 'typeorm';
import { ObjectType, Field } from 'type-graphql';
import { OrderStatus } from './Order';
import { User } from '../Users/User';
import { Customer } from '../Users/Customer';
import { Staff } from '../Users/Staff';
import { FuneralDirector } from '../Users/FuneralDirector';
import { Retailer } from '../Users/Retailer';
import { OrderItem } from './OrderItem';
import { Deceased } from './Deceased';
import { Photo } from './Photo';
import { OrderExtraCharge } from './OrderExtraCharge';
import { Location } from '../Products/Location';
import { OrderContact } from './OrderContact';
import { Comment } from './Comment';
import { Company } from '../Company/Company';

@ObjectType()
@Entity({ name: 'order_history' })
export class OrderHistory {
  @Field(() => String)
  @PrimaryColumn('uuid')
  id: string;

  @Field(() => Company, { nullable: true })
  @ManyToOne(() => Company, { nullable: true })
  @JoinColumn({ name: 'company_id' })
  company: Company;

  @Field(() => String, { nullable: true })
  @Column({ name: 'company_id', type: 'uuid', nullable: true })
  companyId: string;

  @Field(() => String, { nullable: true })
  @Column({ name: 'user_id', type: 'uuid', nullable: true })
  userId: string;

  @Field(() => String, { nullable: true })
  @Column({ name: 'retailer_id', type: 'uuid', nullable: true })
  retailerId: string;

  @Field(() => String, { nullable: true })
  @Column({ name: 'customer_id', type: 'uuid', nullable: true })
  customerId: string;

  @Field(() => String, { nullable: true })
  @Column({ name: 'director_id', type: 'uuid', nullable: true })
  directorId: string;

  @Field(() => String, { nullable: true })
  @Column({ name: 'staff_id', type: 'uuid', nullable: true })
  staffId: string;

  @Field(() => String)
  @Column({ type: 'varchar', length: 50, default: 'draft' })
  status: OrderStatus;

  @Field()
  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  total: number;

  @Field()
  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  subtotal: number;

  @Field()
  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  discount: number;

  @Field()
  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  salesTax: number;

  @Field()
  @Column({ name: 'apply_platform_fee', default: false })
  applyPlatformFee: boolean;

  @Field({ nullable: true })
  @Column({ name: 'service_type_name', nullable: true })
  serviceTypeName: string;

  @Field()
  @Column({ name: 'service_type_price', type: 'decimal', precision: 10, scale: 2, default: 0 })
  serviceTypePrice: number;

  @Field({ nullable: true })
  @Column({ nullable: true })
  cemetery: string;

  @Field(() => Location, { nullable: true })
  @ManyToOne(() => Location, { nullable: true })
  @JoinColumn({ name: 'location_id' })
  location: Location;

  @Field(() => String, { nullable: true })
  @Column({ name: 'location_id', type: 'uuid', nullable: true })
  locationId: string;

  @Field({ nullable: true })
  @Column({ name: 'date_of_service', type: 'date', nullable: true })
  dateOfService: Date;

  @Field({ nullable: true })
  @Column({ name: 'time_of_service', type: 'time', nullable: true })
  timeOfService: string;

  @Field({ nullable: true })
  @Column({ name: 'arrival_time', type: 'time', nullable: true })
  arrivalTime: string;

  @Field({ nullable: true })
  @Column({ nullable: true })
  contact: string;

  @Field({ nullable: true })
  @Column({ nullable: true })
  email: string;

  @Field({ nullable: true })
  @Column({ name: 'cell_phone', nullable: true })
  cellPhone: string;

  @Field(() => [OrderContact], { nullable: true })
  @OneToMany(() => OrderContact, (orderContact) => orderContact.orderHistory, { nullable: true })
  contacts: OrderContact[];

  @Field()
  @Column({ name: 'is_deleted', default: false })
  isDeleted: boolean;

  @Field()
  @Column({ name: 'is_edited', default: false })
  isEdited: boolean;

  @Field()
  @Column({ name: 'is_parent', default: false })
  isParent: boolean;

  @Field()
  @Column({ default: false })
  delivered: boolean;

  @Field()
  @Column({ default: false })
  confirmed: boolean;

  @Field()
  @Column({ name: 'new_order_notifications_sent', default: false })
  newOrderNotificationsSent: boolean;

  @Field({ nullable: true })
  @Column({ type: 'text', nullable: true })
  comments: string;

  @Field({ nullable: true })
  @Column({ name: 'delivery_instructions', type: 'text', nullable: true })
  deliveryInstructions: string;

  @Field({ nullable: true })
  @Column({ name: 'order_d_status', nullable: true })
  orderDStatus: string;

  @Field({ nullable: true })
  @Column({ name: 'product_paint_color_options', nullable: true })
  productPaintColorOptions: string;

  @Field({ nullable: true })
  @Column({ name: 'service_extras', type: 'text', nullable: true })
  serviceExtras: string;

  @Field({ nullable: true })
  @Column({ name: 'store_name', nullable: true })
  storeName: string;

  @Field({ nullable: true })
  @Column({ name: 'store_address1', nullable: true })
  storeAddress1: string;

  @Field({ nullable: true })
  @Column({ name: 'store_address2', nullable: true })
  storeAddress2: string;

  @Field({ nullable: true })
  @Column({ name: 'store_city', nullable: true })
  storeCity: string;

  @Field({ nullable: true })
  @Column({ name: 'store_state', nullable: true })
  storeState: string;

  @Field({ nullable: true })
  @Column({ name: 'store_zip', nullable: true })
  storeZip: string;

  @Field({ nullable: true })
  @Column({ name: 'tracking_color', nullable: true })
  trackingColor: string;

  @Field()
  @Column({ name: 'created_at', type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @Field()
  @Column({ name: 'updated_at', type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  updatedAt: Date;

  @Field()
  @Column({ name: 'archived_at', type: 'timestamptz' })
  archivedAt: Date;

  @Field({ nullable: true })
  @Column({ name: 'order_type', type: 'varchar', nullable: true })
  orderType: string;

  @Field(() => [OrderItem], { nullable: true })
  @OneToMany(() => OrderItem, (orderItem) => orderItem.orderHistory, { nullable: true })
  orderItems: OrderItem[];

  @Field(() => [Deceased], { nullable: true })
  @OneToMany(() => Deceased, (deceased) => deceased.orderHistory, { nullable: true })
  deceased: Deceased[];

  @Field(() => [Photo], { nullable: true })
  @OneToMany(() => Photo, (photo) => photo.orderHistory, { nullable: true })
  photos: Photo[];

  @Field(() => [OrderExtraCharge], { nullable: true })
  @OneToMany(() => OrderExtraCharge, (oec) => oec.orderHistory, { nullable: true })
  orderExtraCharges: OrderExtraCharge[];

  @Field(() => [Comment], { nullable: true })
  @OneToMany(() => Comment, (comment) => comment.orderHistory, { nullable: true })
  orderComments: Comment[];

  @Field(() => User, { nullable: true })
  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Field(() => Retailer, { nullable: true })
  @ManyToOne(() => Retailer, { nullable: true })
  @JoinColumn({ name: 'retailer_id' })
  retailer: Retailer;

  @Field(() => Customer, { nullable: true })
  @ManyToOne(() => Customer, { nullable: true })
  @JoinColumn({ name: 'customer_id' })
  customer: Customer;

  @Field(() => FuneralDirector, { nullable: true })
  @ManyToOne(() => FuneralDirector, { nullable: true })
  @JoinColumn({ name: 'director_id' })
  director: FuneralDirector;

  @Field(() => Staff, { nullable: true })
  @ManyToOne(() => Staff, { nullable: true })
  @JoinColumn({ name: 'staff_id' })
  staff: Staff;
}
