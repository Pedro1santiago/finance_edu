import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { environment } from '../../environments/environment';
import { lerToken, removerToken } from './token';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);
  const token = lerToken();
  const daApi = req.url.startsWith(`${environment.apiUrl}/`) && !req.url.startsWith(`${environment.apiUrl}/api/auth/`);
  const enviada = token && daApi ? req.clone({ setHeaders: { Authorization: `Bearer ${token}` } }) : req;
  return next(enviada).pipe(
    catchError((e: unknown) => {
      if (daApi && e instanceof HttpErrorResponse && e.status === 401) {
        removerToken();
        router.navigateByUrl('/login');
      }
      return throwError(() => e);
    }),
  );
};
