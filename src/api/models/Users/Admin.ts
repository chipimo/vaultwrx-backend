import { Column, Entity, JoinColumn, OneToOne, PrimaryGeneratedColumn } from 'typeorm';
import { ObjectType, Field } from 'type-graphql';
import { EntityBase } from '@base/infrastructure/abstracts/EntityBase';
import { User } from './User';

@ObjectType()
@Entity({ name: 'admins' })
export class Admin extends EntityBase {
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

  @Field()
  @Column({ name: 'admin_level', default: 'standard' })
  adminLevel: string; // 'standard', 'super', 'system'

  @Field()
  @Column({ name: 'can_manage_companies', default: true })
  canManageCompanies: boolean;

  @Field()
  @Column({ name: 'can_manage_admins', default: false })
  canManageAdmins: boolean;

  @Field({ nullable: true })
  @Column({ name: 'last_login', type: 'timestamp', nullable: true })
  lastLogin: Date;

  @Field()
  @Column({ name: 'created_at', type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @Field()
  @Column({ name: 'updated_at', type: 'timestamp', default: () => 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP' })
  updatedAt: Date;
}

