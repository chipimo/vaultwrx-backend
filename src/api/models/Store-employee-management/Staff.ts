import { Entity, PrimaryGeneratedColumn, Column, OneToMany, ManyToOne, CreateDateColumn, UpdateDateColumn, JoinColumn } from 'typeorm';
import { ObjectType, Field } from 'type-graphql';
import { User } from '../Auth/User';
import { UserProfile } from '../Auth/UserProfile';
import { UserRole } from './UserRole';
import { Retailer } from '../Company/Retailer';
import { AuditLog } from '../Security-access-control/AuditLog';

// Enum for staff status
export enum StaffStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  SUSPENDED = 'suspended',
  TERMINATED = 'terminated',
  ON_LEAVE = 'on_leave'
}

// Enum for staff position
export enum StaffPosition {
  DIRECTOR = 'director',
  MANAGER = 'manager',
  STAFF = 'staff',
  ADMINISTRATOR = 'administrator',
  COORDINATOR = 'coordinator',
  ASSISTANT = 'assistant'
}

@ObjectType()
@Entity({ name: 'staff' })
export class Staff {
  @Field()
  @PrimaryGeneratedColumn('uuid')
  id: string;

  // User relationship (optional - staff can exist without user account)
  @Field(() => User, { nullable: true })
  @ManyToOne(() => User, { eager: false })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Field({ nullable: true })
  @Column({ name: 'user_id', nullable: true })
  userId: string;

  // Retailer relationship
  @Field(() => Retailer)
  @ManyToOne(() => Retailer, retailer => retailer.staff, { eager: false })
  @JoinColumn({ name: 'retailer_id' })
  retailer: Retailer;

  @Field()
  @Column({ name: 'retailer_id' })
  retailerId: string;

  @Field()
  @Column({ name: 'first_name' })
  firstName: string;

  @Field()
  @Column({ name: 'last_name' })
  lastName: string;

  @Field()
  @Column({ unique: true })
  email: string;

  @Field({ nullable: true })
  @Column({ nullable: true })
  phone: string;

  @Field()
  @Column({
    type: 'enum',
    enum: StaffStatus,
    default: StaffStatus.ACTIVE
  })
  status: StaffStatus;

  @Field()
  @Column({
    type: 'enum',
    enum: StaffPosition,
    default: StaffPosition.STAFF
  })
  position: StaffPosition;

  @Field({ nullable: true })
  @Column({ nullable: true })
  password: string;

  @Field({ nullable: true })
  @Column({ nullable: true })
  avatar: string;

  @Field({ nullable: true })
  @Column({ nullable: true })
  department: string;

  @Field()
  @Column({ default: false })
  isEmailVerified: boolean;

  @Field()
  @Column({ default: false })
  isPhoneVerified: boolean;

  @Field({ nullable: true })
  @Column({ type: 'timestamp', nullable: true })
  lastLoginAt: Date;

  @Field({ nullable: true })
  @Column({ type: 'timestamp', nullable: true })
  passwordChangedAt: Date;

  // Role relationships
  @Field(() => [UserRole])
  @OneToMany(() => UserRole, userRole => userRole.role)
  userRoles: UserRole[];

  // User profiles relationship
  @Field(() => [UserProfile])
  @OneToMany(() => UserProfile, userProfile => userProfile.staff)
  userProfiles: UserProfile[];

  // Audit logs relationship
  @Field(() => [AuditLog])
  @OneToMany(() => AuditLog, auditLog => auditLog.staff)
  auditLogs: AuditLog[];

  @Field()
  @Column({ name: 'created_by' })
  createdBy: string;

  @Field()
  @Column({ name: 'updated_by' })
  updatedBy: string;

}
