import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MenuEmpleadoPage } from './menu-empleado.page';

describe('MenuEmpleadoPage', () => {
  let component: MenuEmpleadoPage;
  let fixture: ComponentFixture<MenuEmpleadoPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(MenuEmpleadoPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
