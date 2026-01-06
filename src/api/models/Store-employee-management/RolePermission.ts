import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, UpdateDateColumn, JoinColumn, Unique } from 'typeorm';
import { ObjectType, Field } from 'type-graphql';
import { Role } from './Role';
import { Permission } from './Permission';

@ObjectType()
@Entity({ name: 'role_permissions' })
@Unique(['roleId', 'permissionId'])
export class RolePermission {
  @Field()
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Field(() => Role)
  @ManyToOne(() => Role, role => role.rolePermissions, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'role_id' })
  role: Role;

  @Field()
  @Column({ name: 'role_id' })
  roleId: string;

  @Field(() => Permission)
  @ManyToOne(() => Permission, permission => permission.rolePermissions, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'permission_id' })
  permission: Permission;

  @Field()
  @Column({ name: 'permission_id' })
  permissionId: string;

  @Field()
  @Column({ default: true })
  isAllowed: boolean;

  @Field({ nullable: true })
  @Column({ type: 'text', nullable: true })
  conditions: string; // JSON string for conditional permissions

  @Field({ nullable: true })
  @Column({ type: 'text', nullable: true })
  restrictions: string; // JSON string for permission restrictions

  @Field()
  @Column({ name: 'company_id' })
  companyId: string;

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
  public hasConditions(): boolean {
    return !!this.conditions;
  }

  public hasRestrictions(): boolean {
    return !!this.restrictions;
  }

  public getConditions(): any {
    try {
      return this.conditions ? JSON.parse(this.conditions) : null;
    } catch {
      return null;
    }
  }

  public getRestrictions(): any {
    try {
      return this.restrictions ? JSON.parse(this.restrictions) : null;
    } catch {
      return null;
    }
  }

  public setConditions(conditions: any): void {
    this.conditions = conditions ? JSON.stringify(conditions) : null;
  }

  public setRestrictions(restrictions: any): void {
    this.restrictions = restrictions ? JSON.stringify(restrictions) : null;
  }
}
