---
title: Usage Examples
description: Code examples for common YubiKey operations
---

## Initialize YubiKey Reader

```typescript
import { YubiKeyReader } from 'react-native-yubikey';

// Create reader instance
const reader = new YubiKeyReader({
  defaultTimeout: 45000,
  enableLogging: true,
});

// Check capabilities
const capabilities = await reader.getCapabilities();
console.log('Supported protocols:', capabilities.protocols);
```

## Read OTP (One-Time Password)

### Basic OTP Reading

```typescript
async function readOTP() {
  try {
    const otp = await reader.readOTP({
      timeout: 30000,
      onProgress: (status) => {
        console.log('Status:', status); // 'scanning', 'reading', 'complete'
      },
    });

    console.log('OTP Code:', otp.code);
    console.log('OTP Type:', otp.type); // 'TOTP', 'HOTP', or 'YUBICO'
    console.log('Validity:', otp.validFrom, otp.validUntil);
  } catch (error) {
    console.error('Failed to read OTP:', error.message);
  }
}
```

### OTP in Login Flow

```typescript
import React, { useState } from 'react';
import { View, Button, TextInput, Text, ActivityIndicator } from 'react-native';

export function LoginWithOTP() {
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const reader = new YubiKeyReader();

  const handleReadOTP = async () => {
    setLoading(true);
    setError('');
    try {
      const result = await reader.readOTP({ timeout: 30000 });
      setOtp(result.code);
    } catch (err) {
      setError('Failed to read OTP: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!email || !otp) {
      setError('Email and OTP required');
      return;
    }

    try {
      const response = await fetch('/api/login/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp }),
      });

      if (response.ok) {
        const { token } = await response.json();
        // Store token and navigate to home
      } else {
        setError('Invalid credentials');
      }
    } catch (err) {
      setError('Login failed: ' + err.message);
    }
  };

  return (
    <View style={{ padding: 20 }}>
      <TextInput
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        editable={!loading}
      />
      <TextInput
        placeholder="OTP (tap button to read)"
        value={otp}
        onChangeText={setOtp}
        editable={false}
      />
      <Button
        title={loading ? 'Reading OTP...' : 'Read OTP from YubiKey'}
        onPress={handleReadOTP}
        disabled={loading}
      />
      <Button title="Login" onPress={handleSubmit} disabled={loading} />
      {error && <Text style={{ color: 'red' }}>{error}</Text>}
    </View>
  );
}
```

## FIDO2 Authentication

### FIDO2 Registration

```typescript
async function registerWithFIDO2(userId: string, userEmail: string) {
  try {
    // Get challenge from server
    const challenge = await fetch('/api/fido2/register-begin', {
      method: 'POST',
      body: JSON.stringify({ userId, userEmail }),
    }).then(r => r.json()).then(r => r.challenge);

    // Perform registration on YubiKey
    const attestation = await reader.fido2Register({
      relyingParty: {
        id: 'example.com',
        name: 'Example App',
        origin: 'https://example.com',
      },
      user: {
        id: userId,
        name: userEmail,
        displayName: userEmail.split('@')[0],
      },
      challenge: challenge, // base64url-encoded
      pubKeyCredParams: [
        { alg: -7, type: 'public-key' }, // ES256
        { alg: -257, type: 'public-key' }, // RS256
      ],
      timeout: 60000,
      attestation: 'direct',
      authenticatorSelection: {
        authenticatorAttachment: 'cross-platform',
        userVerification: 'preferred',
        requireResidentKey: false,
      },
    });

    // Verify and store on server
    const response = await fetch('/api/fido2/register-complete', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId,
        attestationObject: attestation.attestationObject,
        clientDataJSON: attestation.clientDataJSON,
        credentialId: attestation.credentialId,
      }),
    });

    return await response.json();
  } catch (error) {
    console.error('FIDO2 Registration failed:', error);
    throw error;
  }
}
```

### FIDO2 Authentication

```typescript
async function authenticateWithFIDO2() {
  try {
    // Get assertion challenge from server
    const challenge = await fetch('/api/fido2/authenticate-begin')
      .then(r => r.json())
      .then(r => r.challenge);

    // Perform authentication
    const assertion = await reader.fido2Authenticate({
      relyingPartyId: 'example.com',
      challenge: challenge, // base64url-encoded
      allowCredentials: savedCredentials, // from registration
      timeout: 60000,
      userVerification: 'preferred',
    });

    // Verify on server
    const response = await fetch('/api/fido2/authenticate-complete', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        credentialId: assertion.credentialId,
        authenticatorData: assertion.authenticatorData,
        clientDataJSON: assertion.clientDataJSON,
        signature: assertion.signature,
      }),
    });

    return await response.json();
  } catch (error) {
    console.error('FIDO2 Authentication failed:', error);
    throw error;
  }
}
```

### Complete FIDO2 Component

```typescript
import React, { useState } from 'react';
import { View, Button, Text, ActivityIndicator } from 'react-native';
import { YubiKeyReader } from 'react-native-yubikey';

export function FIDO2Component() {
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(false);
  const reader = new YubiKeyReader();

  const handleRegister = async () => {
    setLoading(true);
    setStatus('Starting registration...');
    try {
      await registerWithFIDO2('user123', 'user@example.com');
      setStatus('Registration successful!');
    } catch (error) {
      setStatus('Registration failed: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAuthenticate = async () => {
    setLoading(true);
    setStatus('Starting authentication...');
    try {
      await authenticateWithFIDO2();
      setStatus('Authentication successful!');
    } catch (error) {
      setStatus('Authentication failed: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={{ padding: 20 }}>
      <Button
        title="Register with FIDO2"
        onPress={handleRegister}
        disabled={loading}
      />
      <Button
        title="Authenticate with FIDO2"
        onPress={handleAuthenticate}
        disabled={loading}
      />
      {loading && <ActivityIndicator />}
      <Text>{status}</Text>
    </View>
  );
}
```

