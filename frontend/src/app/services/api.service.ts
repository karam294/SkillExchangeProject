import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { API_BASE } from '../api-constants';
import type { AuthUser } from '../models/auth-user.model';
import { AuthService } from './auth.service';

export interface ProfileUpdatePayload {
  first_name?: string;
  last_name?: string;
  bio?: string;
}

export type PublicUser = Pick<
  AuthUser,
  'id' | 'username' | 'first_name' | 'last_name' | 'bio' | 'profile_image' | 'date_joined'
>;

export interface UserDirectoryEntry {
  id: number;
  username: string;
  first_name: string;
  last_name: string;
  profile_image: string | null;
}

@Injectable({ providedIn: 'root' })
export class ApiService {
  private readonly http = inject(HttpClient);
  private readonly authService = inject(AuthService);

  register(payload: Record<string, unknown>): Observable<unknown> {
    return this.http.post(`${API_BASE}/users/register/`, payload);
  }

  login(payload: { username: string; password: string }): Observable<any> {
    return this.http.post(`${API_BASE}/users/login/`, payload);
  }

  getPublicUser(userId: number): Observable<PublicUser> {
    return this.http.get<PublicUser>(`${API_BASE}/users/${userId}/`, { headers: this.authHeaders() });
  }

  getUserDirectory(): Observable<UserDirectoryEntry[]> {
    return this.http.get<UserDirectoryEntry[]>(`${API_BASE}/users/directory/`, { headers: this.authHeaders() });
  }

  getProfile(): Observable<AuthUser> {
    return this.http.get<AuthUser>(`${API_BASE}/users/me/`, { headers: this.authHeaders() });
  }

  updateProfile(
    fields: ProfileUpdatePayload,
    files?: { profile_image?: File | null; cv_file?: File | null },
  ): Observable<AuthUser> {
    const hasFile = !!(files?.profile_image || files?.cv_file);
    if (hasFile) {
      const fd = new FormData();
      for (const [k, v] of Object.entries(fields)) {
        if (v !== undefined && v !== null && v !== '') {
          fd.append(k, String(v));
        }
      }
      if (files?.profile_image) fd.append('profile_image', files.profile_image);
      if (files?.cv_file) fd.append('cv_file', files.cv_file);
      return this.http.patch<AuthUser>(`${API_BASE}/users/me/`, fd, { headers: this.authHeadersMultipart() });
    }
    return this.http.patch<AuthUser>(`${API_BASE}/users/me/`, fields, { headers: this.authHeaders() });
  }

  getSkills(search = ''): Observable<any[]> {
    const query = search ? `?search=${encodeURIComponent(search)}` : '';
    return this.http.get<any[]>(`${API_BASE}/skills/${query}`, { headers: this.authHeaders() });
  }

  createSkill(payload: Record<string, unknown>): Observable<unknown> {
    return this.http.post(`${API_BASE}/skills/`, payload, { headers: this.authHeaders() });
  }

  getOffers(search = '', options?: { mine?: boolean }): Observable<any[]> {
    const params = new URLSearchParams();
    if (search) params.set('search', search);
    if (options?.mine) params.set('mine', '1');
    const q = params.toString() ? `?${params.toString()}` : '';
    return this.http.get<any[]>(`${API_BASE}/offers/${q}`, { headers: this.authHeaders() });
  }

  getOffer(id: number): Observable<any> {
    return this.http.get(`${API_BASE}/offers/${id}/`, { headers: this.authHeaders() });
  }

  createOffer(payload: Record<string, unknown>): Observable<unknown> {
    return this.http.post(`${API_BASE}/offers/`, payload, { headers: this.authHeaders() });
  }
  deleteOffer(id: number): Observable<any> {
  return this.http.delete(`${API_BASE}/offers/${id}/`, {
    headers: this.authHeaders(),
  });
}

  getRequests(role?: 'provider' | 'requester' | 'all'): Observable<any[]> {
    const roleParam = role && role !== 'all' ? `?role=${role}` : '';
    return this.http.get<any[]>(`${API_BASE}/requests/${roleParam}`, { headers: this.authHeaders() });
  }

  createRequest(payload: { offer: number; message: string }): Observable<unknown> {
    return this.http.post(`${API_BASE}/requests/`, payload, { headers: this.authHeaders() });
  }

  updateRequestStatus(id: number, status: 'accepted' | 'rejected'): Observable<unknown> {
    return this.http.patch(`${API_BASE}/requests/${id}/`, { status }, { headers: this.authHeaders() });
  }

  getReviewsByUser(userId: number): Observable<any[]> {
    return this.http.get<any[]>(`${API_BASE}/reviews/${userId}/`, { headers: this.authHeaders() });
  }

  getMyReviewsGiven(): Observable<any[]> {
    return this.http.get<any[]>(`${API_BASE}/reviews/my/given/`, { headers: this.authHeaders() });
  }

  getMyReviewsReceived(): Observable<any[]> {
    return this.http.get<any[]>(`${API_BASE}/reviews/my/received/`, { headers: this.authHeaders() });
  }

  createReview(payload: { reviewed_user: number; rating: number; comment: string }): Observable<unknown> {
    return this.http.post(`${API_BASE}/reviews/`, payload, { headers: this.authHeaders() });
  }

  private authHeaders(): HttpHeaders {
    const token = this.authService.getAccessToken();
    return token ? new HttpHeaders({ Authorization: `Bearer ${token}` }) : new HttpHeaders();
  }

  private authHeadersMultipart(): HttpHeaders {
    const token = this.authService.getAccessToken();
    return token ? new HttpHeaders({ Authorization: `Bearer ${token}` }) : new HttpHeaders();
  }
}
