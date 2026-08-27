export type NotificationType = 'info' | 'success' | 'error' | 'warning';

export type NotificationPosition =
  | 'bottom-center'
  | 'bottom-left'
  | 'bottom-right'
  | 'top-center'
  | 'top-left'
  | 'top-right';

export interface NotificationOptions {
  /**
   * Type of notification: 'info' | 'success' | 'error' | 'warning'
   * @default 'info'
   */
  type?: NotificationType;
  /**
   * Auto dismiss duration in milliseconds. Set to 0 to disable auto dismiss.
   * @default 4000
   */
  duration?: number;
  /**
   * Screen position for notification.
   * @default 'bottom-center'
   */
  position?: NotificationPosition;
  /**
   * Whether to display close button.
   * @default true
   */
  closable?: boolean;
  /**
   * Enable/disable icon or provide custom HTML/SVG string.
   * @default true
   */
  icon?: boolean | string;
  /**
   * Custom CSS styles for the notification element.
   */
  style?: Record<string, string>;
  /**
   * Custom CSS class name.
   */
  className?: string;
  /**
   * Callback when notification element is clicked.
   */
  onClick?: (event: MouseEvent) => void;
  /**
   * Callback when notification is dismissed.
   */
  onClose?: () => void;
}

export interface NotificationGlobalConfig {
  defaultDuration?: number;
  defaultPosition?: NotificationPosition;
  stack?: boolean;
}

export interface NotificationInstance {
  id: string;
  element: HTMLDivElement | null;
  dismiss: () => void;
}
