import { HttpInterceptorFn } from '@angular/common/http';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  // Get session ID from localStorage
  const sessionId = localStorage.getItem('sessionId');
  
  if (sessionId) {
    // Clone the request and add the session ID header
    const clonedReq = req.clone({
      setHeaders: {
        'x-session-id': sessionId
      }
    });
    return next(clonedReq);
  }
  
  return next(req);
};





