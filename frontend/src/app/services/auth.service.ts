import { Injectable, signal } from '@angular/core';
import type { AuthUser } from '../models/auth-user.model';
import { resolveMediaUrl } from '../utils/media-url.util';

const ACCESS = 'access_token';
const REFRESH = 'refresh_token';
const USER_JSON = 'skill_exchange_user';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly loggedIn = signal(this.hasStoredToken());
  private readonly userSignal = signal<AuthUser | null>(this.readStoredUser());

  readonly isLoggedIn = this.loggedIn.asReadonly();
  readonly user = this.userSignal.asReadonly();

  setTokens(access: string, refresh: string): void {
    localStorage.setItem(ACCESS, access);
    localStorage.setItem(REFRESH, refresh);
    this.loggedIn.set(true);
  }

  setUser(raw: unknown): void {
    if (!raw || typeof raw !== 'object') return;
    const u = this.normalizeUser(raw as Record<string, unknown>);
    this.userSignal.set(u);
    localStorage.setItem(USER_JSON, JSON.stringify(u));
  }

  getAccessToken(): string | null {
    return localStorage.getItem(ACCESS);
  }

  getRefreshToken(): string | null {
    return localStorage.getItem(REFRESH);
  }

  /** After `/api/token/refresh/` — updates access; optional new refresh if server rotates tokens. */
  updateAccessToken(access: string, newRefresh?: string): void {
    localStorage.setItem(ACCESS, access);
    if (newRefresh) {
      localStorage.setItem(REFRESH, newRefresh);
    }
    this.loggedIn.set(true);
  }

  logout(): void {
    localStorage.removeItem(ACCESS);
    localStorage.removeItem(REFRESH);
    localStorage.removeItem(USER_JSON);
    this.loggedIn.set(false);
    this.userSignal.set(null);
  }

  private hasStoredToken(): boolean {
    return !!localStorage.getItem(ACCESS);
  }

  private readStoredUser(): AuthUser | null {
    const raw = localStorage.getItem(USER_JSON);
    if (!raw) return null;
    try {
      return JSON.parse(raw) as AuthUser;
    } catch {
      return null;
    }
  }

  private normalizeUser(raw: Record<string, unknown>): AuthUser {
    return {
      id: Number(raw['id']),
      username: String(raw['username'] ?? ''),
      email: String(raw['email'] ?? ''),
      first_name: String(raw['first_name'] ?? ''),
      last_name: String(raw['last_name'] ?? ''),
      bio: String(raw['bio'] ?? ''),
      profile_image: resolveMediaUrl(raw['profile_image'] as string | null | undefined),
      cv_file: resolveMediaUrl(raw['cv_file'] as string | null | undefined),
      date_joined: raw['date_joined'] != null ? String(raw['date_joined']) : undefined,
      last_login: raw['last_login'] != null ? String(raw['last_login']) : null,
    };
  }
}
