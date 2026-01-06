import { Entity, PrimaryGeneratedColumn, Column, OneToMany, ManyToOne, CreateDateColumn, UpdateDateColumn, JoinColumn } from 'typeorm';
import { ObjectType, Field } from 'type-graphql';
import { UserProfile } from './UserProfile';
import { AuditLog } from '../Security-access-control/AuditLog';
import { Customer } from '../Store-employee-management/Customer';
import { Staff } from '../Store-employee-management/Staff';
import { Retailer } from '../Company/Retailer';

// Enum for user types
export enum UserType {
  CUSTOMER = 'customer',
  STAFF = 'staff',
  RETAILER = 'retailer',
  ADMIN = 'admin',
  SUPER_ADMIN = 'super_admin'
}

// Enum for user status
export enum UserStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  SUSPENDED = 'suspended',
  PENDING_VERIFICATION = 'pending_verification',
  BANNED = 'banned'
}

// Enum for authentication providers
export enum AuthProvider {
  FIREBASE = 'firebase',
  GOOGLE = 'google',
  FACEBOOK = 'facebook',
  APPLE = 'apple',
  EMAIL = 'email'
}

@ObjectType()
@Entity({ name: 'users' })
export class User {
  @Field()
  @PrimaryGeneratedColumn('uuid')
  id: string;

  // Firebase Auth UID - this is the primary identifier from Firebase
  @Field()
  @Column({ name: 'firebase_uid', unique: true })
  firebaseUid: string;

  @Field()
  @Column({ unique: true })
  email: string;

  @Field({ nullable: true })
  @Column({ nullable: true })
  phone: string;

  @Field()
  @Column({
    type: 'enum',
    enum: UserType,
    default: UserType.CUSTOMER
  })
  userType: UserType;

  @Field()
  @Column({
    type: 'enum',
    enum: UserStatus,
    default: UserStatus.ACTIVE
  })
  status: UserStatus;

  @Field()
  @Column({
    type: 'enum',
    enum: AuthProvider,
    default: AuthProvider.FIREBASE
  })
  authProvider: AuthProvider;

  @Field()
  @Column({ name: 'is_email_verified', default: false })
  isEmailVerified: boolean;

  @Field()
  @Column({ name: 'is_phone_verified', default: false })
  isPhoneVerified: boolean;

  @Field({ nullable: true })
  @Column({ name: 'last_login_at', type: 'timestamp', nullable: true })
  lastLoginAt: Date;

  @Field({ nullable: true })
  @Column({ name: 'password_changed_at', type: 'timestamp', nullable: true })
  passwordChangedAt: Date;

  @Field({ nullable: true })
  @Column({ name: 'email_verification_token', nullable: true })
  emailVerificationToken: string;

  @Field({ nullable: true })
  @Column({ name: 'phone_verification_token', nullable: true })
  phoneVerificationToken: string;

  @Field({ nullable: true })
  @Column({ name: 'password_reset_token', nullable: true })
  passwordResetToken: string;

  @Field({ nullable: true })
  @Column({ name: 'password_reset_expires', type: 'timestamp', nullable: true })
  passwordResetExpires: Date;

  @Field({ nullable: true })
  @Column({ name: 'two_factor_secret', nullable: true })
  twoFactorSecret: string;

  @Field()
  @Column({ name: 'two_factor_enabled', default: false })
  twoFactorEnabled: boolean;

  @Field({ nullable: true })
  @Column({ name: 'preferred_language', default: 'en' })
  preferredLanguage: string;

  @Field({ nullable: true })
  @Column({ name: 'timezone', default: 'UTC' })
  timezone: string;

  @Field({ nullable: true })
  @Column({ name: 'avatar_url', nullable: true })
  avatarUrl: string;

  @Field({ nullable: true })
  @Column({ name: 'metadata', type: 'jsonb', nullable: true })
  metadata: string; // Store additional Firebase user data

  // Relationships
  @Field(() => [UserProfile])
  @OneToMany(() => UserProfile, userProfile => userProfile.user)
  profiles: UserProfile[];

  @Field(() => [AuditLog])
  @OneToMany(() => AuditLog, auditLog => auditLog.user)
  auditLogs: AuditLog[];

  // Direct relationships to profile entities
  @Field(() => [Customer])
  @OneToMany(() => Customer, customer => customer.user)
  customers: Customer[];

  @Field(() => [Staff])
  @OneToMany(() => Staff, staff => staff.user)
  staff: Staff[];

  @Field(() => [Retailer])
  @OneToMany(() => Retailer, retailer => retailer.owner)
  ownedRetailers: Retailer[];

  // Timestamps
  @Field()
  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @Field()
  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
