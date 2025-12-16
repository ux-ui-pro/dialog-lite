import DEFAULT_CSS_TEXT from './dialog-lite.css?raw';

export const dialogLiteCssText: string = DEFAULT_CSS_TEXT;

function getByIdFromTarget(target: Document | ShadowRoot, id: string): Element | null {
  const escaped =
    typeof CSS !== 'undefined' && 'escape' in CSS ? CSS.escape(id) : id.replace(/"/g, '\\"');

  return target.querySelector(`#${escaped}`);
}

export function injectDialogLiteCss(
  options: { target?: Document | ShadowRoot; cssText?: string; id?: string } = {},
): HTMLStyleElement {
  const { target = document, cssText = DEFAULT_CSS_TEXT, id = 'dialog-lite-styles' } = options;
  const existing = getByIdFromTarget(target, id);

  if (existing && existing instanceof HTMLStyleElement) {
    existing.textContent = cssText;

    return existing;
  }

  const styleEl = document.createElement('style');

  styleEl.id = id;
  styleEl.textContent = cssText;

  if (target instanceof Document) {
    target.head.append(styleEl);
  } else {
    target.append(styleEl);
  }

  return styleEl;
}

export type DialogLiteOptions = {
  closingButton?: boolean;
  closingBackdrop?: boolean;
  dialog?: HTMLElement | string;
  mainContent?: HTMLElement | string | null;
  closeButtonSelector?: string;
  backdropSelector?: string;
  debounceMs?: number;
  hideDelayMs?: number;
  focusOnOpenSelector?: string;
  lockScroll?: boolean;
  trapFocus?: boolean;
  role?: string;
  ariaModal?: boolean;
  emitEvents?: boolean;
};

interface OpenOptions {
  stylingClass?: string;
}

export type DialogLiteInstance = Pick<DialogLite, 'init' | 'open' | 'close' | 'destroy'>;

class DialogLite {
  private readonly options: Required<
    Pick<
      DialogLiteOptions,
      | 'closingButton'
      | 'closingBackdrop'
      | 'closeButtonSelector'
      | 'backdropSelector'
      | 'debounceMs'
      | 'hideDelayMs'
      | 'focusOnOpenSelector'
      | 'lockScroll'
      | 'trapFocus'
      | 'role'
      | 'ariaModal'
      | 'emitEvents'
    >
  > &
    Pick<DialogLiteOptions, 'dialog' | 'mainContent'>;

  private dialogEl: HTMLElement | null = null;
  private dialogCloseEl: HTMLElement | null = null;
  private dialogBackdropEl: HTMLElement | null = null;
  private mainContentEl: HTMLElement | null = null;

  private currentExtraClass = '';
  private previouslyFocusedElement: HTMLElement | null = null;
  private lastActionTime = 0;
  private isOpen = false;

  private abortController: AbortController | null = null;
  private hideTimeout: number | null = null;
  private removeExtraClassTimeout: number | null = null;

  private prevBodyOverflow: string | null = null;
  private prevBodyPaddingRight: string | null = null;

  constructor(options: DialogLiteOptions = {}) {
    this.options = {
      closingButton: options.closingButton ?? false,
      closingBackdrop: options.closingBackdrop ?? false,
      dialog: options.dialog ?? '.dialog-lite',
      mainContent: options.mainContent ?? '#main-content',
      closeButtonSelector: options.closeButtonSelector ?? '.dialog-lite-close-button',
      backdropSelector: options.backdropSelector ?? '.dialog-lite__backdrop',
      debounceMs: options.debounceMs ?? 500,
      hideDelayMs: options.hideDelayMs ?? 500,
      focusOnOpenSelector: options.focusOnOpenSelector ?? '[tabindex="0"]',
      lockScroll: options.lockScroll ?? true,
      trapFocus: options.trapFocus ?? true,
      role: options.role ?? 'dialog',
      ariaModal: options.ariaModal ?? true,
      emitEvents: options.emitEvents ?? true,
    };
  }

  private resolveHTMLElement(input: HTMLElement | string | null | undefined): HTMLElement | null {
    if (input == null) return null;
    if (typeof input === 'string') return document.querySelector<HTMLElement>(input);

    return input;
  }

  private resolveElementsOrThrow(): void {
    this.dialogEl = this.resolveHTMLElement(this.options.dialog);
    this.mainContentEl = this.resolveHTMLElement(this.options.mainContent ?? null);

    if (!this.dialogEl) {
      throw new Error(
        'Dialog element not found. Provide { dialog } option or ensure `.dialog-lite` exists.',
      );
    }

    this.dialogCloseEl = this.dialogEl.querySelector<HTMLElement>(this.options.closeButtonSelector);
    this.dialogBackdropEl = this.dialogEl.querySelector<HTMLElement>(this.options.backdropSelector);

    if (!this.dialogEl.hasAttribute('tabindex')) {
      this.dialogEl.setAttribute('tabindex', '-1');
    }

    if (this.options.role) {
      this.dialogEl.setAttribute('role', this.options.role);
    }

    if (this.options.ariaModal) {
      this.dialogEl.setAttribute('aria-modal', 'true');
    }
  }

  private emit(name: 'dialog-lite:open' | 'dialog-lite:close', detail: unknown): void {
    if (!this.options.emitEvents || !this.dialogEl) return;

    this.dialogEl.dispatchEvent(new CustomEvent(name, { detail }));
  }

  private lockScroll(): void {
    if (!this.options.lockScroll) return;
    if (this.prevBodyOverflow != null) return;

    const body = document.body;

    this.prevBodyOverflow = body.style.overflow;
    this.prevBodyPaddingRight = body.style.paddingRight;

    const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;

    if (scrollbarWidth > 0) {
      const currentPadding = Number.parseFloat(getComputedStyle(body).paddingRight || '0');

      body.style.paddingRight = `${currentPadding + scrollbarWidth}px`;
    }

    body.style.overflow = 'hidden';
  }

  private unlockScroll(): void {
    if (this.prevBodyOverflow == null) return;

    const body = document.body;

    body.style.overflow = this.prevBodyOverflow;
    body.style.paddingRight = this.prevBodyPaddingRight ?? '';

    this.prevBodyOverflow = null;
    this.prevBodyPaddingRight = null;
  }

  private getFocusableElements(): HTMLElement[] {
    if (!this.dialogEl) return [];

    const selector =
      'a[href],button:not([disabled]),input:not([disabled]),select:not([disabled]),textarea:not([disabled]),[tabindex]:not([tabindex="-1"])';
    const all = Array.from(this.dialogEl.querySelectorAll<HTMLElement>(selector));

    return all.filter(
      (el) => !el.hasAttribute('disabled') && el.tabIndex >= 0 && el.getClientRects().length > 0,
    );
  }

  private handleFocusTrapKeydown(event: KeyboardEvent): void {
    if (!this.options.trapFocus) return;
    if (!this.isOpen) return;
    if (event.key !== 'Tab') return;

    const focusables = this.getFocusableElements();

    if (!focusables.length) {
      this.dialogEl?.focus?.();

      event.preventDefault();

      return;
    }

    const active = document.activeElement;
    const currentIndex = active instanceof HTMLElement ? focusables.indexOf(active) : -1;

    const goingBack = event.shiftKey;
    const nextIndex = (() => {
      if (goingBack) return currentIndex <= 0 ? focusables.length - 1 : currentIndex - 1;

      return currentIndex >= focusables.length - 1 ? 0 : currentIndex + 1;
    })();

    focusables[nextIndex]?.focus?.();
    event.preventDefault();
  }

  private clearTimers(): void {
    if (this.hideTimeout != null) {
      window.clearTimeout(this.hideTimeout);

      this.hideTimeout = null;
    }

    if (this.removeExtraClassTimeout != null) {
      window.clearTimeout(this.removeExtraClassTimeout);

      this.removeExtraClassTimeout = null;
    }
  }

  private ensureInitialized(): void {
    if (this.abortController) return;

    this.init();
  }

  public init(): void {
    this.destroy();
    this.resolveElementsOrThrow();

    this.abortController = new AbortController();

    const signal = this.abortController.signal;

    if (this.options.closingButton && this.dialogCloseEl) {
      this.dialogCloseEl.addEventListener('click', () => this.close(), { signal });
    }

    if (this.options.closingBackdrop && this.dialogBackdropEl) {
      this.dialogBackdropEl.addEventListener('click', () => this.close(), { signal });
    }

    document.addEventListener(
      'keydown',
      (event: KeyboardEvent) => {
        if (event.key === 'Escape' && this.isOpen) {
          this.close();
        }
      },
      { signal },
    );

    this.dialogEl?.addEventListener('keydown', (e) => this.handleFocusTrapKeydown(e), { signal });
  }

  public destroy(): void {
    this.abortController?.abort();
    this.abortController = null;
    this.clearTimers();
    this.unlockScroll();
  }

  public open({ stylingClass = '' }: OpenOptions = {}): void {
    if (this.isDebounced()) return;

    this.ensureInitialized();
 
    if (!this.dialogEl) return;

    this.clearTimers();
    this.dialogEl.hidden = false;

    void this.dialogEl.offsetWidth;

    this.isOpen = true;
    this.lockScroll();

    if (this.mainContentEl) {
      this.mainContentEl.setAttribute('aria-hidden', 'true');
    }

    this.dialogEl.setAttribute('aria-hidden', 'false');

    const active = document.activeElement;

    this.previouslyFocusedElement = active instanceof HTMLElement ? active : null;

    this.updateClassList({
      addClass: 'dialog-lite--in',
      removeClass: 'dialog-lite--out',
      newClass: stylingClass,
    });

    const focusTarget = this.dialogEl.querySelector<HTMLElement>(this.options.focusOnOpenSelector);

    focusTarget?.focus?.();

    if (!focusTarget) {
      this.dialogEl.focus();
    }

    this.emit('dialog-lite:open', { stylingClass });
  }

  public close(): void {
    if (this.isDebounced()) return;

    this.ensureInitialized();

    if (!this.dialogEl) return;

    this.isOpen = false;
    this.unlockScroll();

    if (this.mainContentEl) {
      this.mainContentEl.setAttribute('aria-hidden', 'false');
    }

    this.dialogEl.setAttribute('aria-hidden', 'true');

    if (this.previouslyFocusedElement?.isConnected) {
      this.previouslyFocusedElement.focus();
    }

    this.updateClassList({
      addClass: 'dialog-lite--out',
      removeClass: 'dialog-lite--in',
      newClass: '',
      delayRemove: true,
    });

    this.hideTimeout = window.setTimeout(() => {
      if (this.dialogEl) {
        this.dialogEl.hidden = true;
      }

      this.hideTimeout = null;
    }, this.options.hideDelayMs);

    this.emit('dialog-lite:close', {});
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

    if (this.currentExtraClass) {
      if (delayRemove) {
        const classToRemove = this.currentExtraClass;

        this.removeExtraClassTimeout = window.setTimeout(() => {
          this.dialogEl?.classList.remove(classToRemove);
          this.currentExtraClass = '';
          this.removeExtraClassTimeout = null;
        }, this.options.hideDelayMs);
      } else {
        this.dialogEl.classList.remove(this.currentExtraClass);
        this.currentExtraClass = '';
      }
    }

    this.dialogEl.classList.remove(removeClass);
    this.dialogEl.classList.add(addClass);

    if (newClass) {
      this.dialogEl.classList.add(newClass);
      this.currentExtraClass = newClass;
    }
  }

  private isDebounced(): boolean {
    const now = Date.now();

    if (now - this.lastActionTime < this.options.debounceMs) return true;

    this.lastActionTime = now;

    return false;
  }
}

export function createDialogLite(options: DialogLiteOptions = {}): DialogLiteInstance {
  return new DialogLite(options);
}

export function initDialogLite(
  options: DialogLiteOptions & {
    injectCss?: boolean;
    cssText?: string;
    cssTarget?: Document | ShadowRoot;
  } = {},
): DialogLiteInstance {
  const { injectCss = true, cssText, cssTarget, ...dialogOptions } = options;

  if (injectCss) {
    injectDialogLiteCss({ cssText, target: cssTarget });
  }

  const instance = new DialogLite(dialogOptions);

  instance.init();

  return instance;
}

export { DialogLite };
