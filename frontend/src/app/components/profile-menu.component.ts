import { CommonModule } from '@angular/common';
import { Component, ElementRef, HostListener, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { ApiService } from '../services/api.service';
import { AuthService } from '../services/auth.service';
import { getApiErrorMessage } from '../utils/api-error.util';
import { fileLabelFromUrl } from '../utils/file-label.util';

@Component({
  selector: 'app-profile-menu',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="profile-menu">
      <button
        type="button"
        class="profile-trigger"
        (click)="toggle($event)"
        [attr.aria-expanded]="open()"
      >
        @if (avatarUrl()) {
          <img [src]="avatarUrl()!" alt="" class="avatar-img" />
        } @else {
          <span class="avatar-img avatar-placeholder">{{ initials() }}</span>
        }
        <span class="profile-name">{{ displayName() }}</span>
      </button>
      @if (open()) {
        <div class="profile-dropdown card" (click)="$event.stopPropagation()">
          <h3>Your profile</h3>
          <p class="profile-hint">
            Username and email cannot be changed here. You can update your name, bio, and files.
          </p>
          <div class="readonly-identity" *ngIf="auth.user() as u">
            <div><strong>Username</strong> {{ u.username }}</div>
            <div><strong>Email</strong> {{ u.email || '—' }}</div>
          </div>

          <div class="current-assets" *ngIf="auth.user() as u">
            <h4 class="current-assets-title">Current uploads</h4>
            <div class="asset-block">
              <span class="asset-label">Profile photo</span>
              @if (avatarUrl()) {
                <div class="asset-preview-wrap">
                  <img [src]="avatarUrl()!" alt="Your profile photo" class="profile-preview-img" />
                  <span class="asset-filename">{{ fileLabel(avatarUrl()) }}</span>
                </div>
              } @else {
                <p class="asset-empty">No photo yet — add one below.</p>
              }
              @if (pendingPhotoName()) {
                <p class="asset-pending">New file selected: {{ pendingPhotoName() }}</p>
              }
            </div>
            <div class="asset-block">
              <span class="asset-label">CV</span>
              @if (cvUrl()) {
                <div class="asset-cv-row">
                  <a [href]="cvUrl()!" target="_blank" rel="noopener noreferrer" class="asset-link">{{
                    fileLabel(cvUrl())
                  }}</a>
                  <span class="asset-hint">Opens in a new tab</span>
                </div>
              } @else {
                <p class="asset-empty">No CV uploaded yet — add one below.</p>
              }
              @if (pendingCvName()) {
                <p class="asset-pending">New file selected: {{ pendingCvName() }}</p>
              }
            </div>
          </div>

          <form [formGroup]="form" (ngSubmit)="save()" class="form-stack">
            <div class="field">
              <label for="pf-first">First name</label>
              <input id="pf-first" formControlName="first_name" autocomplete="given-name" />
            </div>
            <div class="field">
              <label for="pf-last">Last name</label>
              <input id="pf-last" formControlName="last_name" autocomplete="family-name" />
            </div>
            <div class="field">
              <label for="pf-bio">Bio</label>
              <textarea id="pf-bio" rows="3" formControlName="bio"></textarea>
            </div>
            <div class="field">
              <label for="pf-photo">Replace profile photo</label>
              <input id="pf-photo" type="file" accept="image/*" (change)="onPhoto($event)" />
            </div>
            <div class="field">
              <label for="pf-cv">Replace CV</label>
              <input id="pf-cv" type="file" (change)="onCv($event)" />
            </div>
            <button type="submit">Save changes</button>
          </form>
          <div class="server-error" *ngIf="formError()" role="alert">{{ formError() }}</div>
        </div>
      }
    </div>
  `,
})
export class ProfileMenuComponent {
  readonly auth = inject(AuthService);
  private readonly el = inject(ElementRef);
  private readonly fb = inject(FormBuilder);
  private readonly api = inject(ApiService);

  readonly open = signal(false);
  readonly formError = signal('');
  readonly pendingPhotoName = signal<string | null>(null);
  readonly pendingCvName = signal<string | null>(null);

  private profileImageFile: File | null = null;
  private cvFile: File | null = null;

  form = this.fb.nonNullable.group({
    first_name: [''],
    last_name: [''],
    bio: [''],
  });

  fileLabel = fileLabelFromUrl;

  avatarUrl(): string | null {
    return this.auth.user()?.profile_image ?? null;
  }

  cvUrl(): string | null {
    return this.auth.user()?.cv_file ?? null;
  }

  displayName(): string {
    const u = this.auth.user();
    if (!u) return '';
    const full = `${u.first_name} ${u.last_name}`.trim();
    return full || u.username;
  }

  initials(): string {
    const u = this.auth.user();
    if (!u) return '?';
    const parts = [u.first_name, u.last_name].filter(Boolean);
    if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return u.username.slice(0, 2).toUpperCase();
  }

  toggle(ev: Event): void {
    ev.stopPropagation();
    this.formError.set('');
    const next = !this.open();
    this.open.set(next);
    if (next) {
      this.profileImageFile = null;
      this.cvFile = null;
      this.pendingPhotoName.set(null);
      this.pendingCvName.set(null);
      this.resetFileInputs();
      const u = this.auth.user();
      if (u) {
        this.form.patchValue({
          first_name: u.first_name,
          last_name: u.last_name,
          bio: u.bio,
        });
      }
    }
  }

  private resetFileInputs(): void {
    const root = this.el.nativeElement as HTMLElement;
    root.querySelectorAll<HTMLInputElement>('input[type=file]').forEach((input) => {
      input.value = '';
    });
  }

  onPhoto(ev: Event): void {
    const input = ev.target as HTMLInputElement;
    const f = input.files?.[0] ?? null;
    this.profileImageFile = f;
    this.pendingPhotoName.set(f?.name ?? null);
  }

  onCv(ev: Event): void {
    const input = ev.target as HTMLInputElement;
    const f = input.files?.[0] ?? null;
    this.cvFile = f;
    this.pendingCvName.set(f?.name ?? null);
  }

  save(): void {
    this.formError.set('');
    const v = this.form.getRawValue();
    const files =
      this.profileImageFile || this.cvFile
        ? { profile_image: this.profileImageFile, cv_file: this.cvFile }
        : undefined;
    const hasTextChange =
      v.first_name !== (this.auth.user()?.first_name ?? '') ||
      v.last_name !== (this.auth.user()?.last_name ?? '') ||
      v.bio !== (this.auth.user()?.bio ?? '');
    if (!hasTextChange && !files) {
      this.formError.set('Change something or pick a file before saving.');
      return;
    }
    this.api.updateProfile(v, files).subscribe({
      next: (user) => {
        this.auth.setUser(user);
        this.profileImageFile = null;
        this.cvFile = null;
        this.pendingPhotoName.set(null);
        this.pendingCvName.set(null);
        this.resetFileInputs();
        this.open.set(false);
      },
      error: (err) => this.formError.set(getApiErrorMessage(err, 'Could not update profile.')),
    });
  }

  @HostListener('document:click', ['$event'])
  onDoc(ev: MouseEvent): void {
    if (!this.open()) return;
    const t = ev.target as Node;
    if (this.el.nativeElement.contains(t)) return;
    this.open.set(false);
  }
}
