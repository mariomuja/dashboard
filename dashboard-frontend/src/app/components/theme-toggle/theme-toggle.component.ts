import { Component, OnInit } from '@angular/core';
import { ThemeService, Theme } from '@shared-components/services';

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
    this.themeService.toggleTheme();
  }
}

