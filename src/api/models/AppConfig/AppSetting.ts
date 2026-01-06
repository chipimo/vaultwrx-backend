// models/AppSetting.ts
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from "typeorm";
import { ObjectType, Field } from "type-graphql";

@ObjectType() // Expose AppSetting as a GraphQL type
@Entity()
export class AppSetting {
  @Field()
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Field()
  @Column({ unique: true })
  key: string; // e.g., 'currency', 'tax_rate'

  @Field()
  @Column()
  value: string;

  // Additional configuration settings
  @Field({ nullable: true })
  @Column({ nullable: true })
  theme: string; // e.g., 'dark', 'light'

  @Field({ nullable: true })
  @Column({ nullable: true })
  language: string; // e.g., 'en', 'fr', etc.

  @Field({ nullable: true })
  @Column({ nullable: true })
  layout: string; // e.g., 'grid', 'list', etc.

  @Field({ nullable: true })
  @Column({ nullable: true })
  version: string; // e.g., '1.0.0'

  @Field({ nullable: true })
  @Column({ nullable: true })
  helpLinks: string; // Could be a URL or JSON string with links

  @Field()
  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @Field()
  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}