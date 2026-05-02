import { CommonModule } from '@angular/common';
import {
  Component,
  ElementRef,
  HostListener,
  computed,
  inject,
  input,
  output,
  signal,
} from '@angular/core';

export interface EntityOption {
  id: number;
  label: string;
  sublabel?: string;
  imageUrl?: string | null;
}

@Component({
  selector: 'app-entity-picker',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="entity-picker">
      @if (label()) {
        <span class="entity-picker-label">{{ label() }}</span>
      }
      <button type="button" class="entity-picker-trigger" (click)="toggle($event)">
        @if (selected(); as sel) {
          @if (sel.imageUrl) {
            <img [src]="sel.imageUrl" alt="" class="entity-picker-img" />
          } @else {
            <span class="entity-picker-initials">{{ initialsFor(sel) }}</span>
          }
          <span class="entity-picker-text">
            <span class="entity-picker-line">{{ sel.label }}</span>
            @if (sel.sublabel) {
              <span class="entity-picker-sub">{{ sel.sublabel }}</span>
            }
          </span>
        } @else {
          <span class="entity-picker-placeholder">{{ placeholder() }}</span>
        }
      </button>
      @if (open()) {
        <ul class="entity-picker-panel" (click)="$event.stopPropagation()" role="listbox">
          @for (o of options(); track o.id) {
            <li
              role="option"
              [class.entity-picker-item--active]="o.id === value()"
              (click)="pick(o, $event)"
            >
              @if (o.imageUrl) {
                <img [src]="o.imageUrl" alt="" class="entity-picker-img entity-picker-img--sm" />
              } @else {
                <span class="entity-picker-initials entity-picker-initials--sm">{{ initialsFor(o) }}</span>
              }
              <div>
                <div class="entity-picker-line">{{ o.label }}</div>
                @if (o.sublabel) {
                  <div class="entity-picker-sub">{{ o.sublabel }}</div>
                }
              </div>
            </li>
          }
        </ul>
      }
    </div>
  `,
  styles: [
    `
      .entity-picker {
        position: relative;
        width: 100%;
      }
      .entity-picker-label {
        display: block;
        font-size: 0.9rem;
        margin-bottom: 0.25rem;
      }
      .entity-picker-trigger {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        width: 100%;
        min-height: 2.6rem;
        padding: 0.45rem 0.6rem;
        border: 1px solid #d1d5db;
        border-radius: 6px;
        background: #fff;
        cursor: pointer;
        text-align: left;
        color: #111827;
        font-weight: 500;
      }
      .entity-picker-trigger:hover {
        border-color: #93c5fd;
      }
      .entity-picker-img {
        width: 36px;
        height: 36px;
        border-radius: 50%;
        object-fit: cover;
        flex-shrink: 0;
      }
      .entity-picker-img--sm {
        width: 32px;
        height: 32px;
      }
      .entity-picker-initials {
        width: 36px;
        height: 36px;
        border-radius: 50%;
        background: #4b5563;
        color: #fff;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        font-size: 0.75rem;
        flex-shrink: 0;
      }
      .entity-picker-initials--sm {
        width: 32px;
        height: 32px;
        font-size: 0.7rem;
      }
      .entity-picker-text {
        display: flex;
        flex-direction: column;
        min-width: 0;
      }
      .entity-picker-line {
        font-size: 0.9rem;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
      .entity-picker-sub {
        font-size: 0.75rem;
        color: #6b7280;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
      .entity-picker-placeholder {
        color: #9ca3af;
        font-weight: 400;
      }
      .entity-picker-panel {
        list-style: none;
        margin: 0.25rem 0 0;
        padding: 0.25rem;
        position: absolute;
        left: 0;
        right: 0;
        z-index: 40;
        max-height: 240px;
        overflow-y: auto;
        background: #fff;
        border: 1px solid #e5e7eb;
        border-radius: 8px;
        box-shadow: 0 10px 24px rgba(0, 0, 0, 0.12);
      }
      .entity-picker-panel li {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        padding: 0.45rem 0.5rem;
        border-radius: 6px;
        cursor: pointer;
      }
      .entity-picker-panel li:hover {
        background: #f3f4f6;
      }
      .entity-picker-item--active {
        background: #eff6ff !important;
      }
    `,
  ],
})
export class EntityPickerComponent {
  private readonly el = inject(ElementRef);

  options = input.required<EntityOption[]>();
  value = input<number | null>(null);
  label = input('');
  placeholder = input('Choose…');

  valueChange = output<number | null>();

  readonly open = signal(false);

  readonly selected = computed(() => {
    const v = this.value();
    if (v == null) return null;
    return this.options().find((o) => o.id === v) ?? null;
  });

  initialsFor(o: EntityOption): string {
    const parts = o.label.trim().split(/\s+/).filter(Boolean);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    if (o.sublabel) {
      const p2 = o.sublabel.trim().split(/\s+/).filter(Boolean);
      if (p2.length >= 2) {
        return (p2[0][0] + p2[1][0]).toUpperCase();
      }
    }
    const t = o.label.trim();
    return t.length >= 2 ? t.slice(0, 2).toUpperCase() : (t[0] || '?').toUpperCase();
  }

  toggle(ev: Event): void {
    ev.stopPropagation();
    this.open.update((v) => !v);
  }

  pick(o: EntityOption, ev: Event): void {
    ev.stopPropagation();
    this.valueChange.emit(o.id);
    this.open.set(false);
  }

  @HostListener('document:click', ['$event'])
  onDoc(ev: MouseEvent): void {
    if (!this.open()) return;
    const t = ev.target as Node;
    if (this.el.nativeElement.contains(t)) return;
    this.open.set(false);
  }
}
