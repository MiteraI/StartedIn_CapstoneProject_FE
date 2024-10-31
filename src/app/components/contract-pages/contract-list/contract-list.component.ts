import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { format, isToday, isYesterday } from 'date-fns';
import { addIcons } from 'ionicons';
import { addOutline, filterOutline, trashOutline } from 'ionicons/icons';
import { ContractFilterModalComponent } from '../contract-filter-modal/contract-filter-modal.component';
import { NzModalService } from 'ng-zorro-antd/modal';

interface Contract {
  id: string;
  name: string;
  type: string;
  parties: string[];
  lastUpdated: Date;
  status: 'completed' | 'pending';
}

@Component({
  selector: 'app-contract-list-component',
  templateUrl: './contract-list.component.html',
  styleUrls: ['./contract-list.component.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule]
})
export class ContractListComponent implements OnInit {
  contracts: Contract[] = [];
  selectedContracts: Contract[] = [];
  keys: string[] = [];
  contractGroups: Contract[][] = [];

  constructor(private modalService: NzModalService) {
    addIcons({
      addOutline,
      filterOutline,
      trashOutline
    });
  }

  ngOnInit() {
    // Sample data - replace with actual data service
    this.contracts = [
      {
        id: '1',
        name: 'Contract for stock purchase',
        type: 'Internal',
        parties: ['Minh Pham', 'Kiet Huynh Anh'],
        lastUpdated: new Date("2024-10-31"),
        status: 'completed'
      },
      {
        id: '2',
        name: 'Contract for stock purchase',
        type: 'Internal',
        parties: ['Minh Pham'],
        lastUpdated: new Date("2024-10-30"),
        status: 'completed'
      },
      {
        id: '3',
        name: 'Contract for stock purchase',
        type: 'Internal',
        parties: ['Minh Pham'],
        lastUpdated: new Date("2024-10-29"),
        status: 'completed'
      },
      // Add more sample contracts...
    ];

    this.groupContracts();
  }

  groupContracts() {
    var groupCount = 0;
    this.contractGroups = [];
    this.keys = [];
    this.contracts.forEach((contract) => {
      const date = format(contract.lastUpdated, 'yyyy-MM-dd');
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

  formatDate(date: Date): string {
    return format(date, 'HH:mm dd/MM/yyyy');
  }

  isSelected(contract: Contract): boolean {
    return this.selectedContracts.some(c => c.id === contract.id);
  }

  toggleSelection(contract: Contract) {
    const index = this.selectedContracts.findIndex(c => c.id === contract.id);
    if (index === -1) {
      this.selectedContracts.push(contract);
    } else {
      this.selectedContracts.splice(index, 1);
    }
    console.log(this.selectedContracts);

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

  deleteContract(contract: Contract) {
    // Delete single contract (mobile view)
    this.contracts = this.contracts.filter(c => c.id !== contract.id);
    this.groupContracts();
  }

  openAddModal() {
    // Implement modal opening logic
  }

  openFilterModal() {
    // Implement modal opening logic
    this.modalService.create({
      nzTitle: 'Filter Contracts',
      nzContent: ContractFilterModalComponent,
      nzFooter: null,
      nzWidth: 520
    });
  }
}
