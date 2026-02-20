import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MisDoancionesComponent } from './mis-donaciones.component';

describe('MisDoancionesComponent', () => {
  let component: MisDoancionesComponent;
  let fixture: ComponentFixture<MisDoancionesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MisDoancionesComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MisDoancionesComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
