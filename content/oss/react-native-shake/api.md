---
title: API Reference
description: Full API surface for react-native-shake.
---

## `RNShake.addListener(callback)`

Registers a listener for the shake event. Returns a subscription object.

| Parameter | Type | Description |
|---|---|---|
| `callback` | `() => void` | Function called when a shake is detected |

**Returns:** `EmitterSubscription` - call `.remove()` to unsubscribe.

```tsx
const subscription = RNShake.addListener(() => {
  console.log('Device shaken!');
});

// Later, to unsubscribe:
subscription.remove();
```

## `RNShake.removeAllListeners()`

Removes all active shake event listeners.

```tsx
RNShake.removeAllListeners();
```

## `RNShake.configure(sensitivity)`

Configures how much force is required to trigger a shake event. **Android only** - has no effect on iOS, which relies on the system's built-in shake gesture.

| Parameter | Type | Description |
|---|---|---|
| `sensitivity` | `number` | Required shake force, as a multiple of Earth's gravity. Lower values trigger more easily. |

Reference points: `0.75` (light), `1.33` (normal, default), `1.8` (heavy) - or pass any custom value.

```tsx
RNShake.configure(1.8); // require a harder shake
```
