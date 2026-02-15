import { Component, ChangeDetectionStrategy, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-settings-language',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatIconModule,
    MatDividerModule,
    TranslateModule
  ],
  template: `
    <mat-card class="settings-section">
      <div class="section-header">
        <mat-icon class="section-icon">language</mat-icon>
        <span class="section-title">{{ 'SETTINGS.LANGUAGE' | translate }}</span>
      </div>
      <mat-divider></mat-divider>

      <div class="setting-item clickable" (click)="selectLanguage('es')">
        <div class="setting-info">
          <span class="flag">🇪🇸</span>
          <div class="setting-text">
            <span class="setting-label">Español</span>
          </div>
        </div>
        <mat-icon *ngIf="currentLang === 'es'" color="primary">check</mat-icon>
      </div>

      <div class="setting-item clickable" (click)="selectLanguage('en')">
        <div class="setting-info">
          <span class="flag">🇺🇸</span>
          <div class="setting-text">
            <span class="setting-label">English</span>
          </div>
        </div>
        <mat-icon *ngIf="currentLang === 'en'" color="primary">check</mat-icon>
      </div>
    </mat-card>
  `,
  styles: [`
    .settings-section {
      border-radius: 12px;
      overflow: hidden;
    }

    .section-header {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 16px;

      .section-icon {
        color: var(--primary-color, #1976d2);
        font-size: 22px;
        width: 22px;
        height: 22px;
      }

      .section-title {
        font-size: 16px;
        font-weight: 600;
        color: var(--text-primary, rgba(0,0,0,0.87));
      }
    }

    .setting-item {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 14px 16px;
      border-bottom: 1px solid var(--border-color, rgba(0,0,0,0.06));

      &:last-child {
        border-bottom: none;
      }
    }

    .setting-info {
      display: flex;
      align-items: center;
      gap: 14px;
      flex: 1;
    }

    .setting-text {
      display: flex;
      flex-direction: column;
    }

    .setting-label {
      font-size: 14px;
      font-weight: 500;
      color: var(--text-primary, rgba(0,0,0,0.87));
    }

    .clickable {
      cursor: pointer;
      &:hover {
        background-color: rgba(0,0,0,0.04);
      }
    }

    .flag {
      font-size: 24px;
      margin-right: 8px;
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SettingsLanguageComponent {
  @Input({ required: true }) currentLang!: string;
  @Output() languageChanged = new EventEmitter<string>();

  selectLanguage(lang: string): void {
    this.languageChanged.emit(lang);
  }
}
