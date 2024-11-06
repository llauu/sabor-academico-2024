import { Component } from '@angular/core';
import { IonApp, IonRouterOutlet } from '@ionic/angular/standalone';
import { PushNotificationsService } from './services/push-notifications.service';
import { FcmService } from './services/fcm.service';
import { UserService } from './services/user.service';
import { NavigationEnd, Router } from '@angular/router';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  standalone: true,
  imports: [IonApp, IonRouterOutlet],
})
export class AppComponent {
  firstTime: boolean = true;

  constructor(private userService: UserService, private router: Router) { }

  init() {
    this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        this.checkState();
      }
    });
  }
  
  async checkState() {
    if(this.firstTime) {
      const user = await this.userService.getState();

      if(user) {
        this.firstTime = false;
        this.router.navigate(['/home']);
      }
    }
  }
}
