import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, FormsModule, Validators } from '@angular/forms';
import { ThuocService, Medicine } from './thuoc.service';

@Component({
    selector: 'app-thuoc',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule, FormsModule],
    templateUrl: './thuoc.component.html',
    styleUrl: './thuoc.component.scss'
})
export class ThuocComponent implements OnInit {
    medicinesData: Medicine[] = [];
    searchTerm: string = '';
    currentPage: number = 1;
    itemsPerPage: number = 10;

    get filteredMedicinesData(): Medicine[] {
        if (!this.searchTerm.trim()) {
            return this.medicinesData;
        }
        const term = this.searchTerm.toLowerCase().trim();
        return this.medicinesData.filter(medicine =>
            medicine.name?.toLowerCase().includes(term) ||
            medicine.medicineCode?.toLowerCase().includes(term) ||
            medicine.manufacturer?.toLowerCase().includes(term)
        );
    }

    get totalPages(): number {
        return Math.ceil(this.filteredMedicinesData.length / this.itemsPerPage) || 1;
    }

    get paginatedMedicinesData(): Medicine[] {
        const startIndex = (this.currentPage - 1) * this.itemsPerPage;
        return this.filteredMedicinesData.slice(startIndex, startIndex + this.itemsPerPage);
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
    currentMedicineId: number | null = null;
    medicineForm: FormGroup;

    isDeleteModalOpen = false;
    itemToDelete: number | null = null;

    constructor(
        private thuocService: ThuocService,
        private fb: FormBuilder,
        private cdr: ChangeDetectorRef
    ) {
        this.medicineForm = this.fb.group({
            name: ['', Validators.required],
            manufacturer: ['', Validators.required],
            expiryDate: [''],
            note: ['']
        });
    }

    ngOnInit(): void {
        this.loadMedicines();
    }

    loadMedicines(): void {
        this.thuocService.getAllMedicines().subscribe({
            next: (data) => {
                this.medicinesData = [...data].sort((a, b) => (b.id || 0) - (a.id || 0));
                this.cdr.detectChanges();
            },
            error: (err) => {
                console.error('Error fetching medicines data', err);
            }
        });
    }

    openModal(medicine?: Medicine): void {
        this.isModalOpen = true;
        if (medicine) {
            this.isEditing = true;
            this.currentMedicineId = medicine.id || null;
            let expValue = medicine.expiryDate;
            if (expValue && expValue.includes('T')) {
                expValue = expValue.split('T')[0];
            }
            this.medicineForm.patchValue({
                name: medicine.name,
                manufacturer: medicine.manufacturer || '',
                expiryDate: expValue || '',
                note: medicine.note || ''
            });
        } else {
            this.isEditing = false;
            this.currentMedicineId = null;
            this.medicineForm.reset();
        }
        this.cdr.detectChanges();
    }

    closeModal(): void {
        this.isModalOpen = false;
        this.medicineForm.reset();
        this.cdr.detectChanges();
    }

    saveMedicine(): void {
        if (this.medicineForm.invalid) {
            this.medicineForm.markAllAsTouched();
            return;
        }

        const formValue = this.medicineForm.value;

        const payload: Medicine = {
            ...formValue,
            expiryDate: formValue.expiryDate || null
        };

        if (this.isEditing && this.currentMedicineId) {
            this.thuocService.updateMedicine(this.currentMedicineId, payload).subscribe({
                next: (updatedMedicine) => {
                    const index = this.medicinesData.findIndex(s => s.id === this.currentMedicineId);
                    if (index !== -1) {
                        this.medicinesData[index] = updatedMedicine;
                    }
                    this.medicinesData = [...this.medicinesData].sort((a, b) => (b.id || 0) - (a.id || 0));
                    this.closeModal();
                },
                error: (err) => console.error('Error updating medicine', err)
            });
        } else {
            this.thuocService.createMedicine(payload).subscribe({
                next: (newMedicine) => {
                    this.medicinesData = [newMedicine, ...this.medicinesData].sort((a, b) => (b.id || 0) - (a.id || 0));
                    this.closeModal();
                },
                error: (err) => console.error('Error creating medicine', err)
            });
        }
    }

    deleteMedicine(id: number | undefined): void {
        if (!id) return;
        this.itemToDelete = id;
        this.isDeleteModalOpen = true;
    }

    confirmDelete(): void {
        if (!this.itemToDelete) return;

        this.thuocService.deleteMedicine(this.itemToDelete).subscribe({
            next: () => {
                this.medicinesData = this.medicinesData.filter(s => s.id !== this.itemToDelete);
                if (this.currentPage > this.totalPages) {
                    this.currentPage = this.totalPages;
                }
                this.isDeleteModalOpen = false;
                this.itemToDelete = null;
                this.cdr.detectChanges();
            },
            error: (err) => {
                console.error('Error deleting medicine', err);
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
