import { CountUpDirective } from './count-up.directive';
import { ElementRef } from '@angular/core';

describe('CountUpDirective', () => {
  it('should create an instance', () => {
    const mockElementRef = new ElementRef(document.createElement('div'));
    const directive = new CountUpDirective(mockElementRef);
    expect(directive).toBeTruthy();
  });
});

