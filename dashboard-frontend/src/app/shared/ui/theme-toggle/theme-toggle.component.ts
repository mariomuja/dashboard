import { Component, OnInit, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ThemeService, Theme } from '../../services/theme.service';

export type ThemeToggleStyle = 'button' | 'switch' | 'select';

/**
 * Shared theme toggle component for switching between light/dark modes
 * 
 * Features:
 * - Multiple display styles (button, switch, select)
 * - Customizable labels and icons
 * - Auto mode support (follows system preference)
 * 
 * Usage:
 * ```html
 * <shared-theme-toggle 
 *   [style]="'button'" 
 *   [showLabel]="true"
 *   [showAutoOption]="true">
 * </shared-theme-toggle>
 * ```
 */
@Component({
  selector: 'shared-theme-toggle',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="theme-toggle" [ngClass]="'theme-toggle-' + toggleStyle">
      <!-- Button Style -->
      <button 
        *ngIf="toggleStyle === 'button'"
        (click)="toggleTheme()"
        [title]="getThemeLabel()"
        class="theme-toggle-button">
        <span class="theme-icon">{{ getThemeIcon() }}</span>
        <span *ngIf="showLabel" class="theme-label">{{ getThemeLabel() }}</span>
      </button>

      <!-- Switch Style -->
      <label *ngIf="toggleStyle === 'switch'" class="theme-switch">
        <input 
          type="checkbox" 
          [checked]="currentTheme === 'dark'"
          (change)="toggleTheme()">
        <span class="slider"></span>
        <span *ngIf="showLabel" class="theme-label">{{ getThemeLabel() }}</span>
      </label>

      <!-- Select Style -->
      <select 
        *ngIf="toggleStyle === 'select'"
        [(ngModel)]="currentTheme"
        (ngModelChange)="onThemeChange($event)"
        class="theme-select">
        <option value="light">☀️ Light</option>
        <option value="dark">🌙 Dark</option>
        <option *ngIf="showAutoOption" value="auto">💻 Auto</option>
      </select>
    </div>
  `,
  styles: [`
    .theme-toggle {
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
    }

    /* Button Style */
    .theme-toggle-button {
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.5rem 1rem;
      background: transparent;
      border: 1px solid currentColor;
      border-radius: 0.5rem;
      cursor: pointer;
      transition: all 0.2s;
      color: inherit;
      font-size: 0.875rem;
    }

    .theme-toggle-button:hover {
      background: rgba(0, 0, 0, 0.05);
    }

    .theme-icon {
      font-size: 1.25rem;
      line-height: 1;
    }

    /* Switch Style */
    .theme-switch {
      position: relative;
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      cursor: pointer;
    }

    .theme-switch input {
      opacity: 0;
      width: 0;
      height: 0;
    }

    .slider {
      position: relative;
      display: inline-block;
      width: 3rem;
      height: 1.5rem;
      background-color: #ccc;
      border-radius: 1.5rem;
      transition: 0.3s;
    }

    .slider:before {
      position: absolute;
      content: "";
      height: 1.125rem;
      width: 1.125rem;
      left: 0.1875rem;
      bottom: 0.1875rem;
      background-color: white;
      border-radius: 50%;
      transition: 0.3s;
    }

    .theme-switch input:checked + .slider {
      background-color: #3b82f6;
    }

    .theme-switch input:checked + .slider:before {
      transform: translateX(1.5rem);
    }

    /* Select Style */
    .theme-select {
      padding: 0.5rem 1rem;
      border: 1px solid currentColor;
      border-radius: 0.5rem;
      background: transparent;
      color: inherit;
      cursor: pointer;
      font-size: 0.875rem;
    }

    .theme-label {
      font-size: 0.875rem;
      white-space: nowrap;
    }
  `]
})
export class ThemeToggleComponent implements OnInit {
  @Input() toggleStyle: ThemeToggleStyle = 'button';
  @Input() showLabel: boolean = false;
  @Input() showAutoOption: boolean = true;

  currentTheme: Theme = 'light';

  constructor(private themeService: ThemeService) {}

  ngOnInit(): void {
    this.themeService.theme$.subscribe(theme => {
      this.currentTheme = theme;
    });
  }

  toggleTheme(): void {
    this.themeService.toggleTheme();
  }

  onThemeChange(theme: any): void {
    this.themeService.setTheme(theme as Theme);
  }

  getThemeIcon(): string {
    const resolved = this.themeService.getResolvedTheme();
    return resolved === 'dark' ? '🌙' : '☀️';
  }

  getThemeLabel(): string {
    const resolved = this.themeService.getResolvedTheme();
    return resolved === 'dark' ? 'Dark Mode' : 'Light Mode';
  }
}

