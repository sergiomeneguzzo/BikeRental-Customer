import { Component } from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';

@Component({
  selector: 'app-check-email',
  standalone: false,
  templateUrl: './check-email.component.html',
  styleUrl: './check-email.component.scss'
})
export class CheckEmailComponent {

  constructor(
    private router: Router,
  ) {}

  goHome(): void {
    this.router.navigate(['/home']);
  }
}
