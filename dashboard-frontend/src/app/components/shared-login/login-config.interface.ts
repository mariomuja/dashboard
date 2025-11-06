export interface LoginConfig {
  appTitle: string;
  githubRepoUrl: string;
  photoUrl?: string;
  demoCredentials?: {
    username: string;
    password: string;
  };
  redirectAfterLogin: string;
  showDeveloperCard?: boolean;
}

