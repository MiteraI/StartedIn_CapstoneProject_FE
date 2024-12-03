import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CloseProjectModalComponent } from 'src/app/components/project-pages/close-project-modal/close-project-modal.component';
import { ActivatedRoute } from '@angular/router';
import { NzModalModule, NzModalService } from 'ng-zorro-antd/modal';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { TitleBarComponent } from "../../../layouts/title-bar/title-bar.component";

@Component({
  selector: 'app-project-settings',
  templateUrl: './project-settings.page.html',
  styleUrls: ['./project-settings.page.scss'],
  standalone: true,
  imports: [CommonModule, NzModalModule, NzButtonModule, TitleBarComponent]
})
export class ProjectSettingsPage implements OnInit {
  projectId!: string

  constructor(
    private route: ActivatedRoute,
    private modalService: NzModalService
  ) { }

  ngOnInit() {
    this.projectId = this.route.parent?.snapshot.params['id']
  }

  openCloseProjectModal() {
    this.modalService.create({
      nzTitle: 'Đóng dự án',
      nzContent: CloseProjectModalComponent,
      nzData: this.projectId,
      nzFooter: null
    });
  }
}
