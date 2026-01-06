import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { ObjectType, Field } from 'type-graphql';

export enum ReportStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  COMPLETED = 'completed',
  FAILED = 'failed'
}

@ObjectType()
@Entity({ name: 'customer_insights_reports' })
export class CustomerInsightsReport {
  @Field()
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Field()
  @Column({ name: 'report_name' })
  reportName: string;

  @Field({ nullable: true })
  @Column({ type: 'text', nullable: true })
  description: string;

  @Field()
  @Column({
    type: 'enum',
    enum: ReportStatus,
    default: ReportStatus.PENDING
  })
  status: ReportStatus;

  @Field({ nullable: true })
  @Column({ name: 'company_id', nullable: true })
  companyId: string;

  @Field({ nullable: true })
  @Column({ name: 'generated_by', nullable: true })
  generatedBy: string;

  @Field({ nullable: true })
  @Column({ name: 'report_data', type: 'jsonb', nullable: true })
  reportData: any;

  @Field({ nullable: true })
  @Column({ name: 'date_from', type: 'timestamp', nullable: true })
  dateFrom: Date;

  @Field({ nullable: true })
  @Column({ name: 'date_to', type: 'timestamp', nullable: true })
  dateTo: Date;

  @Field()
  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @Field()
  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}

