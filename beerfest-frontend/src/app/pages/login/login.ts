import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgIf } from '@angular/common';
import { AuthService } from '../../auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, NgIf],
  template: `
    <div class="card">
      <h2>Sign in</h2>
      <form (ngSubmit)="submit()" #f="ngForm">
        <label
          >Username <input name="u" [(ngModel)]="username" required
        /></label>
        <label
          >Password
          <input type="password" name="p" [(ngModel)]="password" required
        /></label>
        <button [disabled]="f.invalid || loading">Login</button>
      </form>
      <p class="err" *ngIf="error">{{ error }}</p>
      <small>Tip: first run uses <code>admin/admin</code></small>
    </div>
  `,
  styles: [
    `
      .card {
        max-width: 420px;
        margin: 40px auto;
        display: grid;
        gap: 10px;
      }
    `,
  ],
})
export class LoginComponent {
  username = '';
  password = '';
  loading = false;
  error = '';

  constructor(private auth: AuthService) {}

  submit() {
    this.loading = true;
    this.error = '';
    this.auth.login(this.username.trim(), this.password).subscribe({
      next: () => (this.loading = false),
      error: (e) => {
        this.loading = false;
        this.error = e?.error?.msg || 'Login failed';
      },
    });
  }
}
