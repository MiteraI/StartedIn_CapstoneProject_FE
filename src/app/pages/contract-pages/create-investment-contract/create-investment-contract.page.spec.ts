import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CreateInvestmentContractPage } from './create-investment-contract.page';

describe('CreateInvestmentContractPage', () => {
  let component: CreateInvestmentContractPage;
  let fixture: ComponentFixture<CreateInvestmentContractPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(CreateInvestmentContractPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
