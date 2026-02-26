import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, FormsModule, Validators } from '@angular/forms';
import { PigSaleService, PigSale } from './pig-sale.service';

@Component({
    selector: 'app-pig-sales',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule, FormsModule],
    templateUrl: './pig-sales.component.html',
    styleUrl: './pig-sales.component.scss'
})
export class PigSalesComponent implements OnInit {
    salesData: PigSale[] = [];
    searchTerm: string = '';
    currentPage: number = 1;
    itemsPerPage: number = 10;

    get filteredSalesData(): PigSale[] {
        if (!this.searchTerm.trim()) {
            return this.salesData;
        }
        const term = this.searchTerm.toLowerCase().trim();
        return this.salesData.filter(sale =>
            sale.customer?.toLowerCase().includes(term)
        );
    }

    get totalAmount(): number {
        return this.filteredSalesData.reduce((sum, sale) => sum + Number(sale.total), 0);
    }

    get totalPages(): number {
        return Math.ceil(this.filteredSalesData.length / this.itemsPerPage) || 1;
    }

    get paginatedSalesData(): PigSale[] {
        const startIndex = (this.currentPage - 1) * this.itemsPerPage;
        return this.filteredSalesData.slice(startIndex, startIndex + this.itemsPerPage);
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
    currentSaleId: number | null = null;
    saleForm: FormGroup;

    isDeleteModalOpen = false;
    itemToDelete: number | null = null;

    constructor(
        private pigSaleService: PigSaleService,
        private fb: FormBuilder,
        private cdr: ChangeDetectorRef
    ) {
        this.saleForm = this.fb.group({
            saleDate: ['', Validators.required],
            quantity: [null, [Validators.required, Validators.min(1)]],
            weight: [null, [Validators.required, Validators.min(0.1)]],
            price: [null, [Validators.required, Validators.min(0)]],
            customer: ['', Validators.required]
        });
    }

    ngOnInit(): void {
        this.loadSales();
    }

    loadSales(): void {
        this.pigSaleService.getAllPigSales().subscribe({
            next: (data) => {
                // Sắp xếp dữ liệu mới nhất lên đầu (dựa vào id giảm dần)
                this.salesData = [...data].sort((a, b) => (b.id || 0) - (a.id || 0));
                this.cdr.detectChanges(); // Force UI to update immediately
            },
            error: (err) => {
                console.error('Error fetching sales data', err);
            }
        });
    }

    openModal(sale?: PigSale): void {
        this.isModalOpen = true;
        if (sale) {
            this.isEditing = true;
            this.currentSaleId = sale.id || null;
            let dateVal = sale.saleDate;
            if (dateVal && dateVal.includes('T')) {
                dateVal = dateVal.split('T')[0];
            }
            this.saleForm.patchValue({
                saleDate: dateVal,
                quantity: sale.quantity,
                weight: sale.weight,
                price: sale.price,
                customer: sale.customer
            });
        } else {
            this.isEditing = false;
            this.currentSaleId = null;
            this.saleForm.reset();
        }
        this.cdr.detectChanges(); // Ensure the modal shows
    }

    closeModal(): void {
        this.isModalOpen = false;
        this.saleForm.reset();
        this.cdr.detectChanges(); // Ensure the modal hides
    }

    saveSale(): void {
        if (this.saleForm.invalid) {
            this.saleForm.markAllAsTouched();
            return;
        }

        const formValue = this.saleForm.value;
        const total = Number(formValue.weight) * Number(formValue.price);

        const payload: PigSale = {
            ...formValue,
            total: total
        };

        if (this.isEditing && this.currentSaleId) {
            this.pigSaleService.updatePigSale(this.currentSaleId, payload).subscribe({
                next: (updatedSale) => {
                    const index = this.salesData.findIndex(s => s.id === this.currentSaleId);
                    if (index !== -1) {
                        this.salesData[index] = updatedSale;
                    }
                    // Sort again just in case
                    this.salesData = [...this.salesData].sort((a, b) => (b.id || 0) - (a.id || 0));
                    this.closeModal();
                },
                error: (err) => console.error('Error updating sale', err)
            });
        } else {
            this.pigSaleService.createPigSale(payload).subscribe({
                next: (newSale) => {
                    this.salesData = [newSale, ...this.salesData].sort((a, b) => (b.id || 0) - (a.id || 0));
                    this.closeModal();
                },
                error: (err) => console.error('Error creating sale', err)
            });
        }
    }

    deleteSale(id: number | undefined): void {
        if (!id) return;
        this.itemToDelete = id;
        this.isDeleteModalOpen = true;
    }

    confirmDelete(): void {
        if (!this.itemToDelete) return;

        this.pigSaleService.deletePigSale(this.itemToDelete).subscribe({
            next: () => {
                this.salesData = this.salesData.filter(s => s.id !== this.itemToDelete);
                if (this.currentPage > this.totalPages) {
                    this.currentPage = this.totalPages;
                }
                this.isDeleteModalOpen = false;
                this.itemToDelete = null;
                this.cdr.detectChanges(); // Force UI to update
            },
            error: (err) => {
                console.error('Error deleting sale', err);
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
