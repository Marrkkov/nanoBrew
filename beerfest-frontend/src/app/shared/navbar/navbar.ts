import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../auth.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [RouterLink],
  template: `
    <nav class="nav">
      <a routerLink="/" class="brand">🍻 Beer Fest</a>
      <span class="grow"></span>
      <a routerLink="/overview">Overview</a>

      @if (auth.username) {
      <span class="pill">{{ auth.username }}</span>
      <button (click)="auth.logout()">Logout</button>
      }
    </nav>
  `,
  styles: [
    `
      .nav {
        display: flex;
        gap: 12px;
        align-items: center;
        padding: 10px;
      }
      .brand {
        font-weight: 700;
      }
      .grow {
        flex: 1;
      }
      .pill {
        padding: 4px 8px;
        border: 1px solid #ccc;
        border-radius: 999px;
      }
    `,
  ],
})
export class NavbarComponent {
  constructor(public auth: AuthService) {}
}
