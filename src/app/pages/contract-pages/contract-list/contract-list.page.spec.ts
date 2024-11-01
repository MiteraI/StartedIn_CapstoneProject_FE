import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ContractListPage } from './contract-list.page';

describe('ContractListPage', () => {
  let component: ContractListPage;
  let fixture: ComponentFixture<ContractListPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(ContractListPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
