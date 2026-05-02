import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { ApiService } from '../services/api.service';
import { AuthService } from '../services/auth.service';
import { getApiErrorMessage } from '../utils/api-error.util';

@Component({
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  template: `
    <div class="auth-shell">
      <div class="auth-card card">
        <h2>Login</h2>
        <form [formGroup]="form" (ngSubmit)="submit()" class="form-stack">
          <div class="field">
            <label for="login-username">Username</label>
            <input id="login-username" formControlName="username" autocomplete="username" />
            <div class="error" *ngIf="form.controls.username.touched && form.controls.username.invalid">
              Username is required.
            </div>
          </div>
          <div class="field">
            <label for="login-password">Password</label>
            <input
              id="login-password"
              type="password"
              formControlName="password"
              autocomplete="current-password"
            />
            <div class="error" *ngIf="form.controls.password.touched && form.controls.password.invalid">
              Password is required.
            </div>
          </div>
          <button type="submit" [disabled]="form.invalid">Sign in</button>
        </form>
        <div class="server-error" *ngIf="error" role="alert">{{ error }}</div>
        <p class="auth-cta">
          <a routerLink="/register">Click here to create an account</a>
        </p>
      </div>
    </div>
  `,
})
export class LoginPageComponent {
  private readonly fb = inject(FormBuilder);
  private readonly apiService = inject(ApiService);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  error = '';

  form = this.fb.nonNullable.group({
    username: ['', [Validators.required]],
    password: ['', [Validators.required]],
  });

  constructor() {
    if (this.authService.isLoggedIn()) {
      void this.router.navigateByUrl('/home');
    }
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.error = '';
    this.apiService.login(this.form.getRawValue()).subscribe({
      next: (response) => {
        this.authService.setTokens(response.access, response.refresh);
        if (response.user) {
          this.authService.setUser(response.user);
        }
        void this.router.navigateByUrl('/home');
      },
      error: (err) => {
        this.error = getApiErrorMessage(err, 'Invalid credentials');
      },
    });
  }
}
