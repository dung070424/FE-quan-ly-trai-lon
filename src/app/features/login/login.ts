import { Component, inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './login.html',
  styleUrls: ['./login.scss']
})
export class LoginComponent {
  loginForm: FormGroup;
  loading = false;
  submitted = false;
  error = '';
  returnUrl: string;

  private authService = inject(AuthService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  constructor(private formBuilder: FormBuilder) {
    if (this.authService.currentUserValue) {
      this.router.navigate(['/']);
    }

    this.loginForm = this.formBuilder.group({
      username: ['', Validators.required],
      password: ['', Validators.required]
    });

    this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/';
  }

  get f() { return this.loginForm.controls; }

  onSubmit() {
    this.submitted = true;

    if (this.loginForm.invalid) {
      return;
    }

    this.loading = true;
    this.authService.login({
      username: this.f['username'].value,
      password: this.f['password'].value
    }).subscribe({
      next: () => {
        if (this.returnUrl === '/' || this.returnUrl === '/tong-quan') {
          if (this.authService.isRoleAdmin) {
            this.router.navigate(['/tong-quan']);
          } else if (this.authService.isRoleNhanvien) {
            this.router.navigate(['/quan-ly-kho-cam']);
          } else {
            this.router.navigate(['/']);
          }
        } else {
          this.router.navigate([this.returnUrl]);
        }
      },
      error: error => {
        this.error = 'Tài khoản hoặc mật khẩu không đúng';
        this.loading = false;
      }
    });
  }
}
