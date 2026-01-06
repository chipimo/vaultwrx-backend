import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, JoinColumn } from 'typeorm';
import { ObjectType, Field } from 'type-graphql';
import { Employee } from './Employee';

@ObjectType()
@Entity({ name: 'employee_login_logs' })
export class EmployeeLoginLog {
  @Field()
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Field(() => Employee)
  @ManyToOne(() => Employee, { eager: false })
  @JoinColumn({ name: 'employee_id' })
  employee: Employee;

  @Field()
  @Column({ name: 'employee_id' })
  employeeId: string;

  @Field({ nullable: true })
  @Column({ name: 'ip_address', nullable: true })
  ipAddress: string;

  @Field({ nullable: true })
  @Column({ name: 'user_agent', nullable: true })
  userAgent: string;

  @Field()
  @Column({ name: 'login_successful', default: true })
  loginSuccessful: boolean;

  @Field({ nullable: true })
  @Column({ name: 'failure_reason', nullable: true })
  failureReason: string;

  @Field()
  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}

