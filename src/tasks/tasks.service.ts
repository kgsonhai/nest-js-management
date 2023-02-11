import { Injectable, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/auth/users.entity';
import { Repository } from 'typeorm';
import { CreateTaskDto } from './dto/create-task.dto';
import { GetTaskFilterDto } from './dto/get-task.dto';
import { Task } from './task.entity';
import { TaskStatus } from './tasks-status.enum';

@Injectable()
export class TasksService {
  constructor(
    @InjectRepository(Task)
    private tasksReponsitory: Repository<Task>,
  ) {}

  async getTaskById(id: string, user: User): Promise<Task> {
    const found = await this.tasksReponsitory.findOne({
      where: { id, user },
    });
    if (!found) {
      throw new NotFoundException('not URL nhe');
    }
    return found;
  }

  async getTasks(filterDto: GetTaskFilterDto, user: User): Promise<Task[]> {
    const { status, search } = filterDto;
    const query = this.tasksReponsitory.createQueryBuilder('task');
    query.where({ user });
    if (status) {
      query.andWhere('task.status = :status', { status });
    }
    if (search) {
      query.andWhere(
        '(LOWER(task.title) LIKE LOWER(:search) OR LOWER(task.description) LIKE LOWER(:search)) ',
        { search: `%${search}%` },
      );
    }
    const tasks = await query.getMany();

    return tasks;
  }

  async createTask(createTaskDto: CreateTaskDto, user: User): Promise<Task> {
    const { title, description } = createTaskDto;
    const task = this.tasksReponsitory.create({
      title,
      description,
      status: TaskStatus.OPEN,
      user,
    });

    await this.tasksReponsitory.save(task);
    return task;
  }

  async updateTask(id: string, status: TaskStatus, user: User): Promise<Task> {
    const task = await this.getTaskById(id, user);

    task.status = status;
    await this.tasksReponsitory.save(task);
    return task;
  }

  async deleteTask(id: string, user: User): Promise<void> {
    const taskDelete = await this.tasksReponsitory.delete({ id, user });

    if (taskDelete.affected === 0) {
      throw new NotFoundException(`Task with ID ${id} not found`);
    }
  }
}
