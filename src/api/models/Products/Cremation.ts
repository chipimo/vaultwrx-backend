import { Column, Entity, OneToOne, PrimaryGeneratedColumn, JoinColumn } from 'typeorm';
import { ObjectType, Field, registerEnumType } from 'type-graphql';
import { EntityBase } from '@base/infrastructure/abstracts/EntityBase';
import { Product } from './Product';
import { CremationType, WitnessType } from '../Orders/OrderItem';

export enum CremainsContainerType {
  URN_BY_COMPANY = 'urn_by_company',
  URN_BY_FAMILY = 'urn_by_family',
  BLACK_PLASTIC = 'black_plastic',
  CARDBOARD_BOX = 'cardboard_box',
}

registerEnumType(CremainsContainerType, {
  name: 'CremainsContainerType',
  description: 'Cremains container type options',
});

@ObjectType()
@Entity({ name: 'cremations' })
export class Cremation extends EntityBase {
  @Field(() => String)
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Field(() => String)
  @Column({ name: 'product_id', type: 'uuid', unique: true })
  productId: string;

  @Field(() => Product)
  @OneToOne(() => Product, (product) => product.cremation, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'product_id' })
  product: Product;

  @Field(() => CremationType, { nullable: true })
  @Column({
    name: 'arrival_method',
    type: 'varchar',
    length: 50,
    nullable: true,
  })
  arrivalMethod: CremationType;

  @Field({ nullable: true })
  @Column({ name: 'arrival_location', nullable: true })
  arrivalLocation: string;

  @Field({ nullable: true })
  @Column({ name: 'arrival_date', type: 'date', nullable: true })
  arrivalDate: Date;

  @Field({ nullable: true })
  @Column({ name: 'body_container', nullable: true })
  bodyContainer: string;

  @Field({ nullable: true })
  @Column({ name: 'arrival_comments', type: 'text', nullable: true })
  arrivalComments: string;

  @Field({ nullable: true })
  @Column({ name: 'travel_permit', nullable: true })
  travelPermit: string;

  @Field({ nullable: true })
  @Column({ name: 'death_certificate', nullable: true })
  deathCertificate: string; 

  @Field({ nullable: true })
  @Column({ name: 'cremation_authorization', nullable: true })
  cremationAuthorization: string;  

  @Field({ nullable: true })
  @Column({ name: 'witnesses_present', type: 'boolean', default: false })
  witnessesPresent: boolean;

  @Field(() => WitnessType, { nullable: true })
  @Column({
    name: 'witness_type',
    type: 'varchar',
    length: 50,
    nullable: true,
  })
  witnessType: WitnessType;

  @Field(() => [CremainsContainerType], { nullable: true })
  @Column({
    name: 'cremains_container_types',
    type: 'json',
    nullable: true,
  })
  cremainsContainerTypes: CremainsContainerType[];

  @Field(() => [String], { nullable: true })
  @Column({ name: 'extras', type: 'json', nullable: true })
  extras: string[];

  @Field(() => CremationType, { nullable: true })
  @Column({
    name: 'return_method',
    type: 'varchar',
    length: 50,
    nullable: true,
  })
  returnMethod: CremationType;

  @Field({ nullable: true })
  @Column({ name: 'return_location', nullable: true })
  returnLocation: string;

  @Field({ nullable: true })
  @Column({ name: 'return_date', type: 'date', nullable: true })
  returnDate: Date;

  @Field({ nullable: true })
  @Column({ name: 'return_comments', type: 'text', nullable: true })
  returnComments: string;

  @Field()
  @Column({ name: 'created_at', type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @Field()
  @Column({ name: 'updated_at', type: 'timestamp', default: () => 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP' })
  updatedAt: Date;
}

