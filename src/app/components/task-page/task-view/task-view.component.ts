import { Component, OnDestroy, OnInit } from '@angular/core'
import { Router } from '@angular/router'
import { Subject, takeUntil } from 'rxjs'
import { ViewModeConfigService } from 'src/app/core/config/view-mode-config.service'
import { FilterBarComponent } from 'src/app/layouts/filter-bar/filter-bar.component'
import { TaskTableComponent } from '../task-table/task-table.component'
import { TaskListComponent } from '../task-list/task-list.component'
import { NzButtonModule } from 'ng-zorro-antd/button'
import { MatIconModule } from '@angular/material/icon'

@Component({
  selector: 'app-task-view',
  templateUrl: './task-view.component.html',
  imports: [FilterBarComponent, TaskTableComponent, TaskListComponent, NzButtonModule, MatIconModule],
  styleUrls: ['./task-view.component.scss'],
  standalone: true,
})
export class TaskViewComponent implements OnInit, OnDestroy {
  isDesktopView: boolean = false
  private destroy$ = new Subject<void>()

  constructor(private viewMode: ViewModeConfigService) {
    viewMode.isDesktopView$.pipe(takeUntil(this.destroy$)).subscribe((val) => (this.isDesktopView = val))
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
