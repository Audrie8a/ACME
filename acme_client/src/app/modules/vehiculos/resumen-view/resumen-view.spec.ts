import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ResumenView } from './resumen-view';

describe('ResumenView', () => {
  let component: ResumenView;
  let fixture: ComponentFixture<ResumenView>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ResumenView]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ResumenView);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
