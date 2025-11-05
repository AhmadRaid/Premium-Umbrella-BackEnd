import { 
  Controller, 
  Get, 
  Post, 
  Put, 
  Delete, 
  Body, 
  Param, 
  Query, 
  ParseIntPipe, 
  DefaultValuePipe,
  UseGuards,
  Request,
  Req
} from '@nestjs/common';
import { TasksService } from './tasks.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { TaskStatus } from 'src/schemas/task.schema';
import { userRoles } from 'src/common/enum/userRoles.enum';
import { JwtAuthGuard } from 'src/common/guards/jwtAuthGuard';

@Controller('tasks')
@UseGuards(JwtAuthGuard)
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  @Post()
 // @Role(userRoles.ADMIN)
  async create(@Body() createTaskDto: CreateTaskDto) {
    return this.tasksService.create(createTaskDto);
  }

  @Get()
  async findAll(
    @Req() req: any,
    @Query('status') status?: TaskStatus,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page?: number,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit?: number,
  ) {
    const userBranch = req.user.branch;
    return this.tasksService.findForSpecificBranch(userBranch, status, page, limit);
  }

  @Get(':taskId')
  async findOne(@Param('taskId') taskId: string) {
    return this.tasksService.findOne(taskId);
  }

  @Put(':taskId')
 // @Role(userRoles.ADMIN)
  async updateTask(
    @Param('taskId') taskId: string, 
    @Body() updateTaskDto: UpdateTaskDto,
    @Request() req
  ) {
    return this.tasksService.updateTask(taskId, updateTaskDto, req.user.userId);
  }

  @Delete(':taskId')
  //@Role(userRoles.ADMIN)
  async removeTask(@Param('taskId') taskId: string) {
    return this.tasksService.removeTask(taskId);
  }

  @Get('stats/branch/:branchId')
  async getBranchTasksStats(@Param('branchId') branchId: string) {
    return this.tasksService.getBranchTasksStats(branchId);
  }
}