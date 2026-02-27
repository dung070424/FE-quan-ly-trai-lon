import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, FormsModule, Validators } from '@angular/forms';
import { SowService, Sow } from './sow.service';

@Component({
    selector: 'app-quan-ly-lon-lai',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule, FormsModule],
    templateUrl: './quan-ly-lon-lai.component.html',
    styleUrl: './quan-ly-lon-lai.component.scss'
})
export class QuanLyLonLaiComponent implements OnInit {
    sowsData: Sow[] = [];
    searchTerm: string = '';
    currentPage: number = 1;
    itemsPerPage: number = 10;

    get filteredSowsData(): Sow[] {
        if (!this.searchTerm.trim()) {
            return this.sowsData;
        }
        const term = this.searchTerm.toLowerCase().trim();
        return this.sowsData.filter(sow =>
            sow.tagNumber?.toLowerCase().includes(term)
        );
    }

    get totalPages(): number {
        return Math.ceil(this.filteredSowsData.length / this.itemsPerPage) || 1;
    }

    get paginatedSowsData(): Sow[] {
        const startIndex = (this.currentPage - 1) * this.itemsPerPage;
        return this.filteredSowsData.slice(startIndex, startIndex + this.itemsPerPage);
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
    currentSowId: number | null = null;
    sowForm: FormGroup;

    isDeleteModalOpen = false;
    itemToDelete: number | null = null;

    constructor(
        private sowService: SowService,
        private fb: FormBuilder,
        private cdr: ChangeDetectorRef
    ) {
        this.sowForm = this.fb.group({
            tagNumber: ['', Validators.required],
            breed: ['', Validators.required],
            birthDate: ['', Validators.required],
            origin: ['', Validators.required],
            status: ['', Validators.required],
            notes: ['']
        });
    }

    ngOnInit(): void {
        this.loadSows();
    }

    loadSows(): void {
        this.sowService.getAllSows().subscribe({
            next: (data) => {
                this.sowsData = [...data].sort((a, b) => (b.id || 0) - (a.id || 0));
                this.cdr.detectChanges();
            },
            error: (err) => {
                console.error('Error fetching sows', err);
            }
        });
    }

    openModal(sow?: Sow): void {
        this.isModalOpen = true;
        if (sow) {
            this.isEditing = true;
            this.currentSowId = sow.id || null;
            this.sowForm.patchValue({
                tagNumber: sow.tagNumber,
                breed: sow.breed,
                birthDate: sow.birthDate,
                origin: sow.origin,
                status: sow.status,
                notes: sow.notes || ''
            });
        } else {
            this.isEditing = false;
            this.currentSowId = null;
            this.sowForm.reset();
        }
        this.cdr.detectChanges();
    }

    closeModal(): void {
        this.isModalOpen = false;
        this.sowForm.reset();
        this.cdr.detectChanges();
    }

    saveSow(): void {
        if (this.sowForm.invalid) {
            this.sowForm.markAllAsTouched();
            return;
        }

        const payload: Sow = this.sowForm.value;

        if (this.isEditing && this.currentSowId) {
            this.sowService.updateSow(this.currentSowId, payload).subscribe({
                next: (updatedSow) => {
                    const index = this.sowsData.findIndex(s => s.id === this.currentSowId);
                    if (index !== -1) {
                        this.sowsData[index] = updatedSow;
                    }
                    this.sowsData = [...this.sowsData].sort((a, b) => (b.id || 0) - (a.id || 0));
                    this.closeModal();
                },
                error: (err) => console.error('Error updating sow', err)
            });
        } else {
            this.sowService.createSow(payload).subscribe({
                next: (newSow) => {
                    this.sowsData = [newSow, ...this.sowsData].sort((a, b) => (b.id || 0) - (a.id || 0));
                    this.closeModal();
                },
                error: (err) => console.error('Error creating sow', err)
            });
        }
    }

    deleteSow(id: number | undefined): void {
        if (!id) return;
        this.itemToDelete = id;
        this.isDeleteModalOpen = true;
    }

    confirmDelete(): void {
        if (!this.itemToDelete) return;

        this.sowService.deleteSow(this.itemToDelete).subscribe({
            next: () => {
                this.sowsData = this.sowsData.filter(s => s.id !== this.itemToDelete);
                if (this.currentPage > this.totalPages) {
                    this.currentPage = this.totalPages;
                }
                this.isDeleteModalOpen = false;
                this.itemToDelete = null;
                this.cdr.detectChanges();
            },
            error: (err) => {
                console.error('Error deleting sow', err);
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
