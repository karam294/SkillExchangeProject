import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { ApiService } from '../services/api.service';
import {
  applyDrfFieldErrors,
  clearDrfServerErrors,
  getApiErrorMessage,
} from '../utils/api-error.util';

@Component({
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  template: `
    <div class="auth-shell">
      <div class="auth-card card">
        <h2>Create account</h2>
        <form [formGroup]="form" (ngSubmit)="submit()" class="form-stack">
          <div class="field">
            <label for="reg-username">Username</label>
            <input id="reg-username" formControlName="username" autocomplete="username" />
            <div class="error" *ngIf="form.controls.username.touched && form.controls.username.invalid">
              Username is required (min 3 chars).
            </div>
            <div class="error" *ngIf="form.controls.username.hasError('server')">
              {{ form.controls.username.getError('server') }}
            </div>
          </div>
          <div class="field">
            <label for="reg-email">Email</label>
            <input id="reg-email" type="email" formControlName="email" autocomplete="email" />
            <div class="error" *ngIf="form.controls.email.touched && form.controls.email.invalid">
              A valid email is required.
            </div>
            <div class="error" *ngIf="form.controls.email.hasError('server')">
              {{ form.controls.email.getError('server') }}
            </div>
          </div>
          <div class="field">
            <label for="reg-password">Password</label>
            <input
              id="reg-password"
              type="password"
              formControlName="password"
              autocomplete="new-password"
            />
            <div class="error" *ngIf="form.controls.password.touched && form.controls.password.invalid">
              Password must be at least 6 characters.
            </div>
            <div class="error" *ngIf="form.controls.password.hasError('server')">
              {{ form.controls.password.getError('server') }}
            </div>
          </div>
          <div class="field">
            <label for="reg-bio">Bio</label>
            <textarea id="reg-bio" formControlName="bio" rows="3"></textarea>
            <div class="error" *ngIf="form.controls.bio.hasError('server')">
              {{ form.controls.bio.getError('server') }}
            </div>
          </div>
          <button type="submit" [disabled]="form.invalid">Create account</button>
        </form>
        <p *ngIf="success">Registration successful. You can now sign in.</p>
        <div class="server-error" *ngIf="error" role="alert">{{ error }}</div>
        <p class="auth-cta">
          <a routerLink="/">Already have an account? Sign in</a>
        </p>
      </div>
    </div>
  `,
})
export class RegisterPageComponent {
  private readonly fb = inject(FormBuilder);
  private readonly apiService = inject(ApiService);
  success = false;
  error = '';

  form = this.fb.nonNullable.group({
    username: ['', [Validators.required, Validators.minLength(3)]],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
    bio: [''],
  });

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.success = false;
    this.error = '';
    clearDrfServerErrors(this.form);
    this.apiService.register(this.form.getRawValue()).subscribe({
      next: () => {
        this.success = true;
        this.form.reset();
      },
      error: (err) => {
        applyDrfFieldErrors(this.form, err);
        this.error = getApiErrorMessage(err, 'Registration failed.');
      },
    });
  }
}
