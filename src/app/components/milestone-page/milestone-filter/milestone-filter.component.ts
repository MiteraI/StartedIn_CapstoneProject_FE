import { CommonModule } from '@angular/common'
import { HttpErrorResponse } from '@angular/common/http'
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core'
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms'
import { NzAvatarModule } from 'ng-zorro-antd/avatar'
import { NzButtonModule } from 'ng-zorro-antd/button'
import { NzCheckboxModule } from 'ng-zorro-antd/checkbox'
import { NzFormModule } from 'ng-zorro-antd/form'
import { NzInputModule } from 'ng-zorro-antd/input'
import { NzNotificationService } from 'ng-zorro-antd/notification'
import { NzSelectModule } from 'ng-zorro-antd/select'
import { catchError, throwError } from 'rxjs'
import { MenuStateService } from 'src/app/core/util/menu-state.service'
import { PhaseService } from 'src/app/services/phase.service'
import { Phase } from 'src/app/shared/models/phase/phase.model'
import { InitialsOnlyPipe } from 'src/app/shared/pipes/initials-only.pipe'

@Component({
  selector: 'app-milestone-filter',
  templateUrl: './milestone-filter.component.html',
  styleUrls: ['./milestone-filter.component.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, NzFormModule, NzInputModule, NzSelectModule, NzButtonModule, NzAvatarModule, NzCheckboxModule, InitialsOnlyPipe],
})
export class MilestoneFilterComponent implements OnInit {
  @Input() data: any
  @Output() filterApplied = new EventEmitter<any>()

  filterForm!: FormGroup

  phases: Phase[] = []
  isPhaseLoading = false

  constructor(private phaseService: PhaseService, private fb: FormBuilder, private menuState: MenuStateService, private notification: NzNotificationService) {}

  ngOnInit() {
    this.loadPhases()

    this.filterForm = this.fb.group({
      title: [this.data.title || ''],
      phaseId: [this.data.phaseId || null],
    })
  }

  private loadPhases() {
    if (this.isPhaseLoading) return

    this.isPhaseLoading = true
    this.phaseService.getPhases(this.data.projectId).subscribe({
      error: (err: HttpErrorResponse) => {
        if (err.status === 400 && err.error === 'Không tìm thấy tuyên ngôn dự án.') {
        } else {
          this.notification.error('Lỗi', err.error, { nzDuration: 2000 })
        }
      },
      next: (result) => {
        this.phases = result
        this.isPhaseLoading = false
      },
    })
  }

  onPhaseScroll() {
    if (this.isPhaseLoading) return
    this.loadPhases()
  }

  nzFilterOption = () => true

  resetFilters() {
    this.filterForm.reset({
      title: '',
      phaseId: null,
    })
    this.filterApplied.emit(this.filterForm.value)
    this.menuState.closeMenu()
  }

  applyFilters() {
    this.filterApplied.emit(this.filterForm.value)
    this.menuState.closeMenu()
  }

  updateForm(filterData: any) {
    if (this.filterForm) {
      this.filterForm.patchValue({
        title: filterData.title || '',
        phaseId: filterData.phaseId || null,
      })
    }
  }
}
