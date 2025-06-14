import { AfterViewInit, Component } from '@angular/core';
import { gsap } from 'gsap';

@Component({
  selector: 'app-section-prices',
  standalone: false,
  templateUrl: './section-prices.component.html',
  styleUrl: './section-prices.component.scss'
})
export class SectionPricesComponent implements AfterViewInit {

  ngAfterViewInit(): void {
    // Seleziono tutti gli elementi "toggle"
    document.querySelectorAll('[data-collapse]').forEach(container => {
      const header = container.querySelector('.acc-block');
      const panel = container.nextElementSibling as HTMLElement | null;
      if (!header || !panel) {
        return;
      }
      const items = Array.from(panel.children);

      // Inizialmente nascondo il pannello
      gsap.set(panel, { height: 0, overflow: 'hidden' });
      gsap.set(items, { autoAlpha: 0, y: 40 });

      // Creo la timeline
      const tl = gsap.timeline({ paused: true, reversed: true })
        .to(panel, {
          height: () => panel.scrollHeight,
          duration: 0.8,
          ease: "expo.inOut"
        }, 0)
        .to(items, {
          autoAlpha: 1,
          y: 0,
          duration: 0.6,
          ease: "expo.inOut",
          stagger: 0.08
        }, 0.1);

      // Gestisco il click
      header.addEventListener('click', () => {
        tl.reversed() ? tl.play() : tl.reverse();
      });
    });
  }
}
