import { Component, OnDestroy, OnInit } from '@angular/core';
import { ApiService } from '../../api.service';
import { NavbarComponent } from '../../shared/navbar/navbar';

@Component({
  selector: 'app-overview',
  templateUrl: './overview.html',
  imports: [NavbarComponent],
  styleUrls: ['./overview.scss'],
})
export class OverviewComponent implements OnInit, OnDestroy {
  rows: any[] = [];
  grand = { qty_500: 0, qty_250: 0, qty_bottle: 0, grand: 0 };
  timer?: any;

  constructor(private api: ApiService) {}
  ngOnInit() {
    this.load();
    this.timer = setInterval(() => this.load(), 3000); // soft auto-refresh
  }
  ngOnDestroy() {
    if (this.timer) clearInterval(this.timer);
  }
  load() {
    this.api.overview().subscribe((res) => {
      this.rows = res.rows;
      this.grand = res.grand;
    });
  }
}
