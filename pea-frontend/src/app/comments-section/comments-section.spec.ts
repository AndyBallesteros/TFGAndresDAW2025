import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CommentsSection } from './comments-section';

describe('CommentsSection', () => {
  let component: CommentsSection;
  let fixture: ComponentFixture<CommentsSection>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CommentsSection]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CommentsSection);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
