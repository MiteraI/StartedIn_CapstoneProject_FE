import { afterNextRender, Component, OnInit, AfterViewInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TerminationRequestListComponent } from 'src/app/components/contract-pages/termination-request-list/termination-request-list.component';
import { TerminationConfirmationListComponent } from 'src/app/components/contract-pages/termination-confirmation-list/termination-confirmation-list.component';
import { ActivatedRoute } from '@angular/router';
import { Subject } from 'rxjs';

@Component({
  selector: 'app-termination-requests',
  templateUrl: './termination-requests.page.html',
  styleUrls: ['./termination-requests.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    TerminationRequestListComponent,
    TerminationConfirmationListComponent,
  ]
})
export class TerminationRequestsPage implements OnInit, AfterViewInit, OnDestroy {
  projectId!: string;
  height: number = 400;

  private destroy$ = new Subject<void>();

  constructor(
    private route: ActivatedRoute
  ) {
    afterNextRender(() => this.calculateDistance());
  }

  ngAfterViewInit() {
    this.calculateDistance();
    window.addEventListener('resize', this.calculateDistance.bind(this));
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
    window.removeEventListener('resize', this.calculateDistance.bind(this));
  }

  ngOnInit() {
    this.route.parent?.paramMap.subscribe(map => this.projectId = map.get('id')!);
  }

  calculateDistance() {
    const titleBar = document.querySelector('app-project-title-bar');
    const footer = document.querySelector('app-footer');

    if (titleBar && footer) {
      const titleBarRect = titleBar.getBoundingClientRect();
      const footerRect = footer.getBoundingClientRect();

      this.height = footerRect.top - titleBarRect.bottom - 80;
    }
  }
}
