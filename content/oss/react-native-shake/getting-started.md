---
title: Getting Started
description: Install react-native-shake and wire up your first shake listener.
---

## Install

```bash
npm install react-native-shake
# or
yarn add react-native-shake
```

## iOS setup

Run pod install after installing the package:

```bash
cd ios && pod install
```

## Android setup

No additional configuration required - the library links automatically via autolinking (React Native 0.60+).

## First listener

```tsx
import React from 'react';
import RNShake from 'react-native-shake';

export const MyComponent = () => {
  React.useEffect(() => {
    const subscription = RNShake.addListener(() => {
      // Your shake handler here...
    });

    return () => {
      subscription.remove();
    };
  }, []);

  return null;
};
```

`addListener` returns an `EmitterSubscription` - call `.remove()` on unmount to avoid leaking listeners.

The library works out of the box on both the New Architecture (Turbo Modules) and the old/legacy architecture - no extra flags or setup needed either way.

Test on a **real device** - shake detection is unreliable in simulators/emulators since it relies on actual accelerometer input.
