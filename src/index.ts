import { ICONS, CLOSE_ICON } from './icons';
import {
  NotificationGlobalConfig,
  NotificationInstance,
  NotificationOptions,
  NotificationPosition,
  NotificationType,
} from './types';

export * from './types';

const globalConfig: NotificationGlobalConfig = {
  defaultDuration: 4000,
  defaultPosition: 'bottom-center',
  stack: true,
};

const activeInstances = new Set<NotificationInstance>();

// Ensure container exists for a specific position
function getContainer(position: NotificationPosition): HTMLDivElement | null {
  if (typeof document === 'undefined') return null;

  const containerId = `shn-container-${position}`;
  let container = document.getElementById(containerId) as HTMLDivElement | null;

  if (!container) {
    container = document.createElement('div');
    container.id = containerId;
    container.className = `shn-container shn-${position}`;

    const isTop = position.startsWith('top');
    const isBottom = position.startsWith('bottom');
    const isLeft = position.endsWith('left');
    const isRight = position.endsWith('right');
    const isCenter = position.endsWith('center');

    container.style.cssText = `
      position: fixed;
      z-index: 99999;
      display: flex;
      flex-direction: ${isTop ? 'column' : 'column-reverse'};
      gap: 10px;
      pointer-events: none;
      box-sizing: border-box;
      padding: 16px;
      max-width: 100vw;
      ${isTop ? 'top: 0;' : ''}
      ${isBottom ? 'bottom: 24px;' : ''}
      ${isLeft ? 'left: 0;' : ''}
      ${isRight ? 'right: 0;' : ''}
      ${isCenter ? 'left: 50%; transform: translateX(-50%);' : ''}
    `;

    document.body.appendChild(container);
  }

  return container;
}

const TYPE_BORDERS: Record<NotificationType, string> = {
  info: 'rgba(96, 165, 250, 0.3)',
  success: 'rgba(74, 222, 128, 0.3)',
  error: 'rgba(248, 113, 113, 0.35)',
  warning: 'rgba(251, 191, 36, 0.35)',
};

/**
 * Show a notification popup (alert replacement)
 */
