import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, FormsModule, Validators } from '@angular/forms';
import { FarrowingRecordService, FarrowingRecord } from './farrowing-record.service';
import { SowService, Sow } from '../quan-ly-lon-lai/sow.service';

@Component({
    selector: 'app-quan-ly-sinh-de',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule, FormsModule],
    templateUrl: './quan-ly-sinh-de.component.html',
    styleUrl: './quan-ly-sinh-de.component.scss'
})
export class QuanLySinhDeComponent implements OnInit {
    recordsData: FarrowingRecord[] = [];
    sowsData: Sow[] = [];
    searchTerm: string = '';
    currentPage: number = 1;
    itemsPerPage: number = 10;

    get filteredRecordsData(): FarrowingRecord[] {
        if (!this.searchTerm.trim()) {
            return this.recordsData;
        }
        const term = this.searchTerm.toLowerCase().trim();
        return this.recordsData.filter(record =>
            record.sowTag?.toLowerCase().includes(term)
        );
    }

    get totalPages(): number {
        return Math.ceil(this.filteredRecordsData.length / this.itemsPerPage) || 1;
    }

    get paginatedRecordsData(): FarrowingRecord[] {
        const startIndex = (this.currentPage - 1) * this.itemsPerPage;
        return this.filteredRecordsData.slice(startIndex, startIndex + this.itemsPerPage);
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
    currentRecordId: number | null = null;
    recordForm: FormGroup;

    isDeleteModalOpen = false;
    itemToDelete: number | null = null;

    constructor(
        private farrowingService: FarrowingRecordService,
        private sowService: SowService,
        private fb: FormBuilder,
        private cdr: ChangeDetectorRef
    ) {
        this.recordForm = this.fb.group({
            sowTag: ['', Validators.required],
            farrowingDate: ['', Validators.required],
            bornAlive: [null, [Validators.required, Validators.min(0)]],
            stillborn: [null, [Validators.required, Validators.min(0)]],
            weanedPigs: [null, [Validators.required, Validators.min(0)]],
            weaningDate: ['', Validators.required],
            healthStatus: ['', Validators.required],
            notes: ['']
        });
    }

    ngOnInit(): void {
        this.loadRecords();
        this.loadSows();
    }

    loadSows(): void {
        this.sowService.getAllSows().subscribe({
            next: (data) => {
                this.sowsData = data;
                this.cdr.detectChanges();
            },
            error: (err) => {
                console.error('Error fetching sows', err);
            }
        });
    }

    loadRecords(): void {
        this.farrowingService.getAllRecords().subscribe({
            next: (data) => {
                this.recordsData = [...data].sort((a, b) => (b.id || 0) - (a.id || 0));
                this.cdr.detectChanges();
            },
            error: (err) => {
                console.error('Error fetching farrowing records', err);
            }
        });
    }

    openModal(record?: FarrowingRecord): void {
        this.isModalOpen = true;
        if (record) {
            this.isEditing = true;
            this.currentRecordId = record.id || null;
            this.recordForm.patchValue({
                sowTag: record.sowTag,
                farrowingDate: record.farrowingDate,
                bornAlive: record.bornAlive,
                stillborn: record.stillborn,
                weanedPigs: record.weanedPigs,
                weaningDate: record.weaningDate,
                healthStatus: record.healthStatus,
                notes: record.notes || ''
            });
        } else {
            this.isEditing = false;
            this.currentRecordId = null;
            this.recordForm.reset();
        }
        this.cdr.detectChanges();
    }

    closeModal(): void {
        this.isModalOpen = false;
        this.recordForm.reset();
        this.cdr.detectChanges();
    }

    saveRecord(): void {
        if (this.recordForm.invalid) {
            this.recordForm.markAllAsTouched();
            return;
        }

        const payload: FarrowingRecord = this.recordForm.value;

        if (this.isEditing && this.currentRecordId) {
            this.farrowingService.updateRecord(this.currentRecordId, payload).subscribe({
                next: (updatedRecord) => {
                    const index = this.recordsData.findIndex(r => r.id === this.currentRecordId);
                    if (index !== -1) {
                        this.recordsData[index] = updatedRecord;
                    }
                    this.recordsData = [...this.recordsData].sort((a, b) => (b.id || 0) - (a.id || 0));
                    this.closeModal();
                },
                error: (err) => console.error('Error updating farrowing record', err)
            });
        } else {
            this.farrowingService.createRecord(payload).subscribe({
                next: (newRecord) => {
                    this.recordsData = [newRecord, ...this.recordsData].sort((a, b) => (b.id || 0) - (a.id || 0));
                    this.closeModal();
                },
                error: (err) => console.error('Error creating farrowing record', err)
            });
        }
    }

    deleteRecord(id: number | undefined): void {
        if (!id) return;
        this.itemToDelete = id;
        this.isDeleteModalOpen = true;
    }

    confirmDelete(): void {
        if (!this.itemToDelete) return;

        this.farrowingService.deleteRecord(this.itemToDelete).subscribe({
            next: () => {
                this.recordsData = this.recordsData.filter(r => r.id !== this.itemToDelete);
                if (this.currentPage > this.totalPages) {
                    this.currentPage = this.totalPages;
                }
                this.isDeleteModalOpen = false;
                this.itemToDelete = null;
                this.cdr.detectChanges();
            },
            error: (err) => {
                console.error('Error deleting farrowing record', err);
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
