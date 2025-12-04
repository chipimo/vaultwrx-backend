import { Column, Entity, ManyToMany, PrimaryGeneratedColumn } from 'typeorm';
import { ObjectType, Field, registerEnumType } from 'type-graphql';
import { EntityBase } from '@base/infrastructure/abstracts/EntityBase';
import { Role } from './Role';

export enum PermissionAction {
  READ = 'read',
  WRITE = 'write',
  CREATE = 'create',
  DELETE = 'delete',
  EDIT = 'edit',
}

export enum PermissionResource {
  USERS = 'users',
  RETAILERS = 'retailers',
  CUSTOMERS = 'customers',
  STAFF = 'staff',
  FUNERAL_DIRECTORS = 'funeral_directors',
  COMPANIES = 'companies',
  ORDERS = 'orders',
  PRODUCTS = 'products',
  REPORTS = 'reports',
  SETTINGS = 'settings',
}

registerEnumType(PermissionAction, {
  name: 'PermissionAction',
  description: 'Permission actions',
});

registerEnumType(PermissionResource, {
  name: 'PermissionResource',
  description: 'Permission resources',
});

@ObjectType()
@Entity({ name: 'permissions' })
export class Permission extends EntityBase {
  @Field(() => String)
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Field(() => PermissionResource)
  @Column({
    type: 'enum',
    enum: PermissionResource,
  })
  resource: PermissionResource;

  @Field(() => PermissionAction)
  @Column({
    type: 'enum',
    enum: PermissionAction,
  })
  action: PermissionAction;

  @Field({ nullable: true })
  @Column({ nullable: true })
  description: string;

  @Field(() => [Role], { nullable: true })
  @ManyToMany(() => Role, (role) => role.permissions)
  roles: Role[];
}

