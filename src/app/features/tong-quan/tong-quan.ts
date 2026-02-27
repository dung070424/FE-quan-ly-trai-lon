import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TongQuanService, DashboardDto } from './tong-quan.service';
import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration, ChartOptions, ChartType } from 'chart.js';

@Component({
  selector: 'app-tong-quan',
  standalone: true,
  imports: [CommonModule, BaseChartDirective],
  templateUrl: './tong-quan.html',
  styleUrl: './tong-quan.scss'
})
export class TongQuanComponent implements OnInit {
  summary: DashboardDto | null = null;
  loading: boolean = true;

  // Chart Properties
  public lineChartData: ChartConfiguration<'line'>['data'] = {
    labels: [],
    datasets: [
      { data: [], label: 'Doanh thu (Bán lợn)', borderColor: '#1890ff', backgroundColor: 'rgba(24,144,255,0.2)', fill: true },
      { data: [], label: 'Chi phí (Cám + Thuốc)', borderColor: '#f5222d', backgroundColor: 'rgba(245,34,45,0.2)', fill: true }
    ]
  };
  public lineChartOptions: ChartOptions<'line'> = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      y: { beginAtZero: true }
    }
  };
  public lineChartType: any = 'line';

  // Bar Chart Properties for Pig Sales Quantity
  public barChartData: ChartConfiguration<'bar'>['data'] = {
    labels: [],
    datasets: [
      { data: [], label: 'Số lượng lợn bán (Con)', backgroundColor: '#52c41a' }
    ]
  };
  public barChartOptions: ChartOptions<'bar'> = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      y: { beginAtZero: true }
    }
  };
  public barChartType: any = 'bar';

  // Farrowing Bar Chart Properties
  public farrowingChartData: ChartConfiguration<'bar'>['data'] = {
    labels: [],
    datasets: [
      { data: [], label: 'Lợn con sinh ra sống (Con)', backgroundColor: '#fa8c16' }
    ]
  };
  public farrowingChartOptions: ChartOptions<'bar'> = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      y: { beginAtZero: true }
    }
  };
  public farrowingChartType: any = 'bar';

  constructor(
    private tongQuanService: TongQuanService,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit(): void {
    this.tongQuanService.getSummary().subscribe({
      next: (data) => {
        this.summary = data;
        this.processChartData(data);
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error fetching dashboard summary', err);
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  processChartData(data: DashboardDto) {
    // Collect all unique months from both sales, expenses, and farrowing
    const monthsSet = new Set<string>();
    Object.keys(data.salesOverTime || {}).forEach(m => monthsSet.add(m));
    Object.keys(data.expensesOverTime || {}).forEach(m => monthsSet.add(m));
    Object.keys(data.pigsSoldOverTime || {}).forEach(m => monthsSet.add(m));
    Object.keys(data.pigsBornOverTime || {}).forEach(m => monthsSet.add(m));

    // Sort the months chronologically
    const sortedMonths = Array.from(monthsSet).sort();

    // Prepare arrays for line chart datasets
    this.lineChartData.labels = sortedMonths;
    const salesData = sortedMonths.map(m => (data.salesOverTime && data.salesOverTime[m]) ? data.salesOverTime[m] : 0);
    const expensesData = sortedMonths.map(m => (data.expensesOverTime && data.expensesOverTime[m]) ? data.expensesOverTime[m] : 0);

    this.lineChartData.datasets[0].data = salesData;
    this.lineChartData.datasets[1].data = expensesData;

    // Prepare arrays for bar chart datasets
    this.barChartData.labels = sortedMonths;
    const pigsSoldData = sortedMonths.map(m => (data.pigsSoldOverTime && data.pigsSoldOverTime[m]) ? data.pigsSoldOverTime[m] : 0);
    this.barChartData.datasets[0].data = pigsSoldData;

    // Prepare arrays for farrowing chart datasets
    this.farrowingChartData.labels = sortedMonths;
    const pigsBornData = sortedMonths.map(m => (data.pigsBornOverTime && data.pigsBornOverTime[m]) ? data.pigsBornOverTime[m] : 0);
    this.farrowingChartData.datasets[0].data = pigsBornData;
  }

  formatCurrency(value: number | undefined): string {
    if (value === undefined || value === null) return '0 ₫';
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);
  }
}
