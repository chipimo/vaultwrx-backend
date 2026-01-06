import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, UpdateDateColumn, JoinColumn } from 'typeorm';
import { ObjectType, Field } from 'type-graphql';
import { Role } from './Role';

export enum EmployeeStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  SUSPENDED = 'suspended',
  PENDING = 'pending'
}

@ObjectType()
@Entity({ name: 'employees' })
export class Employee {
  @Field()
  @PrimaryGeneratedColumn('uuid')
  id: string;

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
  password: string;

  @Field({ nullable: true })
  @Column({ nullable: true })
  phone: string;

  @Field(() => Role, { nullable: true })
  @ManyToOne(() => Role, { eager: false })
  @JoinColumn({ name: 'role_id' })
  role: Role;

  @Field({ nullable: true })
  @Column({ name: 'role_id', nullable: true })
  roleId: string;

  @Field({ nullable: true })
  @Column({ name: 'company_id', nullable: true })
  companyId: string;

  @Field({ nullable: true })
  @Column({ nullable: true })
  country: string;

  // Virtual property for roles array (maps from single role for compatibility)
  get roles(): Role[] {
    return this.role ? [this.role] : [];
  }

  // Virtual property for companies array (for compatibility)
  get companies(): any[] {
    return this.companyId ? [{ id: this.companyId }] : [];
  }

  // Employee ID alias (for compatibility)
  get employeeId(): string {
    return this.id;
  }

  @Field()
  @Column({
    type: 'enum',
    enum: EmployeeStatus,
    default: EmployeeStatus.PENDING
  })
  status: EmployeeStatus;

  @Field({ nullable: true })
  @Column({ nullable: true })
  avatar: string;

  @Field({ nullable: true })
  @Column({ name: 'profile_image_url', nullable: true })
  profileImageUrl: string;

  @Field()
  @Column({ name: 'is_email_verified', default: false })
  isEmailVerified: boolean;

  @Field()
  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @Field()
  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}

