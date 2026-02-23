import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RealizarPeticionComponent } from './realizar-peticion.component';

describe('RealizarPeticionComponent', () => {
  let component: RealizarPeticionComponent;
  let fixture: ComponentFixture<RealizarPeticionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RealizarPeticionComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RealizarPeticionComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
