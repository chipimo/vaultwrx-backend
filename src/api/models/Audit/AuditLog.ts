import { Column, Entity, ManyToOne, PrimaryGeneratedColumn, JoinColumn } from 'typeorm';
import { ObjectType, Field, registerEnumType } from 'type-graphql';
import { EntityBase } from '@base/infrastructure/abstracts/EntityBase';
import { Company } from '../Company/Company';
import { User } from '../Users/User';

export enum AuditAction {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  VIEW = 'view',
  LOGIN = 'login',
  LOGOUT = 'logout',
  EXPORT = 'export',
  IMPORT = 'import',
}

export enum AuditResource {
  ORDER = 'order',
  PRODUCT = 'product',
  CUSTOMER = 'customer',
  STAFF = 'staff',
  LOCATION = 'location',
  COLOR = 'color',
  SERVICE_EXTRA = 'service_extra',
  COMPANY = 'company',
  USER = 'user',
  RETAILLER = 'retailer',
  FUNERAL_DIRECTOR = 'funeral_director',
}

registerEnumType(AuditAction, {
  name: 'AuditAction',
  description: 'Types of actions that can be audited',
});

registerEnumType(AuditResource, {
  name: 'AuditResource',
  description: 'Types of resources that can be audited',
});

@ObjectType()
@Entity({ name: 'audit_logs' })
export class AuditLog extends EntityBase {
  @Field(() => String)
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Field(() => Company, { nullable: true })
  @ManyToOne(() => Company, { nullable: true })
  @JoinColumn({ name: 'company_id' })
  company: Company;

  @Field(() => String, { nullable: true })
  @Column({ name: 'company_id', type: 'uuid', nullable: true })
  companyId: string;

  @Field(() => User, { nullable: true })
  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Field(() => String, { nullable: true })
  @Column({ name: 'user_id', type: 'uuid', nullable: true })
  userId: string;

  @Field()
  @Column({ name: 'user_email', nullable: true })
  userEmail: string;

  @Field()
  @Column({ name: 'user_name', nullable: true })
  userName: string;

  @Field()
  @Column({ name: 'user_role', nullable: true })
  userRole: string;

  @Field(() => AuditAction)
  @Column({
    type: 'varchar',
    length: 50,
  })
  action: AuditAction;

  @Field(() => AuditResource)
  @Column({
    type: 'varchar',
    length: 50,
  })
  resource: AuditResource;

  @Field(() => String, { nullable: true })
  @Column({ name: 'resource_id', type: 'uuid', nullable: true })
  resourceId: string;

  @Field({ nullable: true })
  @Column({ type: 'text', nullable: true })
  description: string;

  @Field({ nullable: true })
  @Column({ name: 'ip_address', nullable: true })
  ipAddress: string;

  @Field({ nullable: true })
  @Column({ name: 'user_agent', type: 'text', nullable: true })
  userAgent: string;

  @Column({ name: 'old_values', type: 'jsonb', nullable: true })
  oldValues: Record<string, any>;

  @Column({ name: 'new_values', type: 'jsonb', nullable: true })
  newValues: Record<string, any>;

  @Field()
  @Column({ name: 'created_at', type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;
}

