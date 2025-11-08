export interface StartupConfig {
  /** Application name to display */
  appName: string;
  
  /** Optional logo SVG path data */
  logoSvg?: string;
  
  /** Version text to display in footer */
  versionText?: string;
  
  /** Label for retry button */
  retryLabel?: string;
  
  /** Label for instructions button */
  instructionsLabel?: string;
  
  /** URL to open when clicking instructions */
  instructionsUrl?: string;
  
  /** Help steps to display when there's an error */
  helpSteps?: string[];
  
  /** Subtitle text shown during initialization */
  initializingSubtitle?: string;
}


