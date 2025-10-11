import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../auth.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [RouterLink],
  template: `
    <nav class="nav">
      <a routerLink="/" class="brand">🍻OktobeerMut Beer Fest</a>
      <span class="grow"></span>

      <a routerLink="/overview" class="nav-btn nav-btn--secondary">Overview</a>

      @if (auth.username) {
      <span class="pill">{{ auth.username }}</span>
      <button class="nav-btn nav-btn--logout" (click)="auth.logout()">
        Logout
      </button>
      }
    </nav>
  `,
  styleUrls: ['./navbar.scss'],
})
export class NavbarComponent {
  constructor(public auth: AuthService) {}
}
