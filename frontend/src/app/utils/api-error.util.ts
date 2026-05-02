import { HttpErrorResponse } from '@angular/common/http';
import type { FormGroup } from '@angular/forms';

function parseErrorBody(body: unknown): unknown {
  if (typeof body === 'string') {
    const t = body.trim();
    if (t.startsWith('{') || t.startsWith('[')) {
      try {
        return JSON.parse(t) as unknown;
      } catch {
        return body;
      }
    }
    return body;
  }
  return body;
}

/**
 * Turns typical Django REST Framework (and similar) JSON error bodies into a single message.
 */
export function getApiErrorMessage(error: unknown, fallback: string): string {
  if (!(error instanceof HttpErrorResponse)) {
    return fallback;
  }

  if (error.error instanceof ProgressEvent) {
    return error.status
      ? `${fallback} (HTTP ${error.status}, check CORS / network)`
      : `${fallback} (network or CORS — browser may hide response body)`;
  }

  let body = parseErrorBody(error.error);

  if (typeof body === 'string' && body.trim()) {
    return body;
  }

  if (!body || typeof body !== 'object') {
    return error.status ? `${fallback} (HTTP ${error.status})` : fallback;
  }

  const record = body as Record<string, unknown>;
  const detail = record['detail'];

  if (typeof detail === 'string' && detail.trim()) {
    return detail;
  }

  if (Array.isArray(detail) && detail.length) {
    return detail.map((item) => (typeof item === 'string' ? item : JSON.stringify(item))).join(' ');
  }

  const errMsg = record['error'];
  if (typeof errMsg === 'string' && errMsg.trim()) {
    return errMsg;
  }

  const message = record['message'];
  if (typeof message === 'string' && message.trim()) {
    return message;
  }

  const nonField = record['non_field_errors'];
  if (Array.isArray(nonField) && nonField.length) {
    return nonField.map((item) => (typeof item === 'string' ? item : JSON.stringify(item))).join(' ');
  }

  const jwtMessages = record['messages'];
  if (Array.isArray(jwtMessages) && jwtMessages.length) {
    const parts = jwtMessages.map((m) => {
      if (m && typeof m === 'object' && 'message' in m) {
        return String((m as Record<string, unknown>)['message']);
      }
      return typeof m === 'string' ? m : JSON.stringify(m);
    });
    return parts.filter(Boolean).join(' ');
  }

  const fieldParts: string[] = [];
  for (const [key, val] of Object.entries(record)) {
    if (key === 'detail' || key === 'non_field_errors') continue;
    if (Array.isArray(val)) {
      const joined = val.map((item) => (typeof item === 'string' ? item : JSON.stringify(item))).join(', ');
      if (joined) fieldParts.push(`${key}: ${joined}`);
    } else if (typeof val === 'string' && val.trim()) {
      fieldParts.push(`${key}: ${val}`);
    }
  }

  if (fieldParts.length) {
    return fieldParts.join('; ');
  }

  return error.status ? `${fallback} (HTTP ${error.status})` : fallback;
}

/** Clears only `server` errors set by {@link applyDrfFieldErrors}. */
export function clearDrfServerErrors(form: FormGroup): void {
  for (const c of Object.values(form.controls)) {
    const errors = c.errors;
    if (!errors || !('server' in errors)) continue;
    const next = { ...errors };
    delete next['server'];
    c.setErrors(Object.keys(next).length ? next : null);
  }
}

/** Maps DRF field error arrays onto matching form controls (error key `server`). */
export function applyDrfFieldErrors(form: FormGroup, error: unknown): void {
  if (!(error instanceof HttpErrorResponse)) return;
  const raw = parseErrorBody(error.error);
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return;
  const body = raw as Record<string, unknown>;

  for (const [key, val] of Object.entries(body)) {
    if (key === 'detail' || key === 'non_field_errors') continue;
    const control = form.get(key);
    if (!control || !Array.isArray(val)) continue;
    const msg = val.map((item) => (typeof item === 'string' ? item : JSON.stringify(item))).join(' ');
    if (!msg) continue;
    const merged = { ...control.errors, server: msg };
    control.setErrors(merged);
  }
}
