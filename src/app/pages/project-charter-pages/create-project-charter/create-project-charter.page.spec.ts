import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CreateProjectCharterPage } from './create-project-charter.page';

describe('CreateProjectCharterPage', () => {
  let component: CreateProjectCharterPage;
  let fixture: ComponentFixture<CreateProjectCharterPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(CreateProjectCharterPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
