import { Component, OnDestroy, OnInit } from '@angular/core'
import { IonContent } from '@ionic/angular/standalone'
import { ProjectSideNavComponent } from 'src/app/layouts/project-side-nav/project-side-nav.component'
import { ViewModeConfigService } from 'src/app/core/config/view-mode-config.service'
import { ActivatedRoute, RouterOutlet } from '@angular/router'
import { Subject, takeUntil } from 'rxjs'

@Component({
  selector: 'app-project-details',
  templateUrl: './project-details.page.html',
  styleUrls: ['./project-details.page.scss'],
  standalone: true,
  imports: [IonContent, ProjectSideNavComponent, RouterOutlet],
})
export class ProjectDetailsPage implements OnInit, OnDestroy {
  isDesktopView: boolean = false
  private destroy$ = new Subject<void>()
  projectId = ''

  constructor(private viewMode: ViewModeConfigService, private route: ActivatedRoute) {}

  ngOnInit(): void {
    this.projectId = this.route.snapshot.paramMap.get('id')!
    this.viewMode.isDesktopView$.pipe(takeUntil(this.destroy$)).subscribe((val) => (this.isDesktopView = val))
  }

  ngOnDestroy() {
    this.destroy$.next()
    this.destroy$.complete()
  }
}
