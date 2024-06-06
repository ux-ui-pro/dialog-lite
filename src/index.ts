class DialogLite {
  private dialogEl: HTMLElement | null = null;

  private dialogCloseEl: HTMLElement | null = null;

  private dialogBackdropEl: HTMLElement | null = null;

  private currentClass: string = '';

  private previouslyFocusedElement: Element | null = null;

  private readonly closingButton: boolean = false;

  private readonly closingBackdrop: boolean = false;

  constructor({
    closingButton = false,
    closingBackdrop = false,
  }: {
    closingButton?: boolean;
    closingBackdrop?: boolean;
  } = {}) {
    this.closingButton = closingButton;
    this.closingBackdrop = closingBackdrop;
    this.getElements();
  }

  private getElements(): void {
    this.dialogEl = document.querySelector('.dialog-lite');
    this.dialogCloseEl = document.querySelector('.dialog-lite-close-button');
    this.dialogBackdropEl = document.querySelector('.dialog-lite__backdrop');
  }

  public init(): void {
    if (this.closingButton) {
      this.dialogCloseEl?.addEventListener('click', () => this.close());
    }

    if (this.closingBackdrop) {
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
    if (!this.dialogEl) return;

    this.previouslyFocusedElement = document.activeElement;
    this.dialogEl.removeAttribute('aria-hidden');
    (this.dialogEl.querySelector('[tabindex="0"]') as HTMLElement).focus();
    this.updateClassList('dialog-lite--in', 'dialog-lite--out', stylingClass);
  }

  public close(): void {
    if (!this.dialogEl) return;

    this.dialogEl.setAttribute('aria-hidden', 'true');
    (this.previouslyFocusedElement as HTMLElement)?.focus();
    this.updateClassList('dialog-lite--out', 'dialog-lite--in', '');

    if (this.currentClass) {
      this.dialogEl.classList.remove(this.currentClass);
      this.currentClass = '';
    }
  }

  private updateClassList(addClass: string, removeClass: string, newClass: string): void {
    if (this.currentClass) {
      setTimeout(() => {
        this.dialogEl?.classList.remove(this.currentClass);
      }, 500);
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
