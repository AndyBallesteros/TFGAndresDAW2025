import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SubmitArticle } from './submit-article';

describe('SubmitArticle', () => {
  let component: SubmitArticle;
  let fixture: ComponentFixture<SubmitArticle>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SubmitArticle]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SubmitArticle);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
