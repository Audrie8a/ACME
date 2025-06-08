import { TestBed } from '@angular/core/testing';

import { AdminServiceTs } from './admin-service.ts';

describe('AdminServiceTs', () => {
  let service: AdminServiceTs;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AdminServiceTs);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
