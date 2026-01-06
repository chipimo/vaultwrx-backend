import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, UpdateDateColumn, JoinColumn } from 'typeorm';
import { ObjectType, Field } from 'type-graphql';
import { Role } from './Role';

@ObjectType()
@Entity({ name: 'user_roles' })
export class UserRole {
  @Field()
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Field()
  @Column({ name: 'user_id' })
  userId: string;

  @Field()
  @Column({ name: 'user_type' })
  userType: string; // 'employee', 'customer', 'admin'

  @Field(() => Role)
  @ManyToOne(() => Role, { eager: true })
  @JoinColumn({ name: 'role_id' })
  role: Role;

  @Field()
  @Column({ name: 'role_id' })
  roleId: string;

  @Field()
  @Column({ name: 'company_id' })
  companyId: string;

  @Field()
  @Column({ default: true })
  isActive: boolean;

  @Field({ nullable: true })
  @Column({ type: 'timestamp', nullable: true })
  assignedAt: Date;

  @Field({ nullable: true })
  @Column({ type: 'timestamp', nullable: true })
  expiresAt: Date;

  @Field({ nullable: true })
  @Column({ type: 'text', nullable: true })
  assignedBy: string;

  @Field({ nullable: true })
  @Column({ type: 'text', nullable: true })
  notes: string;

  // Audit fields
  @Field()
  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @Field()
  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @Field()
  @Column({ name: 'created_by' })
  createdBy: string;

  @Field()
  @Column({ name: 'updated_by' })
  updatedBy: string;

  // Helper methods
  public isExpired(): boolean {
    return this.expiresAt ? new Date() > this.expiresAt : false;
  }

  public isActiveAndNotExpired(): boolean {
    return this.isActive && !this.isExpired();
  }

  public getDaysUntilExpiry(): number | null {
    if (!this.expiresAt) return null;
    const now = new Date();
    const diffTime = this.expiresAt.getTime() - now.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }
}
