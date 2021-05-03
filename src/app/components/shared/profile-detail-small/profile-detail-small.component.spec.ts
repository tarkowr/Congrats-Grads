import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ProfileDetailSmallComponent } from './profile-detail-small.component';

describe('ProfileDetailSmallComponent', () => {
  let component: ProfileDetailSmallComponent;
  let fixture: ComponentFixture<ProfileDetailSmallComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ProfileDetailSmallComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ProfileDetailSmallComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
