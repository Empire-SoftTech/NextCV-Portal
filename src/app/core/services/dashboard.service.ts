import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { DashboardResponse } from '../models/dashboard.models';
import { ApiService } from './api.service';

/** KPI dashboard (Spring backend). */
@Injectable({ providedIn: 'root' })
export class DashboardService {
  private readonly api = inject(ApiService);

  get(days: number): Observable<DashboardResponse> {
    return this.api.get<DashboardResponse>('/dashboard', { days });
  }
}
