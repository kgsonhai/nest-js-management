import { IsEnum } from 'class-validator';
import { TaskStatus } from '../tasks-status.enum';

export class UpdateTaskDto {
  @IsEnum(TaskStatus)
  status: TaskStatus;
}
