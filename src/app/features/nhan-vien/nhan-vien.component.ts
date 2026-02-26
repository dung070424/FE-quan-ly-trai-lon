import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, FormsModule, Validators } from '@angular/forms';
import { NhanVienService, Employee } from './nhan-vien.service';

@Component({
    selector: 'app-nhan-vien',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule, FormsModule],
    templateUrl: './nhan-vien.component.html',
    styleUrl: './nhan-vien.component.scss'
})
export class NhanVienComponent implements OnInit {
    employeesData: Employee[] = [];
    searchTerm: string = '';
    currentPage: number = 1;
    itemsPerPage: number = 10;

    get filteredEmployeesData(): Employee[] {
        if (!this.searchTerm.trim()) {
            return this.employeesData;
        }
        const term = this.searchTerm.toLowerCase().trim();
        return this.employeesData.filter(employee =>
            employee.name?.toLowerCase().includes(term) ||
            employee.employeeCode?.toLowerCase().includes(term) ||
            employee.identityCard?.includes(term) ||
            employee.phoneNumber?.includes(term)
        );
    }

    get totalPages(): number {
        return Math.ceil(this.filteredEmployeesData.length / this.itemsPerPage) || 1;
    }

    get paginatedEmployeesData(): Employee[] {
        const startIndex = (this.currentPage - 1) * this.itemsPerPage;
        return this.filteredEmployeesData.slice(startIndex, startIndex + this.itemsPerPage);
    }

    changePage(page: number): void {
        if (page >= 1 && page <= this.totalPages) {
            this.currentPage = page;
        }
    }

    onSearchChange(): void {
        this.currentPage = 1;
    }

    isModalOpen = false;
    isEditing = false;
    currentEmployeeId: number | null = null;
    employeeForm: FormGroup;

    isDeleteModalOpen = false;
    itemToDelete: number | null = null;

    constructor(
        private nhanVienService: NhanVienService,
        private fb: FormBuilder,
        private cdr: ChangeDetectorRef
    ) {
        this.employeeForm = this.fb.group({
            name: ['', Validators.required],
            dateOfBirth: ['', Validators.required],
            phoneNumber: ['', [Validators.required, Validators.pattern('^[0-9]{10,11}$')]],
            identityCard: ['', [Validators.required, Validators.pattern('^[0-9]{9,12}$')]],
            gender: ['Nam', Validators.required],
            address: ['', Validators.required]
        });
    }

    ngOnInit(): void {
        this.loadEmployees();
    }

    loadEmployees(): void {
        this.nhanVienService.getAllEmployees().subscribe({
            next: (data) => {
                // Sắp xếp dữ liệu mới nhất lên đầu (dựa vào id giảm dần)
                this.employeesData = [...data].sort((a, b) => (b.id || 0) - (a.id || 0));
                this.cdr.detectChanges(); // Force UI to update immediately
            },
            error: (err) => {
                console.error('Error fetching employees data', err);
            }
        });
    }

    openModal(employee?: Employee): void {
        this.isModalOpen = true;
        if (employee) {
            this.isEditing = true;
            this.currentEmployeeId = employee.id || null;
            let dobValue = employee.dateOfBirth;
            if (dobValue && dobValue.includes('T')) {
                dobValue = dobValue.split('T')[0];
            }
            this.employeeForm.patchValue({
                name: employee.name,
                dateOfBirth: dobValue || '',
                phoneNumber: employee.phoneNumber || '',
                identityCard: employee.identityCard || '',
                gender: employee.gender || 'Nam',
                address: employee.address || ''
            });
        } else {
            this.isEditing = false;
            this.currentEmployeeId = null;
            this.employeeForm.reset({ gender: 'Nam' });
        }
        this.cdr.detectChanges(); // Ensure the modal shows
    }

    closeModal(): void {
        this.isModalOpen = false;
        this.employeeForm.reset();
        this.cdr.detectChanges(); // Ensure the modal hides
    }

    saveEmployee(): void {
        if (this.employeeForm.invalid) {
            this.employeeForm.markAllAsTouched();
            return;
        }

        const formValue = this.employeeForm.value;

        const payload: Employee = {
            ...formValue,
            dateOfBirth: formValue.dateOfBirth || null
        };

        if (this.isEditing && this.currentEmployeeId) {
            this.nhanVienService.updateEmployee(this.currentEmployeeId, payload).subscribe({
                next: (updatedEmployee) => {
                    const index = this.employeesData.findIndex(s => s.id === this.currentEmployeeId);
                    if (index !== -1) {
                        this.employeesData[index] = updatedEmployee;
                    }
                    this.employeesData = [...this.employeesData].sort((a, b) => (b.id || 0) - (a.id || 0));
                    this.closeModal();
                },
                error: (err) => console.error('Error updating employee', err)
            });
        } else {
            this.nhanVienService.createEmployee(payload).subscribe({
                next: (newEmployee) => {
                    this.employeesData = [newEmployee, ...this.employeesData].sort((a, b) => (b.id || 0) - (a.id || 0));
                    this.closeModal();
                },
                error: (err) => console.error('Error creating employee', err)
            });
        }
    }

    deleteEmployee(id: number | undefined): void {
        if (!id) return;
        this.itemToDelete = id;
        this.isDeleteModalOpen = true;
    }

    confirmDelete(): void {
        if (!this.itemToDelete) return;

        this.nhanVienService.deleteEmployee(this.itemToDelete).subscribe({
            next: () => {
                this.employeesData = this.employeesData.filter(s => s.id !== this.itemToDelete);
                if (this.currentPage > this.totalPages) {
                    this.currentPage = this.totalPages;
                }
                this.isDeleteModalOpen = false;
                this.itemToDelete = null;
                this.cdr.detectChanges(); // Force UI to update
            },
            error: (err) => {
                console.error('Error deleting employee', err);
                this.isDeleteModalOpen = false;
                this.itemToDelete = null;
            }
        });
    }

    cancelDelete(): void {
        this.isDeleteModalOpen = false;
        this.itemToDelete = null;
    }
}
