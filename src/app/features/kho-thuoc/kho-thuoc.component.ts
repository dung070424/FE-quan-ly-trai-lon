import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, FormsModule, Validators } from '@angular/forms';
import { KhoThuocService, MedicineInventory, MedicineImportHistory } from './kho-thuoc.service';
import { ThuocService, Medicine } from '../thuoc/thuoc.service';

@Component({
    selector: 'app-kho-thuoc',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule, FormsModule],
    templateUrl: './kho-thuoc.component.html',
    styleUrl: './kho-thuoc.component.scss'
})
export class KhoThuocComponent implements OnInit {
    inventories: MedicineInventory[] = [];
    medicines: Medicine[] = [];
    searchTerm: string = '';

    // History state
    importHistory: MedicineImportHistory[] = [];
    isHistoryModalOpen = false;
    totalImportCost = 0;

    // Modals
    isImportModalOpen = false;
    isExportModalOpen = false;
    importForm: FormGroup;
    exportForm: FormGroup;

    currentExportInventory: MedicineInventory | null = null;

    constructor(
        private khoThuocService: KhoThuocService,
        private thuocService: ThuocService,
        private fb: FormBuilder,
        private cdr: ChangeDetectorRef
    ) {
        this.importForm = this.fb.group({
            medicineId: ['', Validators.required],
            type: ['Kháng sinh', Validators.required],
            quantity: [0, [Validators.required, Validators.min(1)]],
            unit: ['viên', Validators.required],
            minQuantity: [20, Validators.required],
            maxQuantity: [500, Validators.required],
            unitPrice: [0, Validators.required],
            location: ['', Validators.required]
        });

        this.exportForm = this.fb.group({
            amount: [1, [Validators.required, Validators.min(1)]]
        });
    }

    ngOnInit(): void {
        this.loadInventories();
        this.loadMedicines();
    }

    loadInventories(): void {
        this.khoThuocService.getAllInventory().subscribe({
            next: (data) => {
                this.inventories = data;
                this.cdr.detectChanges();
            },
            error: (err) => console.error('Error fetching inventory', err)
        });
    }

    loadMedicines(): void {
        this.thuocService.getAllMedicines().subscribe({
            next: (data) => {
                this.medicines = data;
            },
            error: (err) => console.error('Error fetching medicines', err)
        });
    }

    // Computed properties for Dashboard
    get filteredInventories(): MedicineInventory[] {
        if (!this.searchTerm.trim()) return this.inventories;
        const term = this.searchTerm.toLowerCase();
        return this.inventories.filter(inv =>
            inv.medicineName?.toLowerCase().includes(term) ||
            inv.type?.toLowerCase().includes(term) ||
            inv.location?.toLowerCase().includes(term)
        );
    }

    get totalMedicinesCount(): number {
        return this.inventories.length;
    }

    get almostOutOfStockCount(): number {
        return this.inventories.filter(inv => inv.quantity <= (inv.minQuantity || 0)).length;
    }

    get almostExpiredCount(): number {
        const today = new Date();
        const nextMonth = new Date(today);
        nextMonth.setMonth(today.getMonth() + 1);

        return this.inventories.filter(inv => {
            if (!inv.expiryDate) return false;
            const expDate = new Date(inv.expiryDate);
            return expDate > today && expDate <= nextMonth;
        }).length;
    }

    get expiredCount(): number {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        return this.inventories.filter(inv => {
            if (!inv.expiryDate) return false;
            const expDate = new Date(inv.expiryDate);
            return expDate < today;
        }).length;
    }

    get totalValue(): number {
        return this.inventories.reduce((acc, inv) => acc + (inv.quantity * (inv.unitPrice || 0)), 0);
    }

    // Grid Card Helpers
    getExpiryStatus(expiryDate: string | undefined): 'normal' | 'almost' | 'expired' {
        if (!expiryDate) return 'normal';
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const exp = new Date(expiryDate);

        if (exp < today) return 'expired';

        const nextMonth = new Date(today);
        nextMonth.setMonth(today.getMonth() + 1);
        if (exp <= nextMonth) return 'almost';

        return 'normal';
    }

    getProgressPercentage(quantity: number, maxQuantity: number | undefined): number {
        if (!maxQuantity || maxQuantity === 0) return 0;
        const ratio = quantity / maxQuantity;
        return Math.min(Math.max(ratio * 100, 0), 100);
    }

    formatCurrency(value: number): string {
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);
    }

    // Modal Actions
    openImportModal(): void {
        this.importForm.reset({
            type: 'Kháng sinh',
            quantity: 0,
            unit: 'viên',
            minQuantity: 20,
            maxQuantity: 500,
            unitPrice: 0
        });
        this.isImportModalOpen = true;
    }

    closeImportModal(): void {
        this.isImportModalOpen = false;
    }

    saveImport(): void {
        if (this.importForm.invalid) {
            this.importForm.markAllAsTouched();
            return;
        }

        const formValue = this.importForm.value;
        const payload: MedicineInventory = {
            medicineId: parseInt(formValue.medicineId, 10),
            type: formValue.type,
            quantity: formValue.quantity,
            unit: formValue.unit,
            minQuantity: formValue.minQuantity,
            maxQuantity: formValue.maxQuantity,
            unitPrice: formValue.unitPrice,
            location: formValue.location
        };

        this.khoThuocService.importMedicine(payload).subscribe({
            next: (res) => {
                this.loadInventories();
                this.closeImportModal();
            },
            error: (err) => console.error('Error importing', err)
        });
    }

    openExportModal(inventory: MedicineInventory): void {
        this.currentExportInventory = inventory;
        this.exportForm.reset({
            amount: 1
        });
        // Set max validator dynamically
        this.exportForm.get('amount')?.setValidators([
            Validators.required,
            Validators.min(1),
            Validators.max(inventory.quantity)
        ]);
        this.exportForm.get('amount')?.updateValueAndValidity();
        this.isExportModalOpen = true;
    }

    closeExportModal(): void {
        this.isExportModalOpen = false;
        this.currentExportInventory = null;
    }

    saveExport(): void {
        if (this.exportForm.invalid || !this.currentExportInventory?.id) {
            this.exportForm.markAllAsTouched();
            return;
        }

        const amount = this.exportForm.value.amount;
        this.khoThuocService.exportMedicine(this.currentExportInventory.id, amount).subscribe({
            next: (res) => {
                this.loadInventories();
                this.closeExportModal();
            },
            error: (err) => console.error('Error exporting', err)
        });
    }

    openHistoryModal(): void {
        this.khoThuocService.getImportHistory().subscribe({
            next: (data) => {
                this.importHistory = data;
                this.totalImportCost = data.reduce((sum, h) => sum + (h.totalPrice || 0), 0);
                this.isHistoryModalOpen = true;
                this.cdr.detectChanges();
            },
            error: (err) => console.error('Error loading history', err)
        });
    }

    closeHistoryModal(): void {
        this.isHistoryModalOpen = false;
    }
}
