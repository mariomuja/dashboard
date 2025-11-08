import { Component, Input, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { BootstrapService, BootstrapState } from '../services/bootstrap.service';
import { StartupConfig } from './startup-config.interface';

@Component({
  selector: 'shared-startup-shell',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './startup-shell.component.html',
  styleUrls: ['./startup-shell.component.css']
})
export class SharedStartupShellComponent implements OnInit, OnDestroy {
  @Input() config!: StartupConfig;
  @Input() redirectAfterSuccess = '/dashboard';
  @Input() redirectAfterError = '/login';
  @Input() authTokenKey = 'authToken';
  
  bootstrapState: BootstrapState = {
    isReady: false,
    checks: [],
    overallStatus: 'initializing'
  };
  
  isRetrying = false;
  private subscription?: Subscription;

  constructor(
    private bootstrapService: BootstrapService,
    private router: Router
  ) {}

  ngOnInit(): void {
    // Subscribe to bootstrap state changes
    this.subscription = this.bootstrapService.bootstrapState$.subscribe(state => {
      this.bootstrapState = state;
      
      // If ready, proceed to the app
      if (state.isReady && state.overallStatus === 'ready') {
        setTimeout(() => {
          this.proceedToApp();
        }, 500);
      }
    });

    // Run bootstrap checks
    this.runChecks();
  }

  ngOnDestroy(): void {
    this.subscription?.unsubscribe();
  }

  async runChecks(): Promise<void> {
    await this.bootstrapService.runBootstrapChecks();
  }

  async retry(): Promise<void> {
    this.isRetrying = true;
    this.bootstrapService.reset();
    await this.runChecks();
    this.isRetrying = false;
  }

  proceedToApp(): void {
    // Check if user is authenticated
    const token = localStorage.getItem(this.authTokenKey);
    if (token) {
      this.router.navigate([this.redirectAfterSuccess]);
    } else {
      this.router.navigate([this.redirectAfterError]);
    }
  }

  getStatusIcon(status: string): string {
    switch (status) {
      case 'success':
        return '✓';
      case 'error':
        return '✗';
      case 'warning':
        return '⚠';
      case 'pending':
        return '...';
      default:
        return '?';
    }
  }

  getStatusClass(status: string): string {
    return `status-${status}`;
  }

  openInstructions(): void {
    if (this.config.instructionsUrl) {
      window.open(this.config.instructionsUrl, '_blank');
    }
  }
}


