import { Component } from '@angular/core';
import { NotificationService } from './services/notification.service';
import { AuthService } from './services/auth.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
  standalone: false,
})
export class AppComponent {
  isClosed = false;
  isLoading = false;
  currentUser$;

  toggleSidebar() {
    this.isClosed = !this.isClosed;
  }

  constructor(
    public authSrv: AuthService,
    private notificationService: NotificationService
  ) {
    this.currentUser$ = this.authSrv.currentUser$;

    this.authSrv.loading$.subscribe((loading) => {
      this.isLoading = loading;
    });
  }

  logout(): void {
    this.authSrv.logout();
  }
}
