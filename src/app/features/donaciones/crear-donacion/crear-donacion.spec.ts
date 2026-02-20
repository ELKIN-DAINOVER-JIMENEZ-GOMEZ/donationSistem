import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CrearDonacion } from './crear-donacion';

describe('CrearDonacion', () => {
  let component: CrearDonacion;
  let fixture: ComponentFixture<CrearDonacion>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CrearDonacion]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CrearDonacion);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
