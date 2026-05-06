import { Component, output, inject, HostListener, ElementRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, AbstractControl, ValidationErrors } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../core/services/auth.service';

@Component({
    selector: 'app-header',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule],
    templateUrl: './header.component.html',
    styleUrl: './header.component.scss'
})
export class HeaderComponent {
    menuClick = output<void>();
    private authService = inject(AuthService);
    private elementRef = inject(ElementRef);
    private fb = inject(FormBuilder);

    isUserMenuOpen = false;

    // Change password modal
    isChangePasswordOpen = false;
    changePasswordForm!: FormGroup;
    changePwdLoading = false;
    changePwdSubmitted = false;
    changePwdError = '';
    changePwdSuccess = '';

    get currentUser() {
        return this.authService.currentUserValue;
    }

    toggleUserMenu(event: Event) {
        event.stopPropagation();
        this.isUserMenuOpen = !this.isUserMenuOpen;
    }

    @HostListener('document:click', ['$event'])
    onDocumentClick(event: Event) {
        if (!this.elementRef.nativeElement.contains(event.target)) {
            this.isUserMenuOpen = false;
        }
    }

    // Validator mật khẩu mạnh
    strongPasswordValidator(control: AbstractControl): ValidationErrors | null {
        const value = control.value || '';
        if (!value) return null;
        const errors: { [key: string]: boolean } = {};
        if (!/[A-Z]/.test(value)) errors['noUpperCase'] = true;
        if (!/[a-z]/.test(value)) errors['noLowerCase'] = true;
        if (!/[0-9]/.test(value)) errors['noNumeric'] = true;
        if (!/[@$!%*?&#^()_\-+=~`|{}\[\]:;"'<>,.?/\\]/.test(value)) errors['noSpecial'] = true;
        return Object.keys(errors).length ? errors : null;
    }

    mustMatch(controlName: string, matchingControlName: string) {
        return (formGroup: FormGroup) => {
            const control = formGroup.controls[controlName];
            const matchingControl = formGroup.controls[matchingControlName];
            if (matchingControl.errors && !matchingControl.errors['mustMatch']) return;
            if (control.value !== matchingControl.value) {
                matchingControl.setErrors({ mustMatch: true });
            } else {
                matchingControl.setErrors(null);
            }
        };
    }

    openChangePassword() {
        this.isUserMenuOpen = false;
        this.changePwdSubmitted = false;
        this.changePwdError = '';
        this.changePwdSuccess = '';
        this.changePasswordForm = this.fb.group({
            oldPassword: ['', Validators.required],
            newPassword: ['', [Validators.required, Validators.minLength(8), this.strongPasswordValidator]],
            confirmPassword: ['', Validators.required]
        }, { validator: this.mustMatch('newPassword', 'confirmPassword') });
        this.isChangePasswordOpen = true;
    }

    closeChangePassword() {
        this.isChangePasswordOpen = false;
    }

    get cpg() { return this.changePasswordForm.controls; }

    onChangePasswordSubmit() {
        this.changePwdSubmitted = true;
        this.changePwdError = '';
        this.changePwdSuccess = '';

        if (this.changePasswordForm.invalid) return;

        this.changePwdLoading = true;
        const username = this.currentUser?.username;
        const oldPassword = this.cpg['oldPassword'].value;
        const newPassword = this.cpg['newPassword'].value;

        this.authService.changeFirstTimePassword({ username, oldPassword, newPassword }).subscribe({
            next: () => {
                this.changePwdLoading = false;
                this.changePwdSuccess = 'Đổi mật khẩu thành công!';
                this.changePasswordForm.reset();
                this.changePwdSubmitted = false;
                setTimeout(() => this.closeChangePassword(), 1500);
            },
            error: (err) => {
                this.changePwdLoading = false;
                // Hiển thị thông báo lỗi từ Backend (ví dụ: "Mật khẩu cũ không chính xác")
                this.changePwdError = err.error || 'Đã xảy ra lỗi. Vui lòng thử lại.';
                if (typeof err.error === 'object' && err.error.message) {
                    this.changePwdError = err.error.message;
                }
            }
        });
    }

    logout() {
        this.authService.logout();
    }
}
