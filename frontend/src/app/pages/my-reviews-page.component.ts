import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { EntityOption, EntityPickerComponent } from '../components/entity-picker.component';
import { ApiService } from '../services/api.service';
import { AuthService } from '../services/auth.service';
import { getApiErrorMessage } from '../utils/api-error.util';
import { resolveMediaUrl } from '../utils/media-url.util';

@Component({
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, EntityPickerComponent],
  template: `
    <section class="card">
      <h1>My reviews</h1>
      <p class="muted">Reviews you wrote and reviews others left for you.</p>
      <div class="tab-bar">
        <button type="button" [class.tab-active]="tab === 'given'" (click)="setTab('given')">Given by me</button>
        <button type="button" [class.tab-active]="tab === 'received'" (click)="setTab('received')">
          Received
        </button>
        <button type="button" [class.tab-active]="tab === 'write'" (click)="setTab('write')">Write a review</button>
      </div>
    </section>

    <section class="card" *ngIf="tab !== 'write'">
      <button type="button" class="secondary-btn" (click)="reloadTab()">Refresh</button>
      <div class="server-error" *ngIf="listError" role="alert">{{ listError }}</div>
      <ul class="review-list">
        <li *ngFor="let r of activeList" class="review-item">
          <div class="review-top">
            <strong>{{ r.rating }}/5</strong>
            <span class="muted small">{{ r.created_at }}</span>
          </div>
          <p *ngIf="tab === 'given'">For &#64;{{ r.reviewed_user_username }}</p>
          <p *ngIf="tab === 'received'">From &#64;{{ r.reviewer_username }}</p>
          <p>{{ r.comment }}</p>
        </li>
      </ul>
      <p class="muted" *ngIf="!activeList.length && !listError">Nothing here yet.</p>
    </section>

    <section class="card" *ngIf="tab === 'write'">
      <h2>Write a review</h2>
      <p class="muted small">Choose a member and rate your experience.</p>
      <form [formGroup]="reviewForm" (ngSubmit)="submitReview()" class="form-stack">
        <app-entity-picker
          label="Member"
          placeholder="Who are you reviewing?"
          [options]="userOptions"
          [value]="reviewForm.controls.reviewed_user.value"
          (valueChange)="onUserPicked($event)"
        />
        <div
          class="error"
          *ngIf="reviewForm.controls.reviewed_user.touched && reviewForm.controls.reviewed_user.invalid"
        >
          Choose a member.
        </div>
        <div class="field">
          <label for="rev-rating">Rating</label>
          <select id="rev-rating" formControlName="rating">
            <option *ngFor="let n of ratingChoices" [ngValue]="n">{{ n }} — {{ ratingLabel(n) }}</option>
          </select>
        </div>
        <div class="field">
          <label for="rev-comment">Comment</label>
          <textarea id="rev-comment" rows="3" formControlName="comment"></textarea>
        </div>
        <button type="submit" [disabled]="reviewForm.invalid">Submit review</button>
      </form>
      <p class="success" *ngIf="reviewSuccess">Review submitted.</p>
      <div class="server-error" *ngIf="reviewError" role="alert">{{ reviewError }}</div>
    </section>
  `,
})
export class MyReviewsPageComponent {
  private readonly api = inject(ApiService);
  private readonly fb = inject(FormBuilder);
  private readonly auth = inject(AuthService);

  tab: 'given' | 'received' | 'write' = 'given';
  given: any[] = [];
  received: any[] = [];
  userOptions: EntityOption[] = [];
  listError = '';
  reviewError = '';
  reviewSuccess = false;

  readonly ratingChoices = [5, 4, 3, 2, 1];

  reviewForm = this.fb.group({
    reviewed_user: [null as number | null, Validators.required],
    rating: [5, [Validators.required, Validators.min(1), Validators.max(5)]],
    comment: ['', [Validators.required, Validators.minLength(5)]],
  });

  get activeList(): any[] {
    return this.tab === 'given' ? this.given : this.received;
  }

  constructor() {
    this.reloadGiven();
    this.reloadReceived();
  }

  ratingLabel(n: number): string {
    const map: Record<number, string> = {
      5: 'Excellent',
      4: 'Good',
      3: 'OK',
      2: 'Poor',
      1: 'Very poor',
    };
    return map[n] ?? '';
  }

  setTab(t: 'given' | 'received' | 'write'): void {
    this.tab = t;
    this.listError = '';
    this.reviewError = '';
    this.reviewSuccess = false;
    if (t !== 'write') this.reloadTab();
    else this.loadUserOptions();
  }

  reloadTab(): void {
    if (this.tab === 'given') this.reloadGiven();
    if (this.tab === 'received') this.reloadReceived();
  }

  loadUserOptions(): void {
    this.api.getUserDirectory().subscribe({
      next: (users) => {
        const me = this.auth.user()?.id;
        this.userOptions = users
          .filter((u) => u.id !== me)
          .map((u) => ({
            id: u.id,
            label: u.username,
            sublabel: this.displayName(u),
            imageUrl: resolveMediaUrl(u.profile_image),
          }));
      },
      error: () => {},
    });
  }

  private displayName(u: { first_name: string; last_name: string; username: string }): string {
    const full = `${u.first_name ?? ''} ${u.last_name ?? ''}`.trim();
    return full || u.username;
  }

  onUserPicked(id: number | null): void {
    this.reviewForm.patchValue({ reviewed_user: id });
    this.reviewForm.controls.reviewed_user.markAsTouched();
  }

  reloadGiven(): void {
    this.listError = '';
    this.api.getMyReviewsGiven().subscribe({
      next: (rows) => (this.given = rows),
      error: (err) => (this.listError = getApiErrorMessage(err, 'Could not load reviews.')),
    });
  }

  reloadReceived(): void {
    this.listError = '';
    this.api.getMyReviewsReceived().subscribe({
      next: (rows) => (this.received = rows),
      error: (err) => (this.listError = getApiErrorMessage(err, 'Could not load reviews.')),
    });
  }

  submitReview(): void {
    if (this.reviewForm.invalid) {
      this.reviewForm.markAllAsTouched();
      return;
    }
    const v = this.reviewForm.getRawValue();
    if (v.reviewed_user == null || v.rating == null || v.comment == null) return;
    this.reviewError = '';
    this.reviewSuccess = false;
    this.api
      .createReview({
        reviewed_user: v.reviewed_user,
        rating: v.rating,
        comment: v.comment,
      })
      .subscribe({
        next: () => {
          this.reviewSuccess = true;
          this.reloadGiven();
        },
        error: (err) => (this.reviewError = getApiErrorMessage(err, 'Could not submit review.')),
      });
  }
}
