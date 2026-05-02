import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ApiService, type PublicUser } from '../services/api.service';
import { AuthService } from '../services/auth.service';
import { getApiErrorMessage } from '../utils/api-error.util';
import { resolveMediaUrl } from '../utils/media-url.util';

@Component({
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <section class="card browse-hero">
      <h1>Browse skill offers</h1>
      <p class="muted">
        Search by skill, category, provider, or description. Open an offer to see the provider profile and reviews,
        then send a request.
      </p>
      <form [formGroup]="searchForm" (ngSubmit)="search()" class="browse-search-row">
        <input formControlName="q" placeholder="Try: guitar, design, weekend…" class="browse-search-input" />
        <button type="submit">Search</button>
      </form>
    </section>

    <div class="browse-split">
      <aside class="card browse-list">
        <h2 class="h2-tight">Offers</h2>
        <p class="muted small" *ngIf="!offers.length && !listError">No results yet. Search or refresh.</p>
        <div class="server-error" *ngIf="listError" role="alert">{{ listError }}</div>
        <ul class="offer-list">
          <li *ngFor="let o of offers">
            <button
              type="button"
              class="offer-list-item"
              [class.offer-list-item--active]="selected?.id === o.id"
              (click)="selectOffer(o)"
            >
              <span class="offer-list-title">{{ o.skill_title }}</span>
              <span class="offer-list-meta"
                >{{ o.provider_username }} · {{ o.price | currency }} · {{ o.availability }}</span
              >
            </button>
          </li>
        </ul>
      </aside>

      <div class="browse-detail" *ngIf="selected">
        <section class="card">
          <h2>{{ selected.skill_title }}</h2>
          <p class="muted">{{ selected.skill_category }}</p>
          <p class="offer-price">{{ selected.price | currency }}</p>
          <p><strong>Availability</strong> {{ selected.availability }}</p>
          <p>{{ selected.description }}</p>
          <p class="small muted">Listed {{ selected.created_at }}</p>

          <div class="provider-strip" *ngIf="publicUser as pu">
            <h3>Provider</h3>
            <div class="provider-row">
              <img
                *ngIf="providerPhoto(pu)"
                [src]="providerPhoto(pu)!"
                alt=""
                class="provider-avatar"
              />
              <div>
                <strong>{{ providerDisplayName(pu) }}</strong>
                <span class="username muted">&#64;{{ pu.username }}</span>
                <p class="bio-preview">{{ pu.bio || 'No bio yet.' }}</p>
              </div>
            </div>
          </div>
          <div class="server-error" *ngIf="profileError" role="alert">{{ profileError }}</div>

          <div class="reviews-block" *ngIf="selected">
            <h3>Reviews for this provider</h3>
            <p class="muted small" *ngIf="!reviews.length && !reviewsError">No reviews yet.</p>
            <div class="server-error" *ngIf="reviewsError" role="alert">{{ reviewsError }}</div>
            <ul class="review-mini-list">
              <li *ngFor="let r of reviews">
                <strong>{{ r.rating }}/5</strong> · {{ r.reviewer_username }} — {{ r.comment }}
                <span class="muted small">({{ r.created_at }})</span>
              </li>
            </ul>
          </div>

          <div class="request-box" *ngIf="meId && selected.provider_id !== meId">
            <h3>Request this offer</h3>
            <form [formGroup]="requestForm" (ngSubmit)="submitRequest()" class="form-stack">
              <div class="field">
                <label for="req-msg">Message to the provider</label>
                <textarea id="req-msg" rows="3" formControlName="message"></textarea>
              </div>
              <button type="submit" [disabled]="requestForm.invalid">Send request</button>
            </form>
            <p class="success" *ngIf="requestSuccess">Request sent. Check <strong>My listings</strong> for updates.</p>
            <div class="server-error" *ngIf="requestError" role="alert">{{ requestError }}</div>
          </div>
          <p class="muted" *ngIf="meId && selected.provider_id === meId">This is your own offer.</p>
        </section>
      </div>

      <div class="card browse-placeholder" *ngIf="!selected">
        <p>Select an offer on the left to see details, provider info, and reviews.</p>
      </div>
    </div>
  `,
})
export class BrowsePageComponent {
  private readonly api = inject(ApiService);
  private readonly fb = inject(FormBuilder);
  readonly auth = inject(AuthService);

  offers: any[] = [];
  selected: any | null = null;
  publicUser: PublicUser | null = null;
  reviews: any[] = [];
  listError = '';
  profileError = '';
  reviewsError = '';
  requestError = '';
  requestSuccess = false;

  searchForm = this.fb.nonNullable.group({ q: [''] });
  requestForm = this.fb.nonNullable.group({
    message: ['', [Validators.required, Validators.minLength(10)]],
  });

  get meId(): number | null {
    return this.auth.user()?.id ?? null;
  }

  constructor() {
    this.loadOffers();
  }

  providerPhoto(pu: PublicUser): string | null {
    return resolveMediaUrl(pu.profile_image);
  }

  providerDisplayName(pu: PublicUser): string {
    const full = `${pu.first_name ?? ''} ${pu.last_name ?? ''}`.trim();
    return full || pu.username;
  }

  search(): void {
    this.loadOffers();
  }

  loadOffers(): void {
    this.listError = '';
    const q = this.searchForm.controls.q.value;
    this.api.getOffers(q).subscribe({
      next: (rows) => {
        this.offers = rows;
        if (this.selected && !rows.some((x) => x.id === this.selected!.id)) {
          this.clearDetail();
        }
      },
      error: (err) => (this.listError = getApiErrorMessage(err, 'Could not load offers.')),
    });
  }

  selectOffer(o: any): void {
    this.selected = o;
    this.publicUser = null;
    this.reviews = [];
    this.profileError = '';
    this.reviewsError = '';
    this.requestSuccess = false;
    this.requestError = '';
    this.requestForm.reset({ message: '' });

    const pid = o.provider_id as number;
    this.api.getPublicUser(pid).subscribe({
      next: (u) => (this.publicUser = u),
      error: (err) => (this.profileError = getApiErrorMessage(err, 'Could not load profile.')),
    });
    this.api.getReviewsByUser(pid).subscribe({
      next: (r) => (this.reviews = r),
      error: (err) => (this.reviewsError = getApiErrorMessage(err, 'Could not load reviews.')),
    });
  }

  clearDetail(): void {
    this.selected = null;
    this.publicUser = null;
    this.reviews = [];
  }

  submitRequest(): void {
    if (!this.selected || this.requestForm.invalid) {
      this.requestForm.markAllAsTouched();
      return;
    }
    this.requestError = '';
    this.requestSuccess = false;
    this.api
      .createRequest({
        offer: this.selected.id,
        message: this.requestForm.controls.message.value,
      })
      .subscribe({
        next: () => {
          this.requestSuccess = true;
          this.requestForm.reset({ message: '' });
        },
        error: (err) => (this.requestError = getApiErrorMessage(err, 'Could not send request.')),
      });
  }
}
