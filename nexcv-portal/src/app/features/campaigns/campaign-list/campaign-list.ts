import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, OnInit, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { apiErrorMessage } from '../../../core/models/api-error';
import { CampaignRow } from '../../../core/models/campaigns.models';
import { CampaignsService } from '../../../core/services/campaigns.service';
import { statusClasses, targetLabel } from '../campaign-status';

@Component({
  selector: 'app-campaign-list',
  standalone: true,
  imports: [DatePipe, RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './campaign-list.html',
})
export class CampaignList implements OnInit {
  private readonly campaigns = inject(CampaignsService);

  readonly items = signal<CampaignRow[]>([]);
  readonly loading = signal(false);
  readonly error = signal<string | null>(null);

  readonly statusClasses = statusClasses;
  readonly targetLabel = targetLabel;

  ngOnInit(): void {
    void this.load();
  }

  async load(): Promise<void> {
    this.loading.set(true);
    this.error.set(null);
    try {
      this.items.set((await firstValueFrom(this.campaigns.list())).campaigns);
    } catch (e) {
      this.error.set(apiErrorMessage(e, 'Failed to load campaigns.'));
    } finally {
      this.loading.set(false);
    }
  }
}
