import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { EntityOption, EntityPickerComponent } from '../components/entity-picker.component';
import { ApiService } from '../services/api.service';
import { getApiErrorMessage } from '../utils/api-error.util';
import { resolveMediaUrl } from '../utils/media-url.util';

@Component({
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, EntityPickerComponent],
  template: `
    <section class="card">
      <h1>My listings</h1>
      <p class="muted">
        Create offers for skills in the catalog, respond to incoming requests, and track requests you have sent.
      </p>
    </section>

    <section class="card">
      <h2>Create an offer</h2>
      <p class="small muted">Pick a skill from the catalog (same list as the Skills page).</p>
      <form [formGroup]="offerForm" (ngSubmit)="createOffer()" class="form-stack">
        <app-entity-picker
          label="Skill"
          placeholder="Select a skill…"
          [options]="skillOptions"
          [value]="offerForm.controls.skill.value"
          (valueChange)="onSkillPicked($event)"
        />
        <div class="error" *ngIf="offerForm.controls.skill.touched && offerForm.controls.skill.invalid">
          Choose a skill.
        </div>
        <div class="row">
          <div class="field">
            <label>Price</label>
            <input type="number" formControlName="price" />
          </div>
          <div class="field">
            <label>Availability</label>
            <input formControlName="availability" placeholder="e.g. Weekends" />
          </div>
        </div>
        <div class="field">
          <label>Description</label>
          <textarea rows="3" formControlName="description"></textarea>
        </div>
        <button type="submit" [disabled]="offerForm.invalid">Publish offer</button>
      </form>
      <p class="success" *ngIf="offerSuccess">Offer created.</p>
      <div class="server-error" *ngIf="offerError" role="alert">{{ offerError }}</div>
    </section>

    <section class="card">
      <h2>My offers</h2>
      <button type="button" class="secondary-btn" (click)="reloadOffers()">Refresh</button>
      <div class="server-error" *ngIf="offersError" role="alert">{{ offersError }}</div>
      <ul class="data-list" *ngIf="myOffers.length">
        <li *ngFor="let o of myOffers">
          <strong>{{ o.skill_title }}</strong> — {{ o.price | currency }} — {{ o.availability }}
          <p class="small muted">{{ o.description }}</p>
        </li>
      </ul>
      <p class="muted" *ngIf="!myOffers.length && !offersError">No offers yet.</p>
    </section>

    <section class="card">
      <h2>Incoming requests</h2>
      <p class="muted small">Accept or reject people who want your services.</p>
      <button type="button" class="secondary-btn" (click)="reloadIncoming()">Refresh</button>
      <div class="server-error" *ngIf="incomingError" role="alert">{{ incomingError }}</div>
      <div *ngFor="let r of incoming" class="request-card">
        <div class="request-card-head">
          <strong>{{ r.requester_username }}</strong>
          <span class="status-pill" [attr.data-status]="r.status">{{ r.status }}</span>
        </div>
        <p class="small">Offer: {{ r.offer_skill_title }} (&#35;{{ r.offer_id }})</p>
        <p>{{ r.message }}</p>
        <div class="request-actions" *ngIf="r.status === 'pending'">
          <button type="button" class="btn-accept" (click)="setStatus(r.id, 'accepted')">Accept</button>
          <button type="button" class="btn-reject" (click)="setStatus(r.id, 'rejected')">Reject</button>
        </div>
      </div>
      <p class="muted" *ngIf="!incoming.length && !incomingError">No incoming requests.</p>
    </section>

    <section class="card">
      <h2>Requests I sent</h2>
      <button type="button" class="secondary-btn" (click)="reloadOutgoing()">Refresh</button>
      <div class="server-error" *ngIf="outgoingError" role="alert">{{ outgoingError }}</div>
      <div *ngFor="let r of outgoing" class="request-card">
        <div class="request-card-head">
          <strong>{{ r.offer_skill_title }}</strong>
          <span class="status-pill" [attr.data-status]="r.status">{{ r.status }}</span>
        </div>
        <p>{{ r.message }}</p>
        <p class="small muted">Offer &#35;{{ r.offer_id }}</p>
      </div>
      <p class="muted" *ngIf="!outgoing.length && !outgoingError">You have not sent any requests yet.</p>
    </section>
  `,
})
export class SellerDashboardPageComponent {
  private readonly api = inject(ApiService);
  private readonly fb = inject(FormBuilder);

  skillOptions: EntityOption[] = [];
  myOffers: any[] = [];
  incoming: any[] = [];
  outgoing: any[] = [];
  offersError = '';
  incomingError = '';
  outgoingError = '';
  offerError = '';
  offerSuccess = false;

  offerForm = this.fb.group({
    skill: [null as number | null, Validators.required],
    price: [25, [Validators.required, Validators.min(0)]],
    availability: ['', [Validators.required, Validators.minLength(2)]],
    description: ['', [Validators.required, Validators.minLength(10)]],
  });

  constructor() {
    this.reloadSkillOptions();
    this.reloadOffers();
    this.reloadIncoming();
    this.reloadOutgoing();
  }

  onSkillPicked(id: number | null): void {
    this.offerForm.patchValue({ skill: id });
    this.offerForm.controls.skill.markAsTouched();
  }

  reloadSkillOptions(): void {
    this.api.getSkills().subscribe({
      next: (skills) => {
        this.skillOptions = skills.map((s) => ({
          id: s.id,
          label: s.title,
          sublabel: s.category,
          imageUrl: resolveMediaUrl(s.image),
        }));
      },
      error: () => {},
    });
  }

  reloadOffers(): void {
    this.offersError = '';
    this.api.getOffers('', { mine: true }).subscribe({
      next: (rows) => (this.myOffers = rows),
      error: (err) => (this.offersError = getApiErrorMessage(err, 'Could not load your offers.')),
    });
  }

  reloadIncoming(): void {
    this.incomingError = '';
    this.api.getRequests('provider').subscribe({
      next: (rows) => (this.incoming = rows),
      error: (err) => (this.incomingError = getApiErrorMessage(err, 'Could not load incoming requests.')),
    });
  }

  reloadOutgoing(): void {
    this.outgoingError = '';
    this.api.getRequests('requester').subscribe({
      next: (rows) => (this.outgoing = rows),
      error: (err) => (this.outgoingError = getApiErrorMessage(err, 'Could not load your requests.')),
    });
  }

  createOffer(): void {
    if (this.offerForm.invalid) {
      this.offerForm.markAllAsTouched();
      return;
    }
    const raw = this.offerForm.getRawValue();
    if (raw.skill == null) return;
    this.offerError = '';
    this.offerSuccess = false;
    this.api
      .createOffer({
        skill: raw.skill,
        price: raw.price,
        availability: raw.availability,
        description: raw.description,
      })
      .subscribe({
        next: () => {
          this.offerSuccess = true;
          this.reloadOffers();
          this.reloadSkillOptions();
        },
        error: (err) => (this.offerError = getApiErrorMessage(err, 'Could not create offer.')),
      });
  }

  setStatus(id: number, status: 'accepted' | 'rejected'): void {
    this.incomingError = '';
    this.api.updateRequestStatus(id, status).subscribe({
      next: () => this.reloadIncoming(),
      error: (err) => (this.incomingError = getApiErrorMessage(err, 'Could not update request.')),
    });
  }
}
