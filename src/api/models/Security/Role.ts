import { Column, Entity, JoinTable, ManyToMany, PrimaryGeneratedColumn } from 'typeorm';
import { ObjectType, Field, registerEnumType } from 'type-graphql';
import { EntityBase } from '@base/infrastructure/abstracts/EntityBase';
import { Permission } from './Permission';

export enum RoleType {
  ADMIN = 'admin',
  RETAILER = 'retailer',
  CUSTOMER = 'customer',
  STAFF = 'staff',
  FUNERAL_DIRECTOR = 'funeral_director',
}

registerEnumType(RoleType, {
  name: 'RoleType',
  description: 'User role types',
});

@ObjectType()
@Entity({ name: 'roles' })
export class Role extends EntityBase {
  @Field(() => String)
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Field()
  @Column()
  name: string;

  @Field(() => RoleType)
  @Column({
    type: 'enum',
    enum: RoleType,
  })
  type: RoleType;

  @Field({ nullable: true })
  @Column({ nullable: true })
  description: string;

  @Field(() => [Permission], { nullable: true })
  @ManyToMany(() => Permission, (permission) => permission.roles)
  @JoinTable({
    name: 'role_permissions',
    joinColumn: { name: 'role_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'permission_id', referencedColumnName: 'id' },
  })
  permissions: Permission[];
}

