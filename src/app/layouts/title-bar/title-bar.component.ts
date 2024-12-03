import { Component, Input, OnDestroy, OnInit } from '@angular/core'
import { MatIconModule } from '@angular/material/icon'
import { Subject, takeUntil } from 'rxjs'
import { ViewModeConfigService } from 'src/app/core/config/view-mode-config.service'
import { ProfileDropdownComponent } from '../header/profile-dropdown/profile-dropdown.component'
import { NzButtonModule } from 'ng-zorro-antd/button'
import { CommonModule, Location } from '@angular/common'
import { ActivatedRoute } from '@angular/router'
import { MembersModalComponent } from 'src/app/components/members-modal/members-modal.component'
import { NzModalModule, NzModalService } from 'ng-zorro-antd/modal'

@Component({
  selector: 'app-title-bar',
  standalone: true,
  imports: [
    MatIconModule,
    ProfileDropdownComponent,
    NzButtonModule,
    CommonModule,
    NzModalModule
  ],
  templateUrl: './title-bar.component.html',
  styleUrls: ['./title-bar.component.scss'],
})
export class TitleBarComponent implements OnInit, OnDestroy {
  @Input({ required: true }) viewName: string = '';

  projectId: string | null = null;
  isDesktopView: boolean = false;
  private destroy$ = new Subject<void>();

  constructor(
    private viewMode: ViewModeConfigService,
    private location: Location,
    private route: ActivatedRoute,
    private modal: NzModalService
  ) {}

  ngOnInit() {
    this.viewMode.isDesktopView$.pipe(takeUntil(this.destroy$)).subscribe((val) => (this.isDesktopView = val))
    this.route.parent?.paramMap.subscribe(map => {
      if (!map.get('id')) {
        return;
      }
      this.projectId = map.get('id')!;
    });
  }

  ngOnDestroy() {
    this.destroy$.next()
    this.destroy$.complete()
  }

  navigateBack() {
    this.location.back();
  }

  openMembersModal() {
    this.modal.create({
      nzFooter: null,
      nzWidth: 600,
      nzContent: MembersModalComponent,
      nzClassName: 'members-modal',
      nzData: this.projectId
    });
  }
}
