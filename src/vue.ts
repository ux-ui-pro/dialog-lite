import {
  defineComponent,
  h,
  onMounted,
  onScopeDispose,
  type PropType,
  type Ref,
  ref,
  shallowRef,
  unref,
  type VNodeChild,
  watch,
} from 'vue';
import {
  DialogLite,
  type DialogLiteCloseDetail,
  type DialogLiteInstance,
  type DialogLiteOpenDetail,
  type DialogLiteOptions,
  type OpenOptions,
} from './index';

export type DialogLiteElementSource = Ref<HTMLElement | null> | (() => HTMLElement | null);

export interface UseDialogLiteOptions
  extends Omit<DialogLiteOptions, 'dialog' | 'onOpen' | 'onClose'> {
  onOpen?: (detail: DialogLiteOpenDetail) => void;
  onClose?: (detail: DialogLiteCloseDetail) => void;
}

export interface UseDialogLiteReturn {
  dialog: Ref<DialogLite | null>;
  isOpen: Ref<boolean>;
  init: () => DialogLite | null;
  open: (options?: OpenOptions) => void;
  close: () => void;
  destroy: () => void;
}

function resolveDialogElement(source: DialogLiteElementSource): HTMLElement | null {
  if (typeof source === 'function') return source();

  return unref(source);
}

export function useDialogLite(
  dialogSource: DialogLiteElementSource,
  options: UseDialogLiteOptions = {},
): UseDialogLiteReturn {
  const dialog = shallowRef<DialogLite | null>(null);
  const isOpen = ref(false);

  const destroy = (): void => {
    dialog.value?.destroy();
    dialog.value = null;
    isOpen.value = false;
  };

  const init = (): DialogLite | null => {
    const dialogEl = resolveDialogElement(dialogSource);

    if (!dialogEl) return null;

    destroy();

    const instance = new DialogLite({
      ...options,
      dialog: dialogEl,
      onOpen: (detail) => {
        isOpen.value = true;
        options.onOpen?.(detail);
      },
      onClose: (detail) => {
        isOpen.value = false;
        options.onClose?.(detail);
      },
    });

    instance.init();
    dialog.value = instance;
    isOpen.value = instance.isOpened();

    return instance;
  };

  const open = (openOptions: OpenOptions = {}): void => {
    const instance = dialog.value ?? init();

    instance?.open(openOptions);
  };

  const close = (): void => {
    const instance = dialog.value ?? init();

    instance?.close();
  };

  onMounted(() => {
    init();
  });

  onScopeDispose(() => {
    destroy();
  });

  return {
    dialog,
    isOpen,
    init,
    open,
    close,
    destroy,
  };
}

export const DialogLiteRoot = defineComponent({
  name: 'DialogLiteRoot',
  inheritAttrs: false,
  props: {
    modelValue: {
      type: Boolean,
      default: false,
    },
    stylingClass: {
      type: String,
      default: '',
    },
    closeOnBackdrop: {
      type: Boolean,
      default: false,
    },
    closeOnButton: {
      type: Boolean,
      default: false,
    },
    closeOnEscape: {
      type: Boolean,
      default: true,
    },
    mainContent: {
      type: [String, Object] as PropType<HTMLElement | string | null>,
      default: null,
    },
    debounceMs: {
      type: Number,
      default: 500,
    },
    hideDelayMs: {
      type: Number,
      default: 500,
    },
    focusOnOpenSelector: {
      type: String,
      default: '[tabindex="0"]',
    },
    lockScroll: {
      type: Boolean,
      default: true,
    },
    trapFocus: {
      type: Boolean,
      default: true,
    },
    role: {
      type: String,
      default: 'dialog',
    },
    ariaModal: {
      type: Boolean,
      default: true,
    },
  },
  emits: {
    'update:modelValue': (_value: boolean) => true,
    open: (_detail: DialogLiteOpenDetail) => true,
    close: (_detail: DialogLiteCloseDetail) => true,
  },
  setup(props, { attrs, emit, expose, slots }) {
    const dialogRef = ref<HTMLElement | null>(null);
    let hasMounted = false;

    const controller = useDialogLite(dialogRef, {
      closingBackdrop: props.closeOnBackdrop,
      closingButton: props.closeOnButton,
      closeOnEscape: props.closeOnEscape,
      mainContent: props.mainContent,
      debounceMs: props.debounceMs,
      hideDelayMs: props.hideDelayMs,
      focusOnOpenSelector: props.focusOnOpenSelector,
      lockScroll: props.lockScroll,
      trapFocus: props.trapFocus,
      role: props.role,
      ariaModal: props.ariaModal,
      onOpen: (detail) => {
        emit('update:modelValue', true);
        emit('open', detail);
      },
      onClose: (detail) => {
        emit('update:modelValue', false);
        emit('close', detail);
      },
    });

    const open = (): void => {
      controller.open({ stylingClass: props.stylingClass });
    };

    watch(
      () => props.modelValue,
      (shouldOpen) => {
        if (shouldOpen) {
          open();
        } else {
          controller.close();
        }
      },
      { flush: 'post' },
    );

    onMounted(() => {
      hasMounted = true;

      if (props.modelValue) {
        open();
      }
    });

    expose(controller);

    return (): VNodeChild =>
      h(
        'div',
        {
          ...attrs,
          ref: dialogRef,
          class: ['dialog-lite', 'dialog-lite--out', attrs.class],
          role: props.role,
          'aria-modal': props.ariaModal ? 'true' : undefined,
          ...(hasMounted ? {} : { hidden: true, 'aria-hidden': 'true' }),
        },
        [
          slots.backdrop?.({ close: controller.close }) ??
            h('div', { class: 'dialog-lite__backdrop' }),
          h('div', { class: 'dialog-lite__container' }, [
            h('div', { class: 'dialog-lite__container-inner' }, [
              slots.close?.({ close: controller.close }) ??
                (props.closeOnButton
                  ? h(
                      'button',
                      {
                        class: 'dialog-lite-close-button',
                        type: 'button',
                        'aria-label': 'Close',
                        tabindex: 0,
                      },
                      'Close',
                    )
                  : null),
              slots.default?.({
                close: controller.close,
                isOpen: controller.isOpen.value,
                open: controller.open,
              }),
            ]),
          ]),
        ],
      );
  },
});

export type DialogLiteRootInstance = DialogLiteInstance;

export default DialogLiteRoot;
