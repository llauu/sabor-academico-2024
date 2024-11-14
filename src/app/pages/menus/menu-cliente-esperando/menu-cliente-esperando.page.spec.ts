import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MenuClienteEsperandoPage } from './menu-cliente-esperando.page';

describe('MenuClienteEsperandoPage', () => {
  let component: MenuClienteEsperandoPage;
  let fixture: ComponentFixture<MenuClienteEsperandoPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(MenuClienteEsperandoPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
