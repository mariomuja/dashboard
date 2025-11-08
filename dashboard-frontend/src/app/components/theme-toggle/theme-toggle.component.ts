import { Component } from '@angular/core';
import { ThemeToggleComponent as SharedThemeToggleComponent } from '@mariomuja/angular-shared-components';

@Component({
  selector: 'app-theme-toggle',
  standalone: true,
  imports: [SharedThemeToggleComponent],
  template: `<shared-theme-toggle [toggleStyle]="'button'" [showLabel]="false"></shared-theme-toggle>`
})
export class ThemeToggleComponent {
  // Using shared theme toggle component with constructor-based injection
}

