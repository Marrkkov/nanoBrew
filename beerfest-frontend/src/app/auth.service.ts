import { Injectable, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Router } from '@angular/router';
import { ApiService } from './api.service';
import { tap } from 'rxjs/operators';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private platformId = inject(PLATFORM_ID);
  username: string | null = null;

  constructor(private api: ApiService, private router: Router) {
    if (isPlatformBrowser(this.platformId)) {
      this.username = localStorage.getItem('username');
    }
  }

  login(username: string, password: string) {
    return this.api.login(username, password).pipe(
      tap((res) => {
        if (isPlatformBrowser(this.platformId)) {
          localStorage.setItem('jwt', res.token);
          localStorage.setItem('username', res.username);
        }
        this.username = res.username;
        this.router.navigate(['/']);
      })
    );
  }

  logout() {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.removeItem('jwt');
      localStorage.removeItem('username');
    }
    this.username = null;
    this.router.navigate(['/login']);
  }
}
