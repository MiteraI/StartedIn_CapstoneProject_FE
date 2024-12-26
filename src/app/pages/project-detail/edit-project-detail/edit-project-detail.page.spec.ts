import { ComponentFixture, TestBed } from '@angular/core/testing';
import { EditProjectDetailPage } from './edit-project-detail.page';

describe('EditProjectDetailPage', () => {
  let component: EditProjectDetailPage;
  let fixture: ComponentFixture<EditProjectDetailPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(EditProjectDetailPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
