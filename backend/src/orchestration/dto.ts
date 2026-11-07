import { IsString, IsNotEmpty, IsBoolean } from 'class-validator';

export class ChatQueryDto {
  @IsString()
  @IsNotEmpty()
  query: string;
}

export class ApprovalDecisionDto {
  @IsBoolean()
  approved: boolean;
}
