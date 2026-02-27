import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, FormsModule, Validators } from '@angular/forms';
import { CamService, Cam } from './cam.service';

@Component({
    selector: 'app-cam',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule, FormsModule],
    templateUrl: './cam.component.html',
    styleUrl: './cam.component.scss'
})
export class CamComponent implements OnInit {
    camsData: Cam[] = [];
    searchTerm: string = '';
    currentPage: number = 1;
    itemsPerPage: number = 10;

    get filteredCamsData(): Cam[] {
        if (!this.searchTerm.trim()) {
            return this.camsData;
        }
        const term = this.searchTerm.toLowerCase().trim();
        return this.camsData.filter(cam =>
            cam.name?.toLowerCase().includes(term) ||
            cam.camCode?.toLowerCase().includes(term) ||
            cam.manufacturer?.toLowerCase().includes(term)
        );
    }

    get totalPages(): number {
        return Math.ceil(this.filteredCamsData.length / this.itemsPerPage) || 1;
    }

    get paginatedCamsData(): Cam[] {
        const startIndex = (this.currentPage - 1) * this.itemsPerPage;
        return this.filteredCamsData.slice(startIndex, startIndex + this.itemsPerPage);
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
    currentCamId: number | null = null;
    camForm: FormGroup;

    isDeleteModalOpen = false;
    itemToDelete: number | null = null;

    constructor(
        private camService: CamService,
        private fb: FormBuilder,
        private cdr: ChangeDetectorRef
    ) {
        this.camForm = this.fb.group({
            name: ['', Validators.required],
            manufacturer: ['', Validators.required],
            expiryDate: [''],
            note: ['']
        });
    }

    ngOnInit(): void {
        this.loadCams();
    }

    loadCams(): void {
        this.camService.getAllCams().subscribe({
            next: (data) => {
                this.camsData = [...data].sort((a, b) => (b.id || 0) - (a.id || 0));
                this.cdr.detectChanges();
            },
            error: (err) => {
                console.error('Error fetching cams data', err);
            }
        });
    }

    openModal(cam?: Cam): void {
        this.isModalOpen = true;
        if (cam) {
            this.isEditing = true;
            this.currentCamId = cam.id || null;
            let expValue = cam.expiryDate;
            if (expValue && expValue.includes('T')) {
                expValue = expValue.split('T')[0];
            }
            this.camForm.patchValue({
                name: cam.name,
                manufacturer: cam.manufacturer || '',
                expiryDate: expValue || '',
                note: cam.note || ''
            });
        } else {
            this.isEditing = false;
            this.currentCamId = null;
            this.camForm.reset();
        }
        this.cdr.detectChanges();
    }

    closeModal(): void {
        this.isModalOpen = false;
        this.camForm.reset();
        this.cdr.detectChanges();
    }

    saveCam(): void {
        if (this.camForm.invalid) {
            this.camForm.markAllAsTouched();
            return;
        }

        const formValue = this.camForm.value;

        const payload: Cam = {
            ...formValue,
            expiryDate: formValue.expiryDate || null
        };

        if (this.isEditing && this.currentCamId) {
            this.camService.updateCam(this.currentCamId, payload).subscribe({
                next: (updatedCam) => {
                    const index = this.camsData.findIndex(s => s.id === this.currentCamId);
                    if (index !== -1) {
                        this.camsData[index] = updatedCam;
                    }
                    this.camsData = [...this.camsData].sort((a, b) => (b.id || 0) - (a.id || 0));
                    this.closeModal();
                },
                error: (err) => console.error('Error updating cam', err)
            });
        } else {
            this.camService.createCam(payload).subscribe({
                next: (newCam) => {
                    this.camsData = [newCam, ...this.camsData].sort((a, b) => (b.id || 0) - (a.id || 0));
                    this.closeModal();
                },
                error: (err) => console.error('Error creating cam', err)
            });
        }
    }

    deleteCam(id: number | undefined): void {
        if (!id) return;
        this.itemToDelete = id;
        this.isDeleteModalOpen = true;
    }

    confirmDelete(): void {
        if (!this.itemToDelete) return;

        this.camService.deleteCam(this.itemToDelete).subscribe({
            next: () => {
                this.camsData = this.camsData.filter(s => s.id !== this.itemToDelete);
                if (this.currentPage > this.totalPages) {
                    this.currentPage = this.totalPages;
                }
                this.isDeleteModalOpen = false;
                this.itemToDelete = null;
                this.cdr.detectChanges();
            },
            error: (err) => {
                console.error('Error deleting cam', err);
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
