class DialogLite {
  private dialogEl: HTMLElement | null = null;

  private dialogCloseEl: HTMLElement | null = null;

  private dialogBackdropEl: HTMLElement | null = null;

  private currentClass: string = '';

  private previouslyFocusedElement: HTMLElement | null = null;

  private readonly isCloseButtonEnabled: boolean = false;

  private readonly isCloseOnBackdropClickEnabled: boolean = false;

  private lastActionTime: number = 0;

  constructor({
    closingButton = false,
    closingBackdrop = false,
  }: {
    closingButton?: boolean;
    closingBackdrop?: boolean;
  } = {}) {
    this.isCloseButtonEnabled = closingButton;
    this.isCloseOnBackdropClickEnabled = closingBackdrop;
    this.getElements();
  }

  private getElements(): void {
    this.dialogEl = document.querySelector('.dialog-lite');

    if (!this.dialogEl) {
      throw new Error('Dialog element not found');
    }

    this.dialogCloseEl = this.dialogEl.querySelector('.dialog-lite-close-button');
    this.dialogBackdropEl = this.dialogEl.querySelector('.dialog-lite__backdrop');
  }

  public init(): void {
    if (this.isCloseButtonEnabled) {
      this.dialogCloseEl?.addEventListener('click', () => this.close());
    }

    if (this.isCloseOnBackdropClickEnabled) {
      this.dialogBackdropEl?.addEventListener('click', () => this.close());
    }

    document.addEventListener('keydown', (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        this.close();
      }
    });
  }

  public open({
    stylingClass = '',
  }: {
    stylingClass?: string;
  } = {}): void {
    if (this.isDebounced()) return;
    if (!this.dialogEl) return;

    this.previouslyFocusedElement = document.activeElement as HTMLElement;
    this.dialogEl.removeAttribute('aria-hidden');
    (this.dialogEl.querySelector('[tabindex="0"]') as HTMLElement).focus();

    this.updateClassList({
      addClass: 'dialog-lite--in',
      removeClass: 'dialog-lite--out',
      newClass: stylingClass,
    });
  }

  public close(): void {
    if (this.isDebounced()) return;
    if (!this.dialogEl) return;

    this.dialogEl.setAttribute('aria-hidden', 'true');
    (this.previouslyFocusedElement as HTMLElement)?.focus();

    this.updateClassList({
      addClass: 'dialog-lite--out',
      removeClass: 'dialog-lite--in',
      newClass: '',
      delayRemove: true,
    });
  }

  private isDebounced(): boolean {
    const now = Date.now();

    if (now - this.lastActionTime < 500) return true;

    this.lastActionTime = now;

    return false;
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
    if (this.currentClass) {
      if (delayRemove) {
        const classToRemove = this.currentClass;

        setTimeout(() => {
          this.dialogEl?.classList.remove(classToRemove);
          this.currentClass = '';
        }, 500);
      } else {
        this.dialogEl?.classList.remove(this.currentClass);
      }
    }

    this.dialogEl?.classList.remove(removeClass);
    this.dialogEl?.classList.add(addClass);

    if (newClass) {
      this.dialogEl?.classList.add(newClass);
      this.currentClass = newClass;
    }
  }
}

export default DialogLite;
