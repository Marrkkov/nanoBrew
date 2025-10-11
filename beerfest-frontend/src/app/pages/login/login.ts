import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../auth.service';
import { ApiService } from '../../api.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './login.html',
  styleUrls: ['./login.scss'],
})
export class LoginComponent implements OnInit {
  username = '';
  password = '';
  loading = false;
  error = '';
  breweries: string[] = [];

  constructor(private auth: AuthService, private api: ApiService) {}

  ngOnInit() {
    this.api.breweries().subscribe({
      next: (r) => (this.breweries = r.breweries),
      error: () => (this.breweries = []),
    });
  }

  pick(u: string) {
    this.username = u;
  }

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
