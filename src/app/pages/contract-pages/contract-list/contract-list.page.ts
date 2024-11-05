import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { format, isToday, isYesterday } from 'date-fns';
import { addIcons } from 'ionicons';
import { addOutline, filterOutline, trashOutline } from 'ionicons/icons';
import { NzModalModule, NzModalService } from 'ng-zorro-antd/modal';
import { ProjectService } from 'src/app/services/project.service';
import { ContractService } from 'src/app/services/contract.service';
import { SearchResponseModel } from 'src/app/shared/models/search-response.model';
import { ContractListItemModel } from 'src/app/shared/models/contract/contract-list-item.model';
import { ActivatedRoute } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { ContractStatus, ContractStatusLabels } from 'src/app/shared/enums/contract-status.enum';
import { ContractType, ContractTypeLabels } from 'src/app/shared/enums/contract-type.enum';
import { NzAvatarModule } from 'ng-zorro-antd/avatar';
import { InitialsOnlyPipe } from 'src/app/shared/pipes/initials-only.pipe';
import { ContractFilterModalComponent } from 'src/app/components/contract-pages/contract-filter-modal/contract-filter-modal.component';
import { NewContractModalComponent } from 'src/app/components/contract-pages/new-contract-modal/new-contract-modal.component';

interface FilterOptions {
  contractName?: string;
  contractType?: ContractType;
  parties?: string[];
  lastUpdatedStartDate?: Date;
  lastUpdatedEndDate?: Date;
  contractStatus?: ContractStatus;
}

@Component({
  selector: 'app-contract-list',
  templateUrl: './contract-list.page.html',
  styleUrls: ['./contract-list.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, NzAvatarModule, NzModalModule, InitialsOnlyPipe]
})
export class ContractListPage implements OnInit {
  searchResult: SearchResponseModel<ContractListItemModel> = {responseList: [], pageIndex: 1, pageSize: 10, totalPage: 0, totalRecord: 0};

  contracts: ContractListItemModel[] = [];
  selectedContracts: ContractListItemModel[] = [];
  keys: string[] = [];
  contractGroups: ContractListItemModel[][] = [];

  filter: FilterOptions = {};
  pageIndex: number = 1;
  pageSize: number = 10;

  contractTypes = ContractType;
  contractStatuses = ContractStatus;
  typeLabels = ContractTypeLabels;
  statusLabels = ContractStatusLabels;

  constructor(
    private route: ActivatedRoute,
    private modalService: NzModalService,
    private contractService: ContractService
  ) {
    addIcons({
      addOutline,
      filterOutline,
      trashOutline
    });
  }

  ngOnInit() {
    this.filterContracts();
  }

  filterContracts() {
    const sd = this.filter.lastUpdatedStartDate;
    const ed = this.filter.lastUpdatedEndDate;
    this.contractService
      .getContractListForProject(
        this.route.parent?.snapshot.paramMap.get('id')!,
        this.pageIndex,
        this.pageSize,
        this.filter.contractName,
        this.filter.contractType,
        this.filter.parties,
        sd ? `${sd.getFullYear()}-${sd.getMonth() + 1}-${sd.getDate()}` : undefined,
        ed ? `${ed.getFullYear()}-${ed.getMonth() + 1}-${ed.getDate()}` : undefined,
        this.filter.contractStatus
      )
      .pipe(
        catchError(error => {
          //TODO noti stuff
          return throwError(() => new Error(error.error));
        })
      )
      .subscribe(result => {
        this.searchResult = result;
        this.contracts = result.responseList;
        this.groupContracts();
      });
  }

  groupContracts() {
    var groupCount = 0;
    this.contractGroups = [];
    this.keys = [];
    this.contracts.forEach((contract) => {
      const date = format(new Date(contract.lastUpdatedTime), 'yyyy-MM-dd');
      if (!this.keys.includes(date)) {
        this.keys.push(date);
        this.contractGroups.push([contract]);
        groupCount++;
      } else {
        this.contractGroups[this.keys.indexOf(date)].push(contract);
      }
    })
  }

  formatGroupHeader(dateStr: string): string {
    const date = new Date(dateStr);
    if (isToday(date)) return 'Today';
    if (isYesterday(date)) return 'Yesterday';
    return format(date, 'yyyy/MM/dd');
  }

  formatDate(dateStr: string): string {
    return format(new Date(dateStr), 'HH:mm dd/MM/yyyy');
  }

  isSelected(contract: ContractListItemModel): boolean {
    return this.selectedContracts.some(c => c.id === contract.id);
  }

  toggleSelection(contract: ContractListItemModel) {
    const index = this.selectedContracts.findIndex(c => c.id === contract.id);
    if (index === -1) {
      this.selectedContracts.push(contract);
    } else {
      this.selectedContracts.splice(index, 1);
    }
  }

  isAllSelected(): boolean {
    return this.contracts.length > 0 &&
           this.contracts.every(contract => this.isSelected(contract));
  }

  toggleAllSelection() {
    if (this.isAllSelected()) {
      this.selectedContracts = [];
    } else {
      this.selectedContracts = [...this.contracts];
    }
  }

  deleteSelected() {
    // Implement delete functionality
    this.contracts = this.contracts.filter(
      contract => !this.selectedContracts.some(c => c.id === contract.id)
    );
    this.selectedContracts = [];
    this.groupContracts();
  }

  deleteContract(contract: ContractListItemModel) {
    // Delete single contract (mobile view)
    this.contracts = this.contracts.filter(c => c.id !== contract.id);
    this.groupContracts();
  }

  openAddModal() {
    // Implement modal opening logic
    const modalRef = this.modalService.create({
      nzTitle: 'New Contract',
      nzContent: NewContractModalComponent,
      nzFooter: null
    });
  }

  openFilterModal() {
    // Implement modal opening logic
    const modalRef = this.modalService.create({
      nzTitle: 'Filter Contracts',
      nzContent: ContractFilterModalComponent,
      nzData: {
        ...this.filter,
        id: this.route.parent?.snapshot.paramMap.get('id')!
      },
      nzFooter: null,
    });
    modalRef.afterClose.subscribe((result) => {
      if (result) {
        this.filter = {...result};
        this.filterContracts();
        console.log('Filter results:', result);
      }
    });
  }
}
