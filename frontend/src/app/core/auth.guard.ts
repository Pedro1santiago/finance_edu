import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { lerToken } from './token';

export const authGuard: CanActivateFn = () => !!lerToken() || inject(Router).createUrlTree(['/login']);

export const visitanteGuard: CanActivateFn = () => !lerToken() || inject(Router).createUrlTree(['/dashboard']);
