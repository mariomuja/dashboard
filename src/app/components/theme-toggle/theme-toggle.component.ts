import { Component, OnInit } from '@angular/core';
import { ThemeService, Theme } from '../../services/theme.service';

@Component({
  selector: 'app-theme-toggle',
  templateUrl: './theme-toggle.component.html',
  styleUrls: ['./theme-toggle.component.css']
})
export class ThemeToggleComponent implements OnInit {
  currentTheme: Theme = 'light';

  constructor(private themeService: ThemeService) { }

  ngOnInit(): void {
    this.themeService.theme$.subscribe(theme => {
      this.currentTheme = theme;
    });
  }

  toggleTheme(): void {
    console.log('Toggle button clicked!'); // Debug
    console.log('Current theme before toggle:', this.currentTheme);
    this.themeService.toggleTheme();
    console.log('Current theme after toggle:', this.themeService.getCurrentTheme());
    
    // Force immediate visual update
    setTimeout(() => {
      const isDark = document.body.classList.contains('dark-theme');
      console.log('Is dark theme applied?', isDark);
      alert(`Theme toggled to: ${this.themeService.getCurrentTheme()}\nBody has dark-theme class: ${isDark}`);
    }, 100);
  }
}

