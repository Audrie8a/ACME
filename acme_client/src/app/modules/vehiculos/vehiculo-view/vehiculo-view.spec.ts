import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VehiculoView } from './vehiculo-view';

describe('VehiculoView', () => {
  let component: VehiculoView;
  let fixture: ComponentFixture<VehiculoView>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [VehiculoView]
    })
    .compileComponents();

    fixture = TestBed.createComponent(VehiculoView);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
