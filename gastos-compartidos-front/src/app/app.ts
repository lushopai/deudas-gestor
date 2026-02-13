import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { LoadingOverlayComponent } from './shared/components/loading-overlay/loading-overlay.component';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, LoadingOverlayComponent],
  template: `
    <router-outlet></router-outlet>
    <app-loading-overlay></app-loading-overlay>
  `,
  styleUrls: ['./app.scss']
})
export class AppComponent {
  title = 'gastos-compartidos-front';

  constructor(private translate: TranslateService) {
    translate.addLangs(['es', 'en']);
    translate.setDefaultLang('es');

    const browserLang = translate.getBrowserLang();
    const savedLang = localStorage.getItem('gastos_lang');
    // Si hay preferencia guardada usarla, sino intentar usar la del navegador si es es/en, sino default (es)
    const langToUse = savedLang || (browserLang && browserLang.match(/en|es/) ? browserLang : 'es');

    translate.use(langToUse);
  }
}
