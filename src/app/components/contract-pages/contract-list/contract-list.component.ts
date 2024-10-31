// contract-list.component.ts
import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { IonicModule, ModalController } from '@ionic/angular';
import { format, isToday, isYesterday } from 'date-fns';
import { addIcons } from 'ionicons';
import { addOutline, filterOutline } from 'ionicons/icons';

interface Contract {
  id: string;
  name: string;
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

  constructor(private modalController: ModalController) {
    addIcons({ addOutline, filterOutline });
  }

  ngOnInit() {
    // Sample data - replace with actual data service
    this.contracts = [
      {
        id: '1',
        name: 'Contract for stock purchase',
        parties: ['Minh Pham'],
        lastUpdated: new Date("2024-10-31"),
        status: 'completed'
      },
      {
        id: '2',
        name: 'Contract for stock purchase',
        parties: ['Minh Pham'],
        lastUpdated: new Date("2024-10-30"),
        status: 'completed'
      },
      {
        id: '3',
        name: 'Contract for stock purchase',
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
    // this.groupedContracts = this.contracts.reduce((groups: { [key: string]: Contract[] }, contract) => {
    //   const date = format(contract.lastUpdated, 'yyyy-MM-dd');
    //   if (!groups[date]) {
    //     groups[date] = [];
    //   }
    //   groups[date].push(contract);
    //   return groups;
    // }, {});
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
  }

  isAllSelected(contracts: Contract[]): boolean {
    return contracts.every(contract => this.isSelected(contract));
  }

  toggleGroupSelection(contracts: Contract[]) {
    const allSelected = this.isAllSelected(contracts);
    if (allSelected) {
      this.selectedContracts = this.selectedContracts.filter(
        selected => !contracts.some(c => c.id === selected.id)
      );
    } else {
      contracts.forEach(contract => {
        if (!this.isSelected(contract)) {
          this.selectedContracts.push(contract);
        }
      });
    }
  }

  async deleteSelected() {
    // Implement delete functionality
    this.contracts = this.contracts.filter(
      contract => !this.selectedContracts.some(c => c.id === contract.id)
    );
    this.selectedContracts = [];
    this.groupContracts();
  }

  async openAddModal() {
    // Implement modal opening logic
  }

  async openFilterModal() {
    // Implement modal opening logic
  }
}
