import { Component, OnInit, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LanguageService, Language } from '../../services/language.service';

@Component({
  selector: 'shared-language-selector',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="language-selector">
      <button 
        class="language-button"
        (click)="toggleDropdown()"
        [title]="'Select Language'">
        <span class="language-flag">{{ currentLanguage?.flag }}</span>
        <span *ngIf="showLabel" class="language-name">{{ currentLanguage?.name }}</span>
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <polyline points="6 9 12 15 18 9"></polyline>
        </svg>
      </button>

      <div class="language-dropdown" *ngIf="isOpen">
        <button 
          *ngFor="let lang of availableLanguages"
          class="language-option"
          [class.active]="lang.code === currentLanguage?.code"
          (click)="selectLanguage(lang)">
          <span class="language-flag">{{ lang.flag }}</span>
          <span class="language-name">{{ lang.name }}</span>
          <span *ngIf="lang.code === currentLanguage?.code" class="checkmark">✓</span>
        </button>
      </div>
    </div>
  `,
  styles: [`
    .language-selector {
      position: relative;
    }

    .language-button {
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

    .language-button:hover {
      background: rgba(0, 0, 0, 0.05);
    }

    .language-flag {
      font-size: 1.25rem;
      line-height: 1;
    }

    .language-dropdown {
      position: absolute;
      top: 100%;
      right: 0;
      margin-top: 0.5rem;
      background: white;
      border: 1px solid #e5e7eb;
      border-radius: 0.5rem;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
      min-width: 12rem;
      z-index: 1000;
    }

    .language-option {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      width: 100%;
      padding: 0.75rem 1rem;
      background: none;
      border: none;
      cursor: pointer;
      text-align: left;
      transition: background 0.2s;
    }

    .language-option:hover {
      background: #f3f4f6;
    }

    .language-option.active {
      background: #eff6ff;
      color: #3b82f6;
    }

    .checkmark {
      margin-left: auto;
      color: #3b82f6;
    }
  `]
})
export class LanguageSelectorComponent implements OnInit {
  @Input() showLabel: boolean = false;

  currentLanguage?: Language;
  availableLanguages: Language[] = [];
  isOpen = false;

  constructor(private languageService: LanguageService) {}

  ngOnInit(): void {
    this.availableLanguages = this.languageService.getAvailableLanguages();
    this.languageService.currentLanguage$.subscribe(langCode => {
      this.currentLanguage = this.availableLanguages.find(l => l.code === langCode);
    });
  }

  toggleDropdown(): void {
    this.isOpen = !this.isOpen;
  }

  selectLanguage(language: Language): void {
    this.languageService.setLanguage(language.code);
    this.isOpen = false;
  }
}

