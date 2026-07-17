---
title: Usage
description: Usage patterns for react-native-shake across current and legacy versions.
---

## Current usage (v5.x.x and higher)

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

## Adjusting sensitivity (Android only)

```tsx
RNShake.configure(1.8); // require a harder shake
```

`configure` has no effect on iOS, which relies on the system's built-in shake gesture instead of a configurable accelerometer threshold.

## Removing all listeners

```tsx
RNShake.removeAllListeners();
```

## Legacy usage

```tsx
import RNShake from 'react-native-shake';

// v4.x.x:
class MyComponent extends React.Component {
  componentDidMount() {
    RNShake.addListener(() => {
      // Your code...
    });
  }

  componentWillUnmount() {
    RNShake.removeListener();
  }
}

// v3.x.x and below:
class MyComponent extends React.Component {
  componentDidMount() {
    RNShake.addEventListener('ShakeEvent', () => {
      // Your code...
    });
  }

  componentWillUnmount() {
    RNShake.removeEventListener('ShakeEvent');
  }
}
```

## TypeScript

Full TypeScript definitions are included:

```tsx
import RNShake from 'react-native-shake';
import type { EmitterSubscription } from 'react-native';

const subscription: EmitterSubscription = RNShake.addListener(() => {
  console.log('Shake detected!');
});
```
