import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NoticiasList } from './noticias-list';

describe('NoticiasList', () => {
  let component: NoticiasList;
  let fixture: ComponentFixture<NoticiasList>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NoticiasList]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NoticiasList);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
