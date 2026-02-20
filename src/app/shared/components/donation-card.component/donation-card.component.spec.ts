import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DonationCardComponent } from './donation-card.component';

describe('DonationCardComponent', () => {
  let component: DonationCardComponent;
  let fixture: ComponentFixture<DonationCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DonationCardComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DonationCardComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
