import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { lerToken } from './token';

export const authGuard: CanActivateFn = (_, state) =>
  !!lerToken() || inject(Router).createUrlTree(['/login'], { queryParams: { returnUrl: state.url } });

export const visitanteGuard: CanActivateFn = () => !lerToken() || inject(Router).createUrlTree(['/dashboard']);
