import { DatePipe, DecimalPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, OnInit, inject, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { firstValueFrom } from 'rxjs';
import { ModelPricing } from '../../../core/models/ai-usage.models';
import { apiErrorMessage } from '../../../core/models/api-error';
import { ApiService } from '../../../core/services/api.service';

/** `<input type="datetime-local">` value for "now", in local time. */
function localNow(): string {
  const d = new Date();
  d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
  return d.toISOString().slice(0, 16);
}

@Component({
  selector: 'app-pricing',
  standalone: true,
  imports: [ReactiveFormsModule, DatePipe, DecimalPipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './pricing.html',
})
export class Pricing implements OnInit {
  private readonly api = inject(ApiService);

  readonly prices = signal<ModelPricing[]>([]);
  readonly loading = signal(false);
  readonly saving = signal(false);
  readonly error = signal<string | null>(null);
  readonly success = signal<string | null>(null);

  readonly form = new FormGroup({
    provider: new FormControl('GEMINI', { nonNullable: true, validators: [Validators.required] }),
    model: new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.maxLength(128)] }),
    inputPricePerMillion: new FormControl<number | null>(null, [Validators.required, Validators.min(0)]),
    outputPricePerMillion: new FormControl<number | null>(null, [Validators.required, Validators.min(0)]),
    currency: new FormControl('USD', {
      nonNullable: true,
      validators: [Validators.required, Validators.pattern(/^[A-Z]{3}$/)],
    }),
    effectiveFrom: new FormControl(localNow(), { nonNullable: true, validators: [Validators.required] }),
    notes: new FormControl('', { nonNullable: true, validators: [Validators.maxLength(255)] }),
  });

  ngOnInit(): void {
    void this.load();
  }

  async load(): Promise<void> {
    this.loading.set(true);
    this.error.set(null);
    try {
      this.prices.set(await firstValueFrom(this.api.get<ModelPricing[]>('/ai/pricing')));
    } catch (e) {
      this.error.set(apiErrorMessage(e, 'Failed to load pricing.'));
    } finally {
      this.loading.set(false);
    }
  }

  async add(): Promise<void> {
    if (this.form.invalid) return;
    const v = this.form.getRawValue();
    const when = new Date(v.effectiveFrom);
    if (
      !confirm(
        `Add price for ${v.model} effective ${when.toLocaleString()}?\n` +
          'This closes the current open-ended price for the same provider and model at that time, ' +
          'and changes cost figures from then on.',
      )
    ) {
      return;
    }
    this.saving.set(true);
    this.error.set(null);
    this.success.set(null);
    try {
      await firstValueFrom(
        this.api.post<ModelPricing>('/ai/pricing', {
          provider: v.provider,
          model: v.model.trim(),
          inputPricePerMillion: v.inputPricePerMillion,
          outputPricePerMillion: v.outputPricePerMillion,
          currency: v.currency,
          effectiveFrom: when.toISOString(),
          notes: v.notes.trim() || null,
        }),
      );
      this.success.set('Price added.');
      this.form.patchValue({ model: '', inputPricePerMillion: null, outputPricePerMillion: null, notes: '' });
      await this.load();
    } catch (e) {
      this.error.set(apiErrorMessage(e, 'Failed to add the price.'));
    } finally {
      this.saving.set(false);
    }
  }
}
