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
    });
  }

  public open({ stylingClass = '' }: OpenOptions = {}): void {
    if (this.isDebounced()) return;
    if (!this.dialogEl) return;

    if (this.dialogEl.style.display === 'none') {
      this.dialogEl.style.display = '';

      void this.dialogEl.offsetWidth;
    }

    this.isOpen = true;

    if (this.mainContentEl) {
      this.mainContentEl.setAttribute('aria-hidden', 'true');
    }

    this.dialogEl.setAttribute('aria-hidden', 'false');

    this.previouslyFocusedElement = document.activeElement as HTMLElement;

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

    setTimeout(() => {
      if (this.dialogEl) {
        this.dialogEl.style.display = 'none';
      }
    }, 500);
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
