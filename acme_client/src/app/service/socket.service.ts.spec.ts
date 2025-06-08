import { TestBed } from '@angular/core/testing';

import { SocketServiceTs } from './socket.service.ts';

describe('SocketServiceTs', () => {
  let service: SocketServiceTs;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SocketServiceTs);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
