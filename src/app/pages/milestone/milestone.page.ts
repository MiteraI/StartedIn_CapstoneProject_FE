import { Component, OnInit } from '@angular/core'
import { CommonModule } from '@angular/common'
import { FormsModule } from '@angular/forms'
import { ViewModeConfigService } from 'src/app/core/config/view-mode-config.service'
import { NzModalModule, NzModalService } from 'ng-zorro-antd/modal'
import { ActivatedRoute } from '@angular/router'
import { FilterBarComponent } from '../../layouts/filter-bar/filter-bar.component'
import { Subject, takeUntil } from 'rxjs'
import { ProjectMilestoneModel } from 'src/app/shared/models/milestone/milestone.model'
import { MilestoneTableComponent } from '../../components/milestone/milestone-table/milestone-table.component'
import { MilestoneMobileViewComponent } from '../../components/milestone/milestone-mobile-view/milestone-mobile-view.component'
import { MatIconModule } from '@angular/material/icon'
import { NzButtonModule } from 'ng-zorro-antd/button'
import { MilestoneCreateModalComponent } from 'src/app/components/milestone/milestone-create-modal/milestone-create-modal.component'

@Component({
  selector: 'app-milestone',
  templateUrl: './milestone.page.html',
  styleUrls: ['./milestone.page.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, FilterBarComponent, NzModalModule, MilestoneTableComponent, MilestoneMobileViewComponent, MatIconModule, NzButtonModule]
})
export class MilestonePage implements OnInit {
  private destroy$ = new Subject<void>()
  isDesktopView: boolean = false
  projectId = ''
  milestones: ProjectMilestoneModel[] = []

  constructor(private viewMode: ViewModeConfigService, private modalService: NzModalService, private activatedRoute: ActivatedRoute) {
    viewMode.isDesktopView$.pipe(takeUntil(this.destroy$)).subscribe((val) => (this.isDesktopView = val))
    this.activatedRoute.parent?.paramMap.subscribe((value) => {
      this.projectId = value.get('id')!
    })
  }

  ngOnInit() {
    this.milestones = this.activatedRoute.snapshot.data['milestones']
  }

  printSearchString = (searchString: string) => {
    console.log(searchString)
  }

  openCreateTaskModal() {
    const modalRef = this.modalService.create({
      nzTitle: 'Cột Mốc mới',
      nzContent: MilestoneCreateModalComponent,
      nzData: {
        projectId: this.projectId,
      },
      nzFooter: null,
    })
  }
}
