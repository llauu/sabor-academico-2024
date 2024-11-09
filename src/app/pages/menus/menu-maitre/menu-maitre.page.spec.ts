import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MenuMaitrePage } from './menu-maitre.page';

describe('MenuMaitrePage', () => {
  let component: MenuMaitrePage;
  let fixture: ComponentFixture<MenuMaitrePage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(MenuMaitrePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
