import { CommonModule } from '@angular/common';
import { Component, Input, OnInit } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ProjectSideNavItemComponent } from './project-side-nav-item/project-side-nav-item.component';
import { MatDialog } from '@angular/material/dialog';

@Component({
  selector: 'project-side-nav',
  standalone: true,
  imports: [
    MatSidenavModule,
    CommonModule,
    MatIconModule,
    ProjectSideNavItemComponent,
  ],
  templateUrl: './project-side-nav.component.html',
  styleUrl: './project-side-nav.component.css',
})
export class ProjectSideNavComponent implements OnInit {
  @Input() opened = true;
  @Input() teamId: string | null = '';
  toggle() {
    this.opened = !this.opened;
  }

  isTeamMemberOpened: boolean = true;

  constructor(private dialog: MatDialog, private snackBar: MatSnackBar) {}

  ngOnInit(): void {}

  toggleTeamMemberOpened() {
    this.isTeamMemberOpened = !this.isTeamMemberOpened;
  }
}
