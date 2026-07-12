---
title: Advanced Patterns
description: Patterns you can build on top of the library - not built-in APIs
---

Nothing in this page is a shipped API. The library exports plain namespaced functions and no class, hook, connection pool, or batching helper - if you want these conveniences, you build them yourself around `Core` and the module functions. This page shows patterns that are consistent with the real API surface described in [Usage](./usage).

## Building your own `useYubiKey` hook

The library doesn't export a hook (the one shown in this project's own example app lives in the example's `context/`, not in the package). A minimal version:

```typescript
import { useEffect, useState, useCallback } from 'react';
import { Core } from '@doko/react-native-yubikit';
import type { YubiKeyDevice, YubiKeyEvent } from '@doko/react-native-yubikit';

export function useYubiKey() {
  const [devices, setDevices] = useState<YubiKeyDevice[]>([]);
  const [lastError, setLastError] = useState<string | null>(null);

  useEffect(() => {
    const subscription = Core.addYubiKeyListener((event: YubiKeyEvent) => {
      if (event.type === 'attached') {
        setDevices((prev) => [...prev, event.device]);
      } else if (event.type === 'detached') {
        setDevices((prev) => prev.filter((d) => d.handle !== event.handle));
      } else if (event.type === 'error') {
        setLastError(event.error);
      }
    });

    Core.startUsbDiscovery({ handlePermissions: true });
    Core.startNfcDiscovery();

    return () => {
      subscription.remove();
      Core.stopUsbDiscovery();
      Core.stopNfcDiscovery();
    };
  }, []);

  return { devices, lastError };
}
```

## Sequencing multiple operations against one device

Since every module function takes `device.handle` directly and manages its own connection, you can call several in sequence without any manual connect/disconnect bookkeeping:

```typescript
async function collectDeviceSummary(device) {
  const info = await Support.readInfo(device.handle);
  const name = Support.getName(info);
  const oathCredentials = await Oath.getCredentials(device.handle).catch(() => null);
  const pivPinAttempts = await Piv.getPinAttempts(device.handle).catch(() => null);

  return { name, serialNumber: info.serialNumber, oathCredentials, pivPinAttempts };
}
```

Each `.catch(() => null)` here is deliberate - a device might not have OATH or PIV enabled, and you don't want one missing application to fail the whole summary.

## Platform-gated calls

Because iOS is missing OpenPGP, most of YubiOtp's slot-programming surface, and FIDO2 credential management, wrap those calls so you fail fast with a clear message instead of surfacing a generic `"Not implemented on iOS"` rejection deep in a stack trace:

```typescript
import { Platform } from 'react-native';

function assertAndroid(feature: string) {
  if (Platform.OS !== 'android') {
    throw new Error(`${feature} is only available on Android with this library`);
  }
}

async function pgpSign(device, payload) {
  assertAndroid('OpenPGP signing');
  return OpenPgp.sign(device.handle, payload);
}
```

## Raw APDU access

`Core.requestConnection` / `Core.sendApdu` / `Core.closeConnection` are the one place you do manage a connection handle explicitly - useful if you need to talk to an applet this library doesn't wrap at a higher level:

```typescript
import { Core } from '@doko/react-native-yubikit';

async function withSmartCardConnection<T>(
  device,
  fn: (connectionHandle: string) => Promise<T>,
): Promise<T> {
  const connectionHandle = await Core.requestConnection(device.handle, 'SmartCardConnection');
  try {
    return await fn(connectionHandle);
  } finally {
    Core.closeConnection(connectionHandle);
  }
}

const response = await withSmartCardConnection(device, (handle) =>
  Core.sendApdu(handle, base64Apdu),
);
```

## What this library does not give you

- No connection pooling, retry policies, or timeouts beyond what you write yourself.
- No metrics/analytics hooks - if you want operation timing or success/failure counts, wrap the calls yourself, same as the sequencing example above.
- No built-in challenge generation, credential caching, or backup-code flow - these are entirely your app's/server's responsibility.

## Related

- [Usage Examples](./usage) for the real function signatures these patterns build on
- [Troubleshooting](./troubleshooting) for platform gaps to guard against
