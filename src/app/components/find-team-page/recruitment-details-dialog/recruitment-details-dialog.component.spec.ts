import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { RecruitmentDetailsDialogComponent } from './recruitment-details-dialog.component';

describe('RecruitmentDetailsDialogComponent', () => {
  let component: RecruitmentDetailsDialogComponent;
  let fixture: ComponentFixture<RecruitmentDetailsDialogComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ RecruitmentDetailsDialogComponent ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(RecruitmentDetailsDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
