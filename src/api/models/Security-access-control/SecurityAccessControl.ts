// models/SecurityAccessControl.ts
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { Role } from '../Store-employee-management/Role';
import { ObjectType, Field } from 'type-graphql/dist';

@ObjectType()
@Entity({ name: 'security_access_controls' })
export class SecurityAccessControl {
  @Field((type) => String)
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Field(() => Role)
  @ManyToOne(() => Role, { eager: true })
  @JoinColumn({ name: 'role_id' })
  role: Role;

  @Field()
  @Column()
  resource: string;

  @Field()
  @Column()
  action: string; 

  @Field()
  @Column({ default: false }) 
  allowed: boolean;

  @Field()
  @Column({ type: 'text', nullable: true })
  description: string;

  @Field()
  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @Field()
  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
