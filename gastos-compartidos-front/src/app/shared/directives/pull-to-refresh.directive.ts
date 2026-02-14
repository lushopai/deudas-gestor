import { Directive, ElementRef, EventEmitter, Output, OnInit, OnDestroy, NgZone } from '@angular/core';

@Directive({
  selector: '[appPullToRefresh]',
  standalone: true
})
export class PullToRefreshDirective implements OnInit, OnDestroy {
  @Output() appPullToRefresh = new EventEmitter<void>();

  private startY = 0;
  private pulling = false;
  private indicator: HTMLElement | null = null;
  private threshold = 120;  // Aumentado de 80 a 120 para ser menos sensible
  private minPullDistance = 20;  // Distancia mínima antes de activar el pull-to-refresh

  private touchStartHandler = (e: TouchEvent) => this.onTouchStart(e);
  private touchMoveHandler = (e: TouchEvent) => this.onTouchMove(e);
  private touchEndHandler = () => this.onTouchEnd();

  constructor(private el: ElementRef, private zone: NgZone) {}

  ngOnInit() {
    const element = this.el.nativeElement;

    // Create indicator element
    this.indicator = document.createElement('div');
    this.indicator.className = 'ptr-indicator';
    this.indicator.innerHTML = '<span class="ptr-spinner"></span><span class="ptr-text">Soltar para actualizar</span>';
    element.style.position = 'relative';
    element.insertBefore(this.indicator, element.firstChild);

    this.zone.runOutsideAngular(() => {
      element.addEventListener('touchstart', this.touchStartHandler, { passive: true });
      element.addEventListener('touchmove', this.touchMoveHandler, { passive: false });
      element.addEventListener('touchend', this.touchEndHandler, { passive: true });
    });
  }

  ngOnDestroy() {
    const element = this.el.nativeElement;
    element.removeEventListener('touchstart', this.touchStartHandler);
    element.removeEventListener('touchmove', this.touchMoveHandler);
    element.removeEventListener('touchend', this.touchEndHandler);
    if (this.indicator && this.indicator.parentNode) {
      this.indicator.parentNode.removeChild(this.indicator);
    }
  }

  private onTouchStart(e: TouchEvent) {
    const scrollTop = this.el.nativeElement.scrollTop || 0;
    if (scrollTop <= 0) {
      this.startY = e.touches[0].clientY;
      this.pulling = true;
    }
  }

  private onTouchMove(e: TouchEvent) {
    if (!this.pulling || !this.indicator) return;

    const currentY = e.touches[0].clientY;
    const diff = currentY - this.startY;

    // Solo activar si el usuario está jalando hacia abajo con suficiente distancia
    if (diff > this.minPullDistance && this.el.nativeElement.scrollTop <= 0) {
      e.preventDefault();
      const progress = Math.min(diff / this.threshold, 1);
      const translateY = Math.min(diff * 0.4, 60);
      this.indicator.style.transform = `translateY(${translateY}px)`;
      this.indicator.style.opacity = `${progress}`;

      if (progress >= 1) {
        this.indicator.classList.add('ptr-ready');
      } else {
        this.indicator.classList.remove('ptr-ready');
      }
    } else if (diff <= 0) {
      // Si el usuario hace scroll hacia arriba, cancelar el pull
      this.pulling = false;
      this.indicator.style.transform = 'translateY(0)';
      this.indicator.style.opacity = '0';
      this.indicator.classList.remove('ptr-ready');
    }
  }

  private onTouchEnd() {
    if (!this.pulling || !this.indicator) return;
    this.pulling = false;

    const wasReady = this.indicator.classList.contains('ptr-ready');

    this.indicator.style.transform = 'translateY(0)';
    this.indicator.style.opacity = '0';
    this.indicator.classList.remove('ptr-ready');

    if (wasReady) {
      this.zone.run(() => this.appPullToRefresh.emit());
    }
  }
}
