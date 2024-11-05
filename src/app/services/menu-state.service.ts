import { Injectable } from '@angular/core';
import { MatMenuTrigger } from '@angular/material/menu';

@Injectable({
  providedIn: 'root'
})
export class MenuStateService {
  private menuTrigger?: MatMenuTrigger;

  setMenuTrigger(trigger: MatMenuTrigger) {
    this.menuTrigger = trigger;
  }

  closeMenu() {
    this.menuTrigger?.closeMenu();
  }
}
