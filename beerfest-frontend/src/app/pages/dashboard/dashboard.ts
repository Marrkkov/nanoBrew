// src/app/pages/dashboard/dashboard.ts
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { ApiService } from '../../api.service';
import { NavbarComponent } from '../../shared/navbar/navbar';
import { AuthService } from '../../auth.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [FormsModule, RouterLink, NavbarComponent],
  templateUrl: './dashboard.html',
  styleUrls: ['./dashboard.scss'],
})
export class DashboardComponent implements OnInit {
  constructor(private api: ApiService, public auth: AuthService) {} // ← public so template can read it

  items = [
    { key: '500' as const, label: '500 cc' },
    { key: '250' as const, label: '250 cc' },
    { key: 'bottle' as const, label: 'Bottle' },
  ];
  totals = { qty_500: 0, qty_250: 0, qty_bottle: 0, grand: 0 };

  newU = '';
  newP = '';
  addMsg = '';
  curPw = '';
  newPw = '';
  pwMsg = '';

  ngOnInit() {
    this.refresh();
  }
  refresh() {
    this.api.myTotals().subscribe((res) => (this.totals = res.totals));
  }
  upd(key: '500' | '250' | 'bottle', delta: -1 | 1) {
    this.api.update(key, delta).subscribe(() => this.refresh());
  }
  addUser() {
    this.api.addUser(this.newU.trim(), this.newP).subscribe({
      next: () => {
        this.addMsg = 'User added ✔';
        this.newU = this.newP = '';
      },
      error: (e) => (this.addMsg = e?.error?.msg || 'Error'),
    });
  }
  changePw() {
    this.api.changePassword(this.curPw, this.newPw).subscribe({
      next: () => {
        this.pwMsg = 'Password changed ✔';
        this.curPw = this.newPw = '';
      },
      error: (e) => (this.pwMsg = e?.error?.msg || 'Error'),
    });
  }
}
