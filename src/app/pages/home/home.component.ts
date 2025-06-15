import { AfterViewInit, Component } from '@angular/core';

@Component({
  selector: 'app-home',
  standalone: false,
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent implements AfterViewInit {

  ngAfterViewInit() {
    // Crea la timeline principale
    const tl = gsap.timeline({
      defaults: {
        duration: 0.8,
        ease: 'power3.inOut'
      }
    });

    // Anima tutti gli span.reveal-text
    tl.to('.reveal-text', {
      yPercent: 0,         // da translateY(100%) → 0
      opacity: 1,          // da trasparente → visibile
      stagger: 0.15,       // ritardo tra uno e l'altro
      delay: 0.5           // attende mezzo secondo all'avvio
    });
  }

}