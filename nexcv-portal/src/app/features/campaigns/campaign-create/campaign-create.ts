import { HttpErrorResponse } from '@angular/common/http';
import { ChangeDetectionStrategy, Component, OnDestroy, OnInit, inject, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { apiErrorMessage } from '../../../core/models/api-error';
import {
  CampaignDraft,
  CampaignTargetType,
  UserSearchHit,
} from '../../../core/models/campaigns.models';
import { CampaignsService } from '../../../core/services/campaigns.service';

const MAX_IMAGE_BYTES = 2 * 1024 * 1024;
const IMAGE_TYPES = ['image/png', 'image/jpeg', 'image/gif'];
const SEARCH_DEBOUNCE_MS = 300;
const MIN_SEARCH_CHARS = 2;

@Component({
  selector: 'app-campaign-create',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './campaign-create.html',
})
export class CampaignCreate implements OnInit, OnDestroy {
  private readonly campaigns = inject(CampaignsService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private searchTimer: ReturnType<typeof setTimeout> | undefined;

  readonly topics = ['feature_updates', 'promotions'];
  readonly saving = signal(false);
  readonly uploading = signal(false);
  readonly errorMsg = signal<string | null>(null);
  readonly imageUrl = signal<string | null>(null);
  readonly userHits = signal<UserSearchHit[]>([]);
  readonly selectedUser = signal<UserSearchHit | null>(null);
  readonly searching = signal(false);
  readonly createdId = signal<string | null>(null);

  readonly form = new FormGroup({
    title: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    body: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    targetType: new FormControl<CampaignTargetType>('all', { nonNullable: true }),
    topic: new FormControl('feature_updates', { nonNullable: true }),
    userQuery: new FormControl('', { nonNullable: true }),
    scheduledAt: new FormControl('', { nonNullable: true }),
  });

  /** `?uid=&email=&name=` pre-selects a single recipient (the "Send notification" shortcut on user pages). */
  ngOnInit(): void {
    const params = this.route.snapshot.queryParamMap;
    const uid = params.get('uid');
    if (!uid) return;
    this.form.controls.targetType.setValue('user');
    this.selectedUser.set({ uid, email: params.get('email'), displayName: params.get('name') });
  }

  ngOnDestroy(): void {
    clearTimeout(this.searchTimer);
  }

  /** The target is valid unless "user" is chosen without picking someone. */
  get targetReady(): boolean {
    return this.form.controls.targetType.value !== 'user' || this.selectedUser() !== null;
  }

  onUserQuery(): void {
    clearTimeout(this.searchTimer);
    const query = this.form.controls.userQuery.value.trim();
    if (query.length < MIN_SEARCH_CHARS) {
      this.userHits.set([]);
      return;
    }
    this.searchTimer = setTimeout(() => void this.searchUsers(query), SEARCH_DEBOUNCE_MS);
  }

  private async searchUsers(query: string): Promise<void> {
    this.searching.set(true);
    try {
      this.userHits.set((await firstValueFrom(this.campaigns.searchUsers(query))).users);
    } catch (e) {
      this.errorMsg.set(apiErrorMessage(e, 'User search failed.'));
    } finally {
      this.searching.set(false);
    }
  }

  pickUser(user: UserSearchHit): void {
    this.selectedUser.set(user);
    this.userHits.set([]);
  }

  clearUser(): void {
    this.selectedUser.set(null);
  }

  async onImageSelected(event: Event): Promise<void> {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;
    this.errorMsg.set(null);
    if (!IMAGE_TYPES.includes(file.type) || file.size > MAX_IMAGE_BYTES) {
      this.errorMsg.set('Image must be PNG, JPEG or GIF and at most 2 MB.');
      input.value = '';
      return;
    }
    this.uploading.set(true);
    try {
      const base64 = await this.readAsBase64(file);
      this.imageUrl.set((await firstValueFrom(this.campaigns.uploadImage(base64, file.type))).url);
    } catch (e) {
      this.errorMsg.set(apiErrorMessage(e, 'Image upload failed.'));
    } finally {
      this.uploading.set(false);
    }
  }

  removeImage(): void {
    this.imageUrl.set(null);
  }

  private readAsBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result).split(',')[1] ?? '');
      reader.onerror = () => reject(reader.error);
      reader.readAsDataURL(file);
    });
  }

  private buildDraft(status: 'draft' | 'queued'): CampaignDraft {
    const v = this.form.getRawValue();
    const targetValue =
      v.targetType === 'topic' ? v.topic : v.targetType === 'user' ? this.selectedUser()!.uid : '';
    return {
      title: v.title.trim(),
      body: v.body.trim(),
      targetType: v.targetType,
      targetValue,
      status,
      imageUrl: this.imageUrl(),
      scheduledAt: v.scheduledAt ? new Date(v.scheduledAt).toISOString() : null,
    };
  }

  private audienceLabel(): string {
    const v = this.form.getRawValue();
    if (v.targetType === 'topic') return `everyone subscribed to "${v.topic}"`;
    if (v.targetType === 'user') return this.selectedUser()?.email ?? this.selectedUser()?.uid ?? 'one user';
    return 'ALL registered users';
  }

  async saveDraft(): Promise<void> {
    if (this.form.invalid || !this.targetReady) return;
    this.saving.set(true);
    this.errorMsg.set(null);
    try {
      const { id } = await firstValueFrom(this.campaigns.create(this.buildDraft('draft')));
      await this.router.navigate(['/campaigns', id]);
    } catch (e) {
      this.errorMsg.set(apiErrorMessage(e, 'Failed to save the draft.'));
    } finally {
      this.saving.set(false);
    }
  }

  async sendNow(): Promise<void> {
    if (this.form.invalid || !this.targetReady) return;
    // A push to real users cannot be recalled — make the admin confirm the audience.
    if (!confirm(`Send "${this.form.getRawValue().title}" to ${this.audienceLabel()}? This cannot be undone.`)) {
      return;
    }
    this.saving.set(true);
    this.errorMsg.set(null);
    this.createdId.set(null);
    let id: string;
    try {
      id = (await firstValueFrom(this.campaigns.create(this.buildDraft('queued')))).id;
    } catch (e) {
      this.errorMsg.set(apiErrorMessage(e, 'Failed to create the campaign.'));
      this.saving.set(false);
      return;
    }
    try {
      await firstValueFrom(this.campaigns.send(id));
      await this.router.navigate(['/campaigns', id]);
    } catch (e) {
      // Stay here so the message is visible; the campaign exists, so link to it.
      this.createdId.set(id);
      this.errorMsg.set(this.sendErrorMessage(e));
    } finally {
      this.saving.set(false);
    }
  }

  /** A 5xx/timeout means sending may already have started — never suggest a blind retry. */
  private sendErrorMessage(e: unknown): string {
    if (e instanceof HttpErrorResponse && e.status >= 500) {
      return 'The server did not confirm the send. It may have started — check the campaign status before retrying.';
    }
    return apiErrorMessage(e, 'Failed to send the campaign.');
  }
}
