import { Component, OnDestroy, OnInit } from '@angular/core'
import { ActivatedRoute, Router } from '@angular/router'
import { Subject, takeUntil } from 'rxjs'
import { ViewModeConfigService } from 'src/app/core/config/view-mode-config.service'
import { FilterBarComponent } from 'src/app/layouts/filter-bar/filter-bar.component'
import { TaskTableComponent } from '../task-table/task-table.component'
import { TaskListComponent } from '../task-list/task-list.component'
import { NzButtonModule } from 'ng-zorro-antd/button'
import { MatIconModule } from '@angular/material/icon'
import { NzModalModule, NzModalService } from 'ng-zorro-antd/modal'
import { CreateTaskModalComponent } from '../create-task-modal/create-task-modal.component'
import { TaskService } from 'src/app/services/task.service'
import { Task } from 'src/app/shared/models/task/task.model'

@Component({
  selector: 'app-task-view',
  templateUrl: './task-view.component.html',
  imports: [FilterBarComponent, TaskTableComponent, TaskListComponent, NzButtonModule, MatIconModule, NzModalModule],
  styleUrls: ['./task-view.component.scss'],
  standalone: true,
})
export class TaskViewComponent implements OnInit, OnDestroy {
  isDesktopView: boolean = false
  private destroy$ = new Subject<void>()
  projectId = ''
  taskList: Task[] = []
  constructor(private viewMode: ViewModeConfigService, private modalService: NzModalService, private activatedRoute: ActivatedRoute, private taskService: TaskService) {
    viewMode.isDesktopView$.pipe(takeUntil(this.destroy$)).subscribe((val) => (this.isDesktopView = val))
    this.activatedRoute.parent?.paramMap.subscribe((value) => {
      this.projectId = value.get('id')!
    })
    taskService
      .getTaskListForProject(this.projectId)
      .pipe(takeUntil(this.destroy$))
      .subscribe((val) => {
        this.taskList = val.data
      })
  }

  openCreateTaskModal() {
    const modalRef = this.modalService.create({
      nzTitle: 'Tác Vụ Mới',
      nzContent: CreateTaskModalComponent,
      nzData: {
        projectId: this.projectId,
      },
      nzFooter: null,
    })
  }

  ngOnInit() {}

  ngOnDestroy() {
    this.destroy$.next()
    this.destroy$.complete()
  }

  printSearchString = (searchString: string) => {
    console.log(searchString)
  }
}
