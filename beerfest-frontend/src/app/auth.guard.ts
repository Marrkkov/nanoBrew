import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

export const authGuard: CanActivateFn = () => {
  const router = inject(Router);
  const platformId = inject(PLATFORM_ID);

  const hasJwt = isPlatformBrowser(platformId)
    ? !!localStorage.getItem('jwt')
    : false;

  if (!hasJwt) router.navigate(['/login']);
  return hasJwt;
};
