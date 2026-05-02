import {
  HttpBackend,
  HttpClient,
  HttpContextToken,
  HttpErrorResponse,
  HttpInterceptorFn,
} from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, switchMap, throwError } from 'rxjs';
import { API_BASE } from '../api-constants';
import { AuthService } from '../services/auth.service';

/** Marks a request that already ran after one JWT refresh (no second refresh loop). */
export const jwtRefreshRetried = new HttpContextToken<boolean>(() => false);

/** Do not try JWT refresh on these calls (login/register/token endpoints). */
function isRefreshExempt(url: string): boolean {
  return (
    url.includes(`${API_BASE}/users/login/`) ||
    url.includes(`${API_BASE}/users/register/`) ||
    url.includes(`${API_BASE}/token/`)
  );
}

/**
 * On 401, exchanges `refresh` for a new `access` (SimpleJWT) and retries once.
 * Uses HttpBackend so the refresh POST does not recurse through interceptors.
 */
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const auth = inject(AuthService);
  const backend = inject(HttpBackend);
  const rawHttp = new HttpClient(backend);
  const router = inject(Router);

  return next(req).pipe(
    catchError((err: unknown) => {
      if (!(err instanceof HttpErrorResponse) || err.status !== 401) {
        return throwError(() => err);
      }
      if (req.context.get(jwtRefreshRetried)) {
        return throwError(() => err);
      }
      if (isRefreshExempt(req.url)) {
        return throwError(() => err);
      }
      const refresh = auth.getRefreshToken();
      if (!refresh) {
        auth.logout();
        void router.navigateByUrl('/');
        return throwError(() => err);
      }
      return rawHttp
        .post<{ access: string; refresh?: string }>(`${API_BASE}/token/refresh/`, { refresh })
        .pipe(
          switchMap((tokens) => {
            auth.updateAccessToken(tokens.access, tokens.refresh);
            const headers = req.headers.set('Authorization', `Bearer ${tokens.access}`);
            const context = req.context.set(jwtRefreshRetried, true);
            return next(req.clone({ headers, context }));
          }),
          catchError(() => {
            auth.logout();
            void router.navigateByUrl('/');
            return throwError(() => err);
          }),
        );
    }),
  );
};
