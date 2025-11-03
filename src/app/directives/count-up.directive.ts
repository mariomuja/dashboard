import { Directive, ElementRef, Input, OnInit, OnChanges, SimpleChanges } from '@angular/core';

@Directive({
  selector: '[appCountUp]'
})
export class CountUpDirective implements OnInit, OnChanges {
  @Input() appCountUp: string = '0';
  @Input() duration: number = 2000;

  constructor(private el: ElementRef) { }

  ngOnInit(): void {
    this.animateCount();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['appCountUp'] && !changes['appCountUp'].firstChange) {
      this.animateCount();
    }
  }

  private animateCount(): void {
    const value = this.appCountUp;
    
    if (!value || !this.el || !this.el.nativeElement) {
      return;
    }
    
    // Extract numeric value and formatting
    const numericMatch = value.match(/[\d,\.]+/);
    if (!numericMatch) {
      this.el.nativeElement.textContent = value;
      return;
    }

    const numericStr = numericMatch[0].replace(/,/g, '');
    const targetNumber = parseFloat(numericStr);
    
    if (isNaN(targetNumber)) {
      this.el.nativeElement.textContent = value;
      return;
    }

    // Get prefix and suffix
    const prefix = value.substring(0, value.indexOf(numericMatch[0]));
    const suffix = value.substring(value.indexOf(numericMatch[0]) + numericMatch[0].length);

    const startTime = performance.now();
    let animationFrame: number;
    
    const animate = (currentTime: number) => {
      if (!this.el || !this.el.nativeElement) {
        if (animationFrame) {
          cancelAnimationFrame(animationFrame);
        }
        return;
      }
      
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / this.duration, 1);
      
      // Easing function
      const easeOutQuad = progress * (2 - progress);
      const current = targetNumber * easeOutQuad;

      // Format the number
      let formattedNumber: string;
      if (numericMatch[0].includes('.')) {
        const decimals = numericMatch[0].split('.')[1].length;
        formattedNumber = current.toFixed(decimals);
      } else {
        formattedNumber = Math.floor(current).toString();
      }

      // Add commas if original had them
      if (numericMatch[0].includes(',')) {
        formattedNumber = formattedNumber.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
      }

      this.el.nativeElement.textContent = prefix + formattedNumber + suffix;

      if (progress < 1) {
        animationFrame = requestAnimationFrame(animate);
      }
    };

    animationFrame = requestAnimationFrame(animate);
  }
}

