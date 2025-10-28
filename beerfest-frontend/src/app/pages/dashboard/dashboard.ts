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
  constructor(private api: ApiService, public auth: AuthService) {}

  get isAdmin() {
    return (this.auth.username || '').toLowerCase() === 'admin';
  }

  items = [
    { key: '500' as const, label: '500 cc' },
    { key: '250' as const, label: '250 cc' },
    { key: 'bottle_1' as const, label: 'Botella (1/2 ficha)' },
    { key: 'bottle_2' as const, label: 'Botella (1 ficha)' },
    { key: 'extra' as const, label: 'Extra' },
  ];

  totals = {
    qty_500: 0,
    qty_250: 0,
    qty_bottle_1: 0,
    qty_bottle_2: 0,
    qty_extra: 0,
    grand: 0,
  };

  newU = '';
  newP = '';
  addMsg = '';
  curPw = '';
  newPw = '';
  pwMsg = '';
  resetMsg = '';

  ngOnInit() {
    this.refresh();
  }
  refresh() {
    this.api.myTotals().subscribe((res) => (this.totals = res.totals));
  }

  upd(key: '500' | '250' | 'bottle_1' | 'bottle_2' | 'extra', delta: -1 | 1) {
    if (this.isAdmin) return;
    this.api.update(key, delta).subscribe(() => this.refresh());
  }

  addUser() {
    this.api.addUser(this.newU.trim(), this.newP).subscribe({
      next: () => {
        this.addMsg = 'Usuario agregado ✔';
        this.newU = this.newP = '';
      },
      error: (e) => (this.addMsg = e?.error?.msg || 'Error'),
    });
  }

  changePw() {
    this.api.changePassword(this.curPw, this.newPw).subscribe({
      next: () => {
        this.pwMsg = 'Contraseña cambiada ✔';
        this.curPw = this.newPw = '';
      },
      error: (e) => (this.pwMsg = e?.error?.msg || 'Error'),
    });
  }

  resetAll() {
    this.api.resetAllTotals().subscribe({
      next: () => {
        this.resetMsg = 'Totales reiniciados ✔';
        this.refresh();
      },
      error: (e) => (this.resetMsg = e?.error?.msg || 'Error'),
    });
  }
}
