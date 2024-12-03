import { Component, OnInit } from '@angular/core';
import { AccountService } from 'src/app/core/auth/account.service';
import { Router } from '@angular/router';
import { Authority } from 'src/app/shared/constants/authority.constants';

@Component({
  selector: 'app-home-redirect',
  templateUrl: './home-redirect.page.html',
  styleUrls: ['./home-redirect.page.scss'],
  standalone: true,
  imports: []
})
export class HomeRedirectPage implements OnInit {

  constructor(private accountService: AccountService, private router: Router) { }

  ngOnInit() {
    this.accountService.identity().subscribe((account) => {
      if (account?.authorities.includes(Authority.ADMIN)) {
        this.router.navigate(['/admin']);
      } else {
        this.router.navigate(['/projects']);
      }
    });
  }
}
