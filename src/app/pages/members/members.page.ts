import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NzAvatarModule } from 'ng-zorro-antd/avatar';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzProgressModule } from 'ng-zorro-antd/progress';
import { ProjectService } from 'src/app/services/project.service';
import { ShareEquityService } from 'src/app/services/share-equity.service';
import { TeamMemberModel } from 'src/app/shared/models/user/team-member.model';
import { ShareEquityItemModel } from 'src/app/shared/models/share-equity/share-equity-item.model';
import { TeamRole, TeamRoleLabels } from 'src/app/shared/enums/team-role.enum';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { InitialsOnlyPipe } from 'src/app/shared/pipes/initials-only.pipe';
import { format } from 'date-fns';
import { MatIconModule } from '@angular/material/icon';
import { NzButtonModule } from 'ng-zorro-antd/button';

@Component({
  selector: 'app-members',
  templateUrl: './members.page.html',
  styleUrls: ['./members.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    NzAvatarModule,
    NzInputModule,
    NzSelectModule,
    NzProgressModule,
    NzButtonModule,
    InitialsOnlyPipe,
    MatIconModule,
    RouterModule
  ]
})
export class MembersPage implements OnInit {
  members: TeamMemberModel[] = [];
  equities: ShareEquityItemModel[] = [];
  filteredMembers: (TeamMemberModel & { equity: number })[] = [];

  searchText: string = '';
  sortBy: 'name' | 'email' | 'role' | 'equity' = 'name';
  ascending: boolean = true;

  teamRoles = TeamRole;
  teamRoleLabels = TeamRoleLabels;
  projectId: string = '';

  constructor(
    private projectService: ProjectService,
    private shareEquityService: ShareEquityService,
    private route: ActivatedRoute
  ) {}

  ngOnInit() {
    this.route.parent?.paramMap.subscribe(params => {
      if (!params.get('id')) return;
      this.projectId = params.get('id')!;
      this.loadData();
    });
  }

  private loadData() {
    this.projectService.getMembers(this.projectId).subscribe(members => {
      this.members = members;
      this.loadEquities();
    });
  }

  private loadEquities() {
    const formattedDate = format(new Date(), 'yyyy-MM-dd');
    this.shareEquityService.getEquities(this.projectId, formattedDate).subscribe(equities => {
      this.equities = equities;
      this.combineData();
    });
  }

  private combineData() {
    this.filteredMembers = this.members.map(member => ({
      ...member,
      equity: this.equities.find(e => e.userId === member.id)?.percentage || 0
    }));
    this.applyFilters();
  }

  applyFilters() {
    let filtered = [...this.filteredMembers];

    if (this.searchText) {
      const search = this.searchText.toLowerCase();
      filtered = filtered.filter(member =>
        member.fullName.toLowerCase().includes(search) ||
        member.email.toLowerCase().includes(search)
      );
    }

    filtered.sort((a, b) => {
      let comparison = 0;
      switch (this.sortBy) {
        case 'name':
          comparison = a.fullName.localeCompare(b.fullName);
          break;
        case 'email':
          comparison = a.email.localeCompare(b.email);
          break;
        case 'role':
          comparison = a.roleInTeam - b.roleInTeam;
          break;
        case 'equity':
          comparison = a.equity - b.equity;
          break;
      }
      return this.ascending ? comparison : -comparison;
    });

    this.filteredMembers = filtered;
  }

  toggleSort(field: 'name' | 'email' | 'role' | 'equity') {
    if (this.sortBy === field) {
      this.ascending = !this.ascending;
    } else {
      this.sortBy = field;
      this.ascending = true;
    }
    this.applyFilters();
  }
}
