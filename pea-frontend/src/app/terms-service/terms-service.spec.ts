import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TermsService } from './terms-service';

describe('TermsService', () => {
  let component: TermsService;
  let fixture: ComponentFixture<TermsService>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TermsService]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TermsService);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
