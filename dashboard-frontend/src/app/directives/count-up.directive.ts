import { Directive, ElementRef, Input, OnInit } from '@angular/core';

@Directive({
  selector: '[appCountUp]',
  standalone: true
})
export class CountUpDirective implements OnInit {
  @Input() appCountUp: number = 0;
  @Input() duration: number = 1000; // Animation duration in milliseconds

  constructor(private el: ElementRef) {}

  ngOnInit() {
    this.animateCount();
  }

  private animateCount() {
    const element = this.el.nativeElement;
    const target = this.appCountUp;
    const increment = target / (this.duration / 16); // 60fps
    let current = 0;

    const timer = setInterval(() => {
      current += increment;
      if (current >= target) {
        element.textContent = this.formatNumber(target);
        clearInterval(timer);
      } else {
        element.textContent = this.formatNumber(Math.floor(current));
      }
    }, 16);
  }

  private formatNumber(num: number): string {
    return num.toLocaleString();
  }
}
