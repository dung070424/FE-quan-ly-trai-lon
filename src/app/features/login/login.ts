import { Component, inject, ChangeDetectorRef, NgZone, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { CommonModule } from '@angular/common';
import { interval, Subscription, BehaviorSubject } from 'rxjs';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './login.html',
  styleUrls: ['./login.scss']
})
export class LoginComponent implements OnDestroy {
  loginForm: FormGroup;
  forgotForm: FormGroup;
  resetPasswordForm: FormGroup;
  loading = false;
  submitted = false;
  error = '';
  returnUrl: string;

  isForgotModalOpen = false;
  forgotPasswordStep = 1;
  forgotLoading = false;
  forgotSubmitted = false;
  forgotError = '';
  forgotSuccess = '';

  resetLoading = false;
  resetSubmitted = false;
  resetError = '';

  otpCountdown = 60;
  otpExpired = false;
  private countdownSub: Subscription | null = null;
  countdownDisplay$ = new BehaviorSubject<number>(60);

  private authService = inject(AuthService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private cdr = inject(ChangeDetectorRef);

  constructor(private formBuilder: FormBuilder) {
    if (this.authService.currentUserValue) {
      this.router.navigate(['/']);
    }

    this.loginForm = this.formBuilder.group({
      username: ['', Validators.required],
      password: ['', Validators.required]
    });

    this.forgotForm = this.formBuilder.group({
      username: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]]
    });

    this.resetPasswordForm = this.formBuilder.group({
      code: ['', [Validators.required, Validators.pattern('^[0-9]{6}$')]],
      newPassword: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', Validators.required]
    }, {
      validator: this.mustMatch('newPassword', 'confirmPassword')
    });

    this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/';
  }

  // Custom validator for password match
  mustMatch(controlName: string, matchingControlName: string) {
    return (formGroup: FormGroup) => {
      const control = formGroup.controls[controlName];
      const matchingControl = formGroup.controls[matchingControlName];

      if (matchingControl.errors && !matchingControl.errors['mustMatch']) {
        return;
      }

      if (control.value !== matchingControl.value) {
        matchingControl.setErrors({ mustMatch: true });
      } else {
        matchingControl.setErrors(null);
      }
    };
  }

  get f() { return this.loginForm.controls; }
  get fg() { return this.forgotForm.controls; }
  get rg() { return this.resetPasswordForm.controls; }

  openForgotModal(event: Event) {
    event.preventDefault();
    this.isForgotModalOpen = true;
    this.forgotPasswordStep = 1;
    this.forgotForm.reset();
    this.resetPasswordForm.reset();
    this.forgotSubmitted = false;
    this.resetSubmitted = false;
    this.forgotError = '';
    this.forgotSuccess = '';
    this.resetError = '';
  }

  closeForgotModal() {
    this.isForgotModalOpen = false;
  }

  onForgotSubmit() {
    this.forgotSubmitted = true;
    this.forgotError = '';
    this.forgotSuccess = '';

    if (this.forgotForm.invalid) {
      return;
    }

    this.forgotLoading = true;
    
    // Chuyển màn hình ngay lập tức khi bấm nút
    this.forgotPasswordStep = 2;
    this.startCountdown();
    this.cdr.detectChanges(); 

    this.authService.forgotPassword({
      username: this.fg['username'].value,
      email: this.fg['email'].value
    }).subscribe({
      next: (response) => {
        this.forgotLoading = false;
        try {
          const res = JSON.parse(response);
          this.forgotSuccess = res.message || 'Mã xác nhận 6 số đã được gửi vào email của bạn.';
        } catch (e) {
          this.forgotSuccess = response || 'Mã xác nhận 6 số đã được gửi vào email của bạn.';
        }
        this.cdr.detectChanges(); // Force UI update
      },
      error: (err) => {
        this.forgotLoading = false;
        // Quay lại bước 1 nếu có lỗi
        this.forgotPasswordStep = 1;
        this.stopCountdown();
        if (err.status === 400 && err.error) {
          this.forgotError = err.error;
        } else {
          this.forgotError = 'Đã xảy ra lỗi. Vui lòng thử lại sau.';
        }
        this.cdr.detectChanges();
      }
    });
  }

  startCountdown() {
    this.stopCountdown();
    this.otpCountdown = 60;
    this.otpExpired = false;
    this.countdownDisplay$.next(60);
    let remaining = 60;
    this.countdownSub = interval(1000).subscribe(() => {
      remaining--;
      this.otpCountdown = remaining;
      this.countdownDisplay$.next(remaining);
      if (remaining <= 0) {
        this.otpExpired = true;
        this.stopCountdown();
      }
    });
  }

  stopCountdown() {
    if (this.countdownSub) {
      this.countdownSub.unsubscribe();
      this.countdownSub = null;
    }
  }

  ngOnDestroy() {
    this.stopCountdown();
  }

  switchToStep2() {
    this.forgotPasswordStep = 2;
    this.startCountdown();
    this.cdr.detectChanges();
  }

  resendOtp() {
    this.resetSubmitted = false;
    this.resetError = '';
    this.forgotSuccess = '';
    this.resetPasswordForm.reset();

    // Gửi lại OTP bằng username/email đã nhập từ bước 1
    const username = this.fg['username'].value;
    const email = this.fg['email'].value;

    // Reset đồng hồ và hiển thị trạng thái đang gửi
    this.stopCountdown();
    this.countdownDisplay$.next(60);
    this.otpExpired = false;
    this.forgotSuccess = 'Đang gửi lại mã OTP...';

    this.authService.forgotPassword({ username, email }).subscribe({
      next: () => {
        this.forgotSuccess = 'Mã OTP mới đã được gửi vào email của bạn.';
        this.startCountdown();
      },
      error: (err) => {
        this.forgotSuccess = '';
        this.resetError = err.status === 400 && err.error ? err.error : 'Đã xảy ra lỗi khi gửi lại mã. Vui lòng thử lại.';
        this.startCountdown(); // Vẫn bắt đầu đếm lại dù có lỗi
      }
    });
  }

  onResetSubmit() {
    this.resetSubmitted = true;
    this.resetError = '';
    this.forgotSuccess = '';

    if (this.resetPasswordForm.invalid) {
      return;
    }

    this.resetLoading = true;
    this.authService.resetPassword({
      username: this.fg['username'].value,
      resetCode: this.rg['code'].value,
      newPassword: this.rg['newPassword'].value
    }).subscribe({
      next: (response) => {
        this.resetLoading = false;
        this.closeForgotModal();
        alert("Đặt lại mật khẩu thành công! Bạn có thể đăng nhập bằng mật khẩu mới.");
      },
      error: (err) => {
        this.resetLoading = false;
        if (err.status === 400 && err.error) {
          this.resetError = err.error;
        } else {
          this.resetError = 'Đã xảy ra lỗi. Vui lòng thử lại sau.';
        }
      }
    });
  }

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
