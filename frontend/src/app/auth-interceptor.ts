import { HttpInterceptorFn } from '@angular/common/http';
import { isPlatformBrowser } from '@angular/common';
import { inject, PLATFORM_ID } from '@angular/core';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const platformId = inject(PLATFORM_ID);

  // Only run in browser
  if (isPlatformBrowser(platformId)) {
    const token = localStorage.getItem('access');

    console.log('Interceptor running for:', req.url);
    console.log('Token found:', token);

    if (token) {
      const authReq = req.clone({
        setHeaders: {
          Authorization: `Bearer ${token}`
        }
      });

      return next(authReq);
    }
  }

  // No token or not browser → send original request
  return next(req);
};