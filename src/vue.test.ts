// @vitest-environment jsdom

import { mount } from '@vue/test-utils';
import { describe, expect, it, vi } from 'vitest';
import { defineComponent, h, nextTick, ref } from 'vue';
import { DialogLiteRoot, useDialogLite } from './vue';

describe('useDialogLite', () => {
  it('binds to a Vue ref and destroys the controller on unmount', async () => {
    const onOpen = vi.fn();
    const onClose = vi.fn();
    const wrapper = mount(
      defineComponent({
        setup() {
          const dialogRef = ref<HTMLElement | null>(null);
          const dialog = useDialogLite(dialogRef, {
            debounceMs: 0,
            hideDelayMs: 0,
            onOpen,
            onClose,
          });

          return { dialog, dialogRef };
        },
        render() {
          return h(
            'div',
            {
              ref: 'dialogRef',
              class: 'dialog-lite dialog-lite--out',
              hidden: true,
              'aria-hidden': 'true',
            },
            [
              h('div', { class: 'dialog-lite__backdrop' }),
              h('div', { class: 'dialog-lite__container' }, [
                h('div', { class: 'dialog-lite__container-inner' }, [
                  h('button', { tabindex: 0 }, 'Focusable'),
                ]),
              ]),
            ],
          );
        },
      }),
      { attachTo: document.body },
    );

    await nextTick();

    const vm = wrapper.vm as unknown as { dialog: ReturnType<typeof useDialogLite> };

    vm.dialog.open({ stylingClass: 'dialog-lite--from-composable' });

    expect(vm.dialog.isOpen.value).toBe(true);
    expect(onOpen).toHaveBeenCalledWith({ stylingClass: 'dialog-lite--from-composable' });

    vm.dialog.close();

    expect(vm.dialog.isOpen.value).toBe(false);
    expect(onClose).toHaveBeenCalledWith({});

    wrapper.unmount();

    expect(vm.dialog.dialog.value).toBe(null);
  });
});

describe('DialogLiteRoot', () => {
  it('supports v-model style control and backdrop close', async () => {
    const wrapper = mount(DialogLiteRoot, {
      attachTo: document.body,
      props: {
        modelValue: false,
        closeOnBackdrop: true,
        debounceMs: 0,
        hideDelayMs: 0,
        stylingClass: 'dialog-lite--game-won',
      },
      slots: {
        default: '<button tabindex="0">Content</button>',
      },
    });

    await wrapper.setProps({ modelValue: true });

    const dialogEl = wrapper.element as HTMLElement;

    expect(dialogEl.hidden).toBe(false);
    expect(dialogEl.classList.contains('dialog-lite--in')).toBe(true);
    expect(dialogEl.classList.contains('dialog-lite--game-won')).toBe(true);
    expect(wrapper.emitted('update:modelValue')?.at(-1)).toEqual([true]);

    await wrapper.find('.dialog-lite__backdrop').trigger('click');

    expect(wrapper.emitted('update:modelValue')?.at(-1)).toEqual([false]);
    expect(wrapper.emitted('close')).toHaveLength(1);
  });
});
