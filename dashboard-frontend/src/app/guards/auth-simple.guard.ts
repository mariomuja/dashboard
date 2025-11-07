import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';

export const authGuardSimple: CanActivateFn = () => {
  const router = inject(Router);
  const sessionId = typeof localStorage !== 'undefined' ? localStorage.getItem('sessionId') : null;
  
  if (sessionId) {
    return true;
  }
  
  router.navigate(['/login']);
  return false;
};

