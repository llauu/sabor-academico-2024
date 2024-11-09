import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MenuMozoPage } from './menu-mozo.page';

describe('MenuMozoPage', () => {
  let component: MenuMozoPage;
  let fixture: ComponentFixture<MenuMozoPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(MenuMozoPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
