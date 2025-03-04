import './index.scss';

interface DialogLiteOptions {
  closingButton?: boolean;
  closingBackdrop?: boolean;
}

interface OpenOptions {
  stylingClass?: string;
}

class DialogLite {
  private dialogEl: HTMLDivElement | null = null;
  private dialogCloseEl: HTMLButtonElement | null = null;
  private dialogBackdropEl: HTMLDivElement | null = null;
  private mainContentEl: HTMLElement | null = null;

  private focusableEls: HTMLElement[] = [];
  private firstFocusableEl: HTMLElement | null = null;
  private lastFocusableEl: HTMLElement | null = null;

  private currentClass = '';
  private previouslyFocusedElement: HTMLElement | null = null;
  private lastActionTime = 0;
  private isOpen = false;

  private readonly isCloseButtonEnabled: boolean;
  private readonly isCloseOnBackdropClickEnabled: boolean;

  constructor({ closingButton = false, closingBackdrop = false }: DialogLiteOptions = {}) {
    this.isCloseButtonEnabled = closingButton;
    this.isCloseOnBackdropClickEnabled = closingBackdrop;

    this.getElements();
  }

  private getElements(): void {
    this.dialogEl = document.querySelector<HTMLDivElement>('.dialog-lite');
    this.mainContentEl = document.getElementById('main-content');

    if (!this.dialogEl) {
      throw new Error('Dialog element not found');
    }

    this.dialogCloseEl = this.dialogEl.querySelector<HTMLButtonElement>(
      '.dialog-lite-close-button',
    );

    this.dialogBackdropEl = this.dialogEl.querySelector<HTMLDivElement>('.dialog-lite__backdrop');
  }

  public init(): void {
    if (this.isCloseButtonEnabled && this.dialogCloseEl) {
      this.dialogCloseEl.addEventListener('click', () => this.close());
    }

    if (this.isCloseOnBackdropClickEnabled && this.dialogBackdropEl) {
      this.dialogBackdropEl.addEventListener('click', () => this.close());
    }

    document.addEventListener('keydown', (event: KeyboardEvent) => {
      if (event.key === 'Escape' && this.isOpen) {
        this.close();
      }

      if (event.key === 'Tab' && this.isOpen) {
        this.handleTabKey(event);
      }
    });
  }

  public open({ stylingClass = '' }: OpenOptions = {}): void {
    if (this.isDebounced()) return;
    if (!this.dialogEl) return;

    this.isOpen = true;

    if (this.mainContentEl) {
      this.mainContentEl.setAttribute('aria-hidden', 'true');
    }

    this.dialogEl.setAttribute('aria-hidden', 'false');

    this.previouslyFocusedElement = document.activeElement as HTMLElement;

    this.getFocusableElements();

    if (this.firstFocusableEl) {
      this.firstFocusableEl.focus();
    }

    this.updateClassList({
      addClass: 'dialog-lite--in',
      removeClass: 'dialog-lite--out',
      newClass: stylingClass,
    });
  }

  public close(): void {
    if (this.isDebounced()) return;

    if (!this.dialogEl) return;

    this.isOpen = false;

    if (this.mainContentEl) {
      this.mainContentEl.setAttribute('aria-hidden', 'false');
    }

    this.dialogEl.setAttribute('aria-hidden', 'true');

    if (this.previouslyFocusedElement) {
      this.previouslyFocusedElement.focus();
    }

    this.updateClassList({
      addClass: 'dialog-lite--out',
      removeClass: 'dialog-lite--in',
      newClass: '',
      delayRemove: true,
    });
  }

  private getFocusableElements(): void {
    if (!this.dialogEl) return;

    const focusableSelectors = [
      'a[href]',
      'area[href]',
      'input:not([disabled])',
      'select:not([disabled])',
      'textarea:not([disabled])',
      'button:not([disabled])',
      'iframe',
      '[tabindex]:not([tabindex="-1"])',
      '[contenteditable]',
    ];

    const allElements = Array.from(this.dialogEl.querySelectorAll(focusableSelectors.join(',')));

    this.focusableEls = allElements.filter((el): el is HTMLElement => el instanceof HTMLElement);

    if (this.focusableEls.length > 0) {
      this.firstFocusableEl = this.focusableEls[0];
      this.lastFocusableEl = this.focusableEls[this.focusableEls.length - 1];
    } else {
      this.firstFocusableEl = null;
      this.lastFocusableEl = null;
    }
  }

  private handleTabKey(event: KeyboardEvent): void {
    if (!this.firstFocusableEl || !this.lastFocusableEl) return;

    if (event.shiftKey && document.activeElement === this.firstFocusableEl) {
      event.preventDefault();

      this.lastFocusableEl.focus();
    } else if (!event.shiftKey && document.activeElement === this.lastFocusableEl) {
      event.preventDefault();

      this.firstFocusableEl.focus();
    }
  }

  private updateClassList({
    addClass,
    removeClass,
    newClass,
    delayRemove = false,
  }: {
    addClass: string;
    removeClass: string;
    newClass: string;
    delayRemove?: boolean;
  }): void {
    if (!this.dialogEl) return;

    if (this.currentClass) {
      if (delayRemove) {
        const classToRemove = this.currentClass;

        setTimeout(() => {
          this.dialogEl?.classList.remove(classToRemove);
          this.currentClass = '';
        }, 500);
      } else {
        this.dialogEl.classList.remove(this.currentClass);
      }
    }

    this.dialogEl.classList.remove(removeClass);
    this.dialogEl.classList.add(addClass);

    if (newClass) {
      this.dialogEl.classList.add(newClass);
      this.currentClass = newClass;
    }
  }

  private isDebounced(): boolean {
    const now = Date.now();

    if (now - this.lastActionTime < 500) return true;

    this.lastActionTime = now;

    return false;
  }
}

export default DialogLite;
