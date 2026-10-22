import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { apiErrorMessage } from '../../../core/models/api-error';
import { CampaignDetails, CampaignRecipient } from '../../../core/models/campaigns.models';
import { CampaignsService } from '../../../core/services/campaigns.service';
import { statusClasses, targetLabel } from '../campaign-status';

@Component({
  selector: 'app-campaign-details',
  standalone: true,
  imports: [DatePipe, RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './campaign-details.html',
})
export class CampaignDetailsPage implements OnInit {
  private readonly campaigns = inject(CampaignsService);
  private readonly id = inject(ActivatedRoute).snapshot.paramMap.get('id') ?? '';

  readonly details = signal<CampaignDetails | null>(null);
  readonly recipients = signal<CampaignRecipient[]>([]);
  readonly loading = signal(false);
  readonly error = signal<string | null>(null);

  readonly statusClasses = statusClasses;
  readonly targetLabel = targetLabel;

  ngOnInit(): void {
    void this.load(true);
  }

  /** First call loads from offset 0; "Load more" appends the next page of recipients. */
  async load(reset: boolean): Promise<void> {
    this.loading.set(true);
    this.error.set(null);
    try {
      const offset = reset ? 0 : this.recipients().length;
      const res = await firstValueFrom(this.campaigns.details(this.id, offset));
      this.details.set(res);
      this.recipients.set(reset ? res.recipients : [...this.recipients(), ...res.recipients]);
    } catch (e) {
      this.error.set(apiErrorMessage(e, 'Failed to load campaign.'));
    } finally {
      this.loading.set(false);
    }
  }
}