function createNotification(
  message: string,
  options?: NotificationOptions | NotificationType
): NotificationInstance {
  // Return dummy instance for SSR
  if (typeof window === 'undefined' || typeof document === 'undefined') {
    return {
      id: '',
      element: null,
      dismiss: () => {},
    };
  }

  const normalizedOptions: NotificationOptions =
    typeof options === 'string'
      ? { type: options }
      : options || {};

  const type: NotificationType = normalizedOptions.type || 'info';
  const duration =
    normalizedOptions.duration !== undefined
      ? normalizedOptions.duration
      : (globalConfig.defaultDuration ?? 4000);
  const position: NotificationPosition =
    normalizedOptions.position || globalConfig.defaultPosition || 'bottom-center';
  const closable = normalizedOptions.closable !== false;
  const showIcon = normalizedOptions.icon !== false;

  // Clear existing notifications if stacking is disabled
  if (!globalConfig.stack) {
    shn.dismissAll();
  }

  const container = getContainer(position);
  if (!container) {
    return { id: '', element: null, dismiss: () => {} };
  }

  const id = `shn-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
  const notif = document.createElement('div');
  notif.className = `shn-notification shn-${type} ${normalizedOptions.className || ''}`.trim();
  notif.setAttribute('data-type', type);
  notif.setAttribute('data-id', id);

  const isTop = position.startsWith('top');
  const initialTranslateY = isTop ? '-20px' : '20px';

  notif.style.cssText = `
    display: flex;
    align-items: center;
    gap: 12px;
    min-width: 280px;
    max-width: 440px;
    background: #1c1c1c;
    color: #ffffff;
    border-radius: 12px;
    padding: 12px 18px;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
    font-size: 14px;
    line-height: 1.45;
    box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.4), 0 8px 10px -6px rgba(0, 0, 0, 0.3);
    border: 1px solid ${TYPE_BORDERS[type]};
    opacity: 0;
    transform: translateY(${initialTranslateY}) scale(0.95);
    transition: opacity 0.25s cubic-bezier(0.16, 1, 0.3, 1), transform 0.25s cubic-bezier(0.16, 1, 0.3, 1);
    pointer-events: auto;
    cursor: ${normalizedOptions.onClick ? 'pointer' : 'default'};
    box-sizing: border-box;
  `;

  // Custom inline styles if passed
  if (normalizedOptions.style) {
    Object.assign(notif.style, normalizedOptions.style);
  }

  // Icon Element
  let iconHtml = '';
  if (showIcon) {
    const iconContent =
      typeof normalizedOptions.icon === 'string'
        ? normalizedOptions.icon
        : ICONS[type];
    iconHtml = `<div class="shn-icon" style="display: flex; align-items: center; justify-content: center; flex-shrink: 0;">${iconContent}</div>`;
  }

  // Close Button Element
  const closeBtnHtml = closable
    ? `<button class="shn-close-btn" aria-label="Close notification" style="
        background: transparent;
        border: none;
        color: #888888;
        cursor: pointer;
        padding: 4px;
        margin-left: auto;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 6px;
        transition: color 0.15s ease, background 0.15s ease;
        line-height: 1;
        outline: none;
      ">${CLOSE_ICON}</button>`
    : '';

  notif.innerHTML = `
    ${iconHtml}
    <div class="shn-message" style="flex: 1; color: #f3f4f6; word-break: break-word;">${message}</div>
    ${closeBtnHtml}
  `;

  // Container append
  container.appendChild(notif);

  let dismissed = false;
  let timerId: ReturnType<typeof setTimeout> | null = null;

  const dismiss = () => {
    if (dismissed) return;
    dismissed = true;

    if (timerId) clearTimeout(timerId);

    notif.style.opacity = '0';
    notif.style.transform = `translateY(${initialTranslateY}) scale(0.95)`;
    notif.style.pointerEvents = 'none';

    setTimeout(() => {
      if (notif.parentElement) {
        notif.remove();
        if (container.children.length === 0) {
          container.remove();
        }
      }
      activeInstances.delete(instance);
      if (normalizedOptions.onClose) {
        normalizedOptions.onClose();
      }
    }, 250);
  };

  const instance: NotificationInstance = {
    id,
    element: notif,
    dismiss,
  };

  activeInstances.add(instance);

  // Trigger smooth enter animation
  requestAnimationFrame(() => {
    notif.style.opacity = '1';
    notif.style.transform = 'translateY(0) scale(1)';
  });

  // Setup close button interaction
  if (closable) {
    const closeBtn = notif.querySelector<HTMLButtonElement>('.shn-close-btn');
    if (closeBtn) {
      closeBtn.addEventListener('mouseenter', () => {
        closeBtn.style.color = '#ffffff';
        closeBtn.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
      });
      closeBtn.addEventListener('mouseleave', () => {
        closeBtn.style.color = '#888888';
        closeBtn.style.backgroundColor = 'transparent';
      });
      closeBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        dismiss();
      });
    }
  }

  // Setup click handler
  if (normalizedOptions.onClick) {
    notif.addEventListener('click', (e) => {
      normalizedOptions.onClick?.(e);
    });
  }

  // Auto dismiss timer
  if (duration > 0) {
    timerId = setTimeout(() => {
      dismiss();
    }, duration);
  }

  return instance;
}

// Callable function with helper methods
interface ShnCallable {
  (message: string, options?: NotificationOptions | NotificationType): NotificationInstance;
  info: (message: string, options?: Omit<NotificationOptions, 'type'>) => NotificationInstance;
  success: (message: string, options?: Omit<NotificationOptions, 'type'>) => NotificationInstance;
  error: (message: string, options?: Omit<NotificationOptions, 'type'>) => NotificationInstance;
  warning: (message: string, options?: Omit<NotificationOptions, 'type'>) => NotificationInstance;
  dismissAll: () => void;
  config: (config: Partial<NotificationGlobalConfig>) => void;
}

export const shn: ShnCallable = Object.assign(
  (message: string, options?: NotificationOptions | NotificationType) =>
    createNotification(message, options),
  {
    info: (message: string, options?: Omit<NotificationOptions, 'type'>) =>
      createNotification(message, { ...options, type: 'info' }),
    success: (message: string, options?: Omit<NotificationOptions, 'type'>) =>
      createNotification(message, { ...options, type: 'success' }),
    error: (message: string, options?: Omit<NotificationOptions, 'type'>) =>
      createNotification(message, { ...options, type: 'error' }),
    warning: (message: string, options?: Omit<NotificationOptions, 'type'>) =>
      createNotification(message, { ...options, type: 'warning' }),
    dismissAll: () => {
      Array.from(activeInstances).forEach((instance) => instance.dismiss());
      activeInstances.clear();
    },
    config: (config: Partial<NotificationGlobalConfig>) => {
      Object.assign(globalConfig, config);
    },
  }
);

// Backward compatibility
export const showNotification = (
  message: string,
  type: NotificationType = 'info',
  duration: number = 4000
) => {
  return shn(message, { type, duration }).element;
};

// Global browser window attachment
if (typeof window !== 'undefined') {
  (window as any).shn = shn;
  (window as any).showNotification = showNotification;
}

export default shn;

