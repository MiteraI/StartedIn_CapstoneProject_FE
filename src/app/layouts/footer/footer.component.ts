import { Component, Input, OnDestroy, OnInit } from '@angular/core'
import { ActivatedRoute, NavigationEnd, Router, RouterModule } from '@angular/router'
import { filter, Subject, takeUntil } from 'rxjs'

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [RouterModule],
  templateUrl: './footer.component.html',
  styleUrl: './footer.component.css',
})
export class FooterComponent implements OnInit, OnDestroy {
  @Input({ required: true }) isDesktopView: boolean = false
  @Input({ required: true }) inProjectDetails: boolean = false

  currentId = 0
  private destroy$ = new Subject<void>()

  constructor(private activatedRoute: ActivatedRoute, private router: Router) {}

  ngOnInit() {
    this.router.events
      .pipe(
        filter((event) => event instanceof NavigationEnd),
        takeUntil(this.destroy$)
      )
      .subscribe(() => {
        const parentRoute = this.activatedRoute.snapshot.firstChild
        if (parentRoute && parentRoute.params) {
          this.currentId = +parentRoute.params['id']
        }
      })
  }

  ngOnDestroy() {
    this.destroy$.next()
    this.destroy$.complete()
  }
}