## Platform-Specific Operations

### iOS-Specific: MFi YubiKey 5Ci

```typescript
import { Platform } from 'react-native';

async function handleMFiYubiKey() {
  if (Platform.OS !== 'ios') {
    console.log('MFi only supported on iOS');
    return;
  }

  const reader = new YubiKeyReader();

  // Check for MFi support
  const hasMFi = await reader.hasMFiSupport();
  if (!hasMFi) {
    console.log('Device does not support MFi accessories');
    return;
  }

  // Get connected MFi devices
  const devices = await reader.getMFiDevices();
  console.log(`Found ${devices.length} YubiKey(s)`);

  if (devices.length > 0) {
    // Select first device
    await reader.selectMFiDevice(devices[0]);

    // Perform operations
    const otp = await reader.readOTP();
    console.log('OTP from MFi key:', otp.code);
  }

  // Listen for connection changes
  reader.on('mfiDeviceConnected', (device) => {
    console.log('YubiKey connected:', device.serialNumber);
  });

  reader.on('mfiDeviceDisconnected', (device) => {
    console.log('YubiKey disconnected');
  });
}
```

### Android-Specific: USB OTG

```typescript
import { Platform } from 'react-native';

async function handleUSBOTG() {
  if (Platform.OS !== 'android') {
    console.log('USB OTG only on Android');
    return;
  }

  const reader = new YubiKeyReader();

  // Get connected USB devices
  const devices = await reader.getConnectedUSBDevices();
  console.log(`Found ${devices.length} USB device(s)`);

  if (devices.length > 0) {
    // Select first device
    await reader.selectUSBDevice(devices[0]);

    // Request permission if needed
    const permitted = await reader.requestUSBPermission(devices[0]);
    if (!permitted) {
      console.log('User denied USB permission');
      return;
    }

    // Perform operations
    const otp = await reader.readOTP();
    console.log('OTP from USB key:', otp.code);
  }

  // Listen for device changes
  reader.on('usbDeviceConnected', (device) => {
    console.log('USB device connected:', device.name);
  });

  reader.on('usbDeviceDisconnected', (device) => {
    console.log('USB device disconnected');
  });
}
```

## Error Handling

```typescript
import { YubiKeyError, YubiKeyErrorCode } from 'react-native-yubikey';

async function robustYubiKeyOperation() {
  try {
    const otp = await reader.readOTP({ timeout: 30000 });
    return otp;
  } catch (error) {
    if (error instanceof YubiKeyError) {
      switch (error.code) {
        case YubiKeyErrorCode.NFC_NOT_AVAILABLE:
          console.error('NFC is not available on this device');
          // Show fallback option
          break;

        case YubiKeyErrorCode.TIMEOUT:
          console.error('Operation timed out - user did not scan key');
          // Retry or cancel
          break;

        case YubiKeyErrorCode.USER_CANCELLED:
          console.log('User cancelled the operation');
          // No error to show
          break;

        case YubiKeyErrorCode.INVALID_KEY:
          console.error('Invalid or unrecognized YubiKey');
          // Ask user to check device
          break;

        case YubiKeyErrorCode.PROTOCOL_ERROR:
          console.error('Protocol error communicating with key');
          // Retry operation
          break;

        case YubiKeyErrorCode.DEVICE_ERROR:
          console.error('YubiKey hardware error');
          // Ask user to try again or replace key
          break;

        default:
          console.error('Unknown error:', error.message);
      }
    } else {
      console.error('Unexpected error:', error);
    }
    throw error;
  }
}
```

## Advanced Usage

### Custom Challenges

```typescript
import crypto from 'react-native-crypto';
import { base64url } from 'react-native-yubikey';

function generateChallenge(): string {
  const buffer = crypto.randomBytes(32);
  return base64url.encode(buffer);
}

async function fido2WithCustomChallenge() {
  const challenge = generateChallenge();
  
  const attestation = await reader.fido2Register({
    challenge,
    // ... other options
  });
}
```

### Timeout Configuration

```typescript
const reader = new YubiKeyReader({
  defaultTimeout: 45000,     // Global default
  nfcScanTimeout: 30000,     // For NFC operations
  usbTimeout: 60000,         // For USB operations
  fido2Timeout: 120000,      // For FIDO2 operations
});
```

### Batch Operations

```typescript
async function performMultipleOperations() {
  const reader = new YubiKeyReader();

  // For MFi connections, operations can be batched
  // without re-scanning
  try {
    const otp1 = await reader.readOTP();
    const otp2 = await reader.readOTP();
    const otp3 = await reader.readOTP();

    return [otp1, otp2, otp3];
  } catch (error) {
    console.error('Batch operation failed:', error);
    throw error;
  }
}
```

## References

- [Getting Started](./getting-started)
- [Installation Guide](./installation)
- [Security Best Practices](./security)
- [Troubleshooting](./troubleshooting)
