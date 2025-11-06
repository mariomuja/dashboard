import { Component, OnInit, HostListener } from '@angular/core';
import { DocumentationService, DocFile } from '../../services/documentation.service';
import { trigger, transition, style, animate } from '@angular/animations';
import { marked } from 'marked';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

@Component({
  selector: 'app-documentation-viewer',
  templateUrl: './documentation-viewer.component.html',
  styleUrls: ['./documentation-viewer.component.css'],
  animations: [
    trigger('fadeIn', [
      transition(':enter', [
        style({ opacity: 0 }),
        animate('200ms ease-in', style({ opacity: 1 }))
      ]),
      transition(':leave', [
        animate('200ms ease-out', style({ opacity: 0 }))
      ])
    ]),
    trigger('slideIn', [
      transition(':enter', [
        style({ transform: 'translateY(-20px)', opacity: 0 }),
        animate('300ms ease-out', style({ transform: 'translateY(0)', opacity: 1 }))
      ]),
      transition(':leave', [
        animate('200ms ease-in', style({ transform: 'translateY(-20px)', opacity: 0 }))
      ])
    ])
  ]
})
export class DocumentationViewerComponent implements OnInit {
  docFiles: DocFile[] = [];
  showDropdown = false;
  showModal = false;
  selectedDoc: DocFile | null = null;
  documentContent: SafeHtml = '';
  isLoading = false;
  searchTerm = '';

  constructor(
    private docService: DocumentationService,
    private sanitizer: DomSanitizer
  ) {
    // Configure marked options for better rendering
    marked.setOptions({
      breaks: true,
      gfm: true
    });
  }

  ngOnInit(): void {
    this.docFiles = this.docService.getDocumentList();
  }

  get filteredDocs(): DocFile[] {
    if (!this.searchTerm) {
      return this.docFiles;
    }
    const term = this.searchTerm.toLowerCase();
    return this.docFiles.filter(doc => 
      doc.displayName.toLowerCase().includes(term) ||
      doc.name.toLowerCase().includes(term)
    );
  }

  toggleDropdown(): void {
    this.showDropdown = !this.showDropdown;
  }

  selectDocument(doc: DocFile): void {
    this.selectedDoc = doc;
    this.showDropdown = false;
    this.showModal = true;
    this.isLoading = true;
    this.documentContent = '';

    this.docService.getDocumentContent(doc.path).subscribe({
      next: (content) => {
        // Convert markdown to HTML
        const html = marked.parse(content) as string;
        this.documentContent = this.sanitizer.sanitize(1, html) || '';
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading document:', error);
        this.documentContent = '<p class="error">Error loading documentation. Please try again.</p>';
        this.isLoading = false;
      }
    });
  }

  closeModal(): void {
    this.showModal = false;
    this.selectedDoc = null;
    this.documentContent = '';
  }

  @HostListener('document:click', ['$event'])
  closeDropdown(event: Event): void {
    if (this.showDropdown) {
      const target = event.target as HTMLElement;
      if (!target.closest('.help-dropdown')) {
        this.showDropdown = false;
      }
    }
  }
}
