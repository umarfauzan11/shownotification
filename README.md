# @bmdu_studio/shnjs

> Super lightweight, zero-dependency, and elegant notification/alert replacement library for modern web applications.

Say goodbye to jarring `alert()` popups. Replace them effortlessly with `shn()`.

---

## ⚡ Installation

```bash
npm install @bmdu_studio/shnjs
```

Or using yarn/pnpm/bun:
```bash
pnpm add @bmdu_studio/shnjs
# or
bun add @bmdu_studio/shnjs
```

---

## 🚀 Quick Start

### 1. Minimal Usage (Drop-in `alert()` replacement)

```typescript
import { shn } from '@bmdu_studio/shnjs';

// Just like alert(), but beautiful
shn("Data saved successfully!");
```

### 2. Shorthand Methods with Type-specific Icons & Accents

```typescript
shn.success("Transaction completed!");
shn.error("Failed to connect to server.");
shn.warning("Your session is about to expire.");
shn.info("New update available.");
```

---

## 🛠️ Advanced Usage

### Custom Options

```typescript
shn("File uploaded!", {
  type: "success",
  duration: 5000,           // Duration in ms (0 = stays until closed)
  position: "top-right",    // 'top-center' | 'top-left' | 'top-right' | 'bottom-center' | 'bottom-left' | 'bottom-right'
  closable: true,           // Show close button
  icon: true,               // Show default icon (or pass custom SVG / false)
  onClick: (e) => {
    console.log("Notification clicked!");
  },
  onClose: () => {
    console.log("Notification dismissed");
  }
});
```

### Manual Dismiss & Dismiss All

```typescript
// Dismiss specific notification
const notif = shn("Processing your payment...", { duration: 0 });
// ... later
notif.dismiss();

// Dismiss all active notifications
shn.dismissAll();
```

### Global Configuration

```typescript
shn.config({
  defaultDuration: 3000,
  defaultPosition: 'top-right',
  stack: true, // true to stack multiple notifications, false to show only one at a time
});
```

---

## 🌐 Browser / Script Tag Usage

You can also use it directly via CDN without build tools:

```html
<script src="https://unpkg.com/@bmdu_studio/shnjs/dist/index.global.js"></script>
<script>
  shn.success("Hello from CDN!");
</script>
```

---

## 📜 License

MIT © [BMDU Studio](https://github.com/bmdu-studio)
