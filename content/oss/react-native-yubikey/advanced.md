---
title: Advanced Configuration
description: Advanced usage patterns and configuration options
---

## Reader Configuration

### Create Custom Reader Instance

```typescript
import { YubiKeyReader, LogLevel } from 'react-native-yubikey';

const reader = new YubiKeyReader({
  // Timeouts
  defaultTimeout: 45000,
  nfcScanTimeout: 30000,
  usbTimeout: 60000,
  fido2Timeout: 120000,

  // Logging
  enableLogging: true,
  logLevel: 'debug',
  logger: customLogger,

  // Features
  enableNFC: true,
  enableUSB: true,
  enableMFi: true,

  // Retry behavior
  maxRetries: 3,
  retryDelayMs: 1000,

  // Custom options
  customDeviceId: 'my-app-device-id',
});
```

### Custom Logger Implementation

```typescript
interface Logger {
  debug(msg: string, metadata?: any): void;
  info(msg: string, metadata?: any): void;
  warn(msg: string, metadata?: any): void;
  error(msg: string, error?: any): void;
}

class FirebaseLogger implements Logger {
  debug(msg: string, metadata?: any) {
    console.debug(msg, metadata);
    // Send to Firebase Analytics
  }

  info(msg: string, metadata?: any) {
    console.info(msg, metadata);
  }

  warn(msg: string, metadata?: any) {
    console.warn(msg, metadata);
  }

  error(msg: string, error?: any) {
    console.error(msg, error);
    // Send to Sentry or Crashlytics
  }
}

const reader = new YubiKeyReader({
  enableLogging: true,
  logger: new FirebaseLogger(),
});
```

## Advanced FIDO2 Configuration

### Resident Keys (Discoverable Credentials)

Store credentials on the YubiKey itself for easier authentication:

```typescript
async function registerWithResidentKey() {
  const challenge = await getServerChallenge();

  const attestation = await reader.fido2Register({
    challenge,
    pubKeyCredParams: [
      { alg: -7, type: 'public-key' }, // ES256
      { alg: -257, type: 'public-key' }, // RS256
    ],
    authenticatorSelection: {
      authenticatorAttachment: 'cross-platform', // YubiKey
      residentKey: 'preferred', // Store on key
      userVerification: 'preferred', // Biometric/PIN
    },
    timeout: 60000,
  });

  return attestation;
}
```

### Conditional UI with FIDO2

Implement conditional UI for autofill support:

```typescript
async function authenticateWithConditionalUI() {
  const challenge = await getServerChallenge();

  const assertion = await reader.fido2Authenticate({
    challenge,
    mediation: 'conditional', // Enables autofill
    timeout: 60000,
  });

  return assertion;
}
```

### Attestation Verification

Verify attestation statements server-side:

```typescript
interface AttestationVerification {
  isValid: boolean;
  credentialId: string;
  aaguid: string;
  credentialPublicKey: any;
  signCount: number;
}

async function verifyAttestation(
  attestationObject: string,
  clientDataJSON: string
): Promise<AttestationVerification> {
  // Decode attestationObject from base64url
  const attestation = cbor.decode(Buffer.from(attestationObject, 'utf-8'));

  // Verify format
  if (attestation.fmt !== 'fido-u2f' && attestation.fmt !== 'packed') {
    throw new Error('Unsupported attestation format');
  }

  // Verify signature
  const verified = verifyAttestationSignature(attestation);
  if (!verified) {
    throw new Error('Invalid attestation signature');
  }

  return {
    isValid: true,
    credentialId: attestation.authData.credentialId,
    aaguid: attestation.authData.aaguid,
    credentialPublicKey: attestation.authData.credentialPublicKey,
    signCount: attestation.authData.signCount,
  };
}
```

## Custom Challenge Generation

### Cryptographically Secure Challenges

```typescript
import crypto from 'react-native-crypto';

function generateSecureChallenge(lengthBytes: number = 32): string {
  const buffer = crypto.randomBytes(lengthBytes);
  return Buffer.from(buffer).toString('base64url');
}

// Verify challenge on server
async function verifyChallenge(
  storedChallenge: string,
  receivedChallenge: string
): Promise<boolean> {
  const stored = Buffer.from(storedChallenge, 'base64url');
  const received = Buffer.from(receivedChallenge, 'base64url');

  // Use constant-time comparison to prevent timing attacks
  return crypto.timingSafeEqual(stored, received);
}
```

### Challenge Rotation

```typescript
interface StoredChallenge {
  value: string;
  createdAt: Date;
  expiresAt: Date;
  used: boolean;
}

async function generateAndStoreChallenge(
  userId: string,
  expirationSeconds: number = 300
): Promise<string> {
  const challenge = generateSecureChallenge();
  const now = new Date();
  const expiresAt = new Date(now.getTime() + expirationSeconds * 1000);

  // Store in database
  await storeChallenge(userId, {
    value: challenge,
    createdAt: now,
    expiresAt,
    used: false,
  });

  return challenge;
}

async function verifyChallengeUsage(
  userId: string,
  challenge: string
): Promise<boolean> {
  const stored = await getChallengeFromStorage(userId, challenge);

  if (!stored) {
    return false; // Challenge not found
  }

  if (stored.used) {
    return false; // Challenge already used
  }

  if (new Date() > stored.expiresAt) {
    return false; // Challenge expired
  }

  // Mark as used
  await markChallengeAsUsed(userId, challenge);

  return true;
}
```

## Connection Management

### Device Selection UI

```typescript
import React, { useState, useEffect } from 'react';
import {
  View,
  FlatList,
  TouchableOpacity,
  Text,
  ActivityIndicator,
} from 'react-native';
import { YubiKeyReader } from 'react-native-yubikey';

interface Device {
  id: string;
  name: string;
  type: 'nfc' | 'usb' | 'mfi';
}

export function DeviceSelector() {
  const [devices, setDevices] = useState<Device[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDevice, setSelectedDevice] = useState<Device | null>(null);

  const reader = new YubiKeyReader();

  useEffect(() => {
    async function discoverDevices() {
      setLoading(true);
      try {
        const discoveredDevices: Device[] = [];

        // Check for MFi devices (iOS)
        const mfiDevices = await reader.getMFiDevices();
        discoveredDevices.push(
          ...mfiDevices.map(d => ({
            id: d.serialNumber,
            name: `YubiKey 5Ci (${d.serialNumber})`,
            type: 'mfi' as const,
          }))
        );

        // Check for USB devices (Android)
        const usbDevices = await reader.getConnectedUSBDevices();
        discoveredDevices.push(
          ...usbDevices.map((d, i) => ({
            id: `usb-${i}`,
            name: `USB Device ${i + 1}`,
            type: 'usb' as const,
          }))
        );

        setDevices(discoveredDevices);
      } catch (error) {
        console.error('Device discovery failed:', error);
      } finally {
        setLoading(false);
      }
    }

    discoverDevices();

    // Refresh every 3 seconds
    const interval = setInterval(discoverDevices, 3000);
    return () => clearInterval(interval);
  }, []);

  const handleSelectDevice = async (device: Device) => {
    try {
      if (device.type === 'mfi') {
        const mfiDevice = await reader.getMFiDevices()
          .then(d => d.find(x => x.serialNumber === device.id));
        if (mfiDevice) {
          await reader.selectMFiDevice(mfiDevice);
        }
      } else if (device.type === 'usb') {
        const usbDevice = await reader.getConnectedUSBDevices()
          .then(d => d[parseInt(device.id.split('-')[1])]);
        if (usbDevice) {
          await reader.selectUSBDevice(usbDevice);
        }
      }

      setSelectedDevice(device);
    } catch (error) {
      console.error('Failed to select device:', error);
    }
  };

  if (loading) {
    return <ActivityIndicator />;
  }

  return (
    <View>
      <FlatList
        data={devices}
        keyExtractor={d => d.id}
        renderItem={({ item }) => (
          <TouchableOpacity
            onPress={() => handleSelectDevice(item)}
            style={{
              padding: 10,
              backgroundColor:
                selectedDevice?.id === item.id ? '#e3f2fd' : '#fff',
            }}
          >
            <Text>{item.name}</Text>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}
```

### Persistent Connections

For MFi/USB connections, maintain a persistent connection:

```typescript
interface PersistentConnection {
  deviceId: string;
  isConnected: boolean;
  connect(): Promise<void>;
  disconnect(): Promise<void>;
  execute<T>(operation: () => Promise<T>): Promise<T>;
}

class YubiKeyConnection implements PersistentConnection {
  deviceId: string;
  isConnected: boolean = false;
  private reader: YubiKeyReader;
  private reconnectAttempts: number = 0;
  private maxReconnectAttempts: number = 3;

  constructor(deviceId: string) {
    this.deviceId = deviceId;
    this.reader = new YubiKeyReader();
  }

  async connect(): Promise<void> {
    try {
      const devices = await this.reader.getMFiDevices();
      const device = devices.find(d => d.serialNumber === this.deviceId);

      if (device) {
        await this.reader.selectMFiDevice(device);
        this.isConnected = true;
        this.reconnectAttempts = 0;
      }
    } catch (error) {
      throw new Error(`Failed to connect to device: ${error.message}`);
    }
  }

  async disconnect(): Promise<void> {
    this.isConnected = false;
  }

  async execute<T>(operation: () => Promise<T>): Promise<T> {
    if (!this.isConnected) {
      await this.connect();
    }

    try {
      return await operation();
    } catch (error) {
      // Attempt reconnection and retry
      if (this.reconnectAttempts < this.maxReconnectAttempts) {
        this.reconnectAttempts++;
        await this.disconnect();
        await this.connect();
        return await operation();
      }
      throw error;
    }
  }
}
```

## Batch Operations

### Transaction-Like Behavior

```typescript
interface BatchOperation {
  name: string;
  execute(): Promise<any>;
}

class YubiKeyBatch {
  private operations: BatchOperation[] = [];
  private reader: YubiKeyReader;

  constructor(reader: YubiKeyReader) {
    this.reader = reader;
  }

  add(name: string, operation: () => Promise<any>): this {
    this.operations.push({
      name,
      execute: operation,
    });
    return this;
  }

  async execute(): Promise<Map<string, any>> {
    const results = new Map<string, any>();

    for (const op of this.operations) {
      try {
        results.set(op.name, await op.execute());
      } catch (error) {
        // Log error but continue with next operation
        console.error(`Batch operation '${op.name}' failed:`, error);
        results.set(op.name, { error: error.message });
      }
    }

    return results;
  }
}

// Usage
const batch = new YubiKeyBatch(reader);

batch
  .add('otp1', () => reader.readOTP())
  .add('otp2', () => reader.readOTP({ timeout: 40000 }))
  .add('attestation', () =>
    reader.fido2Register({ challenge, /* ... */ })
  );

const results = await batch.execute();
```

## Performance Optimization

### Connection Pooling

```typescript
class YubiKeyPool {
  private connections: Map<string, YubiKeyConnection> = new Map();
  private maxConnections: number = 5;

  async getConnection(deviceId: string): Promise<YubiKeyConnection> {
    let connection = this.connections.get(deviceId);

    if (!connection) {
      if (this.connections.size >= this.maxConnections) {
        // Evict oldest connection
        const oldest = this.connections.entries().next().value;
        if (oldest) {
          oldest[1].disconnect();
          this.connections.delete(oldest[0]);
        }
      }

      connection = new YubiKeyConnection(deviceId);
      this.connections.set(deviceId, connection);
    }

    return connection;
  }

  closeAll(): void {
    this.connections.forEach(conn => conn.disconnect());
    this.connections.clear();
  }
}
```

### Caching Challenge Results

```typescript
interface CachedChallenge {
  value: string;
  createdAt: Date;
  ttlMs: number;
}

class ChallengeCache {
  private cache: Map<string, CachedChallenge> = new Map();

  store(key: string, challenge: string, ttlMs: number = 300000): void {
    this.cache.set(key, {
      value: challenge,
      createdAt: new Date(),
      ttlMs,
    });

    // Auto-cleanup on TTL
    setTimeout(() => this.cache.delete(key), ttlMs);
  }

  retrieve(key: string): string | null {
    const cached = this.cache.get(key);

    if (!cached) {
      return null;
    }

    const age = Date.now() - cached.createdAt.getTime();
    if (age > cached.ttlMs) {
      this.cache.delete(key);
      return null;
    }

    return cached.value;
  }

  clear(): void {
    this.cache.clear();
  }
}
```

## Monitoring & Analytics

### Operation Tracking

```typescript
interface OperationMetrics {
  operationName: string;
  startTime: Date;
  endTime: Date;
  duration: number;
  success: boolean;
  errorMessage?: string;
  metadata?: Record<string, any>;
}

class MetricsCollector {
  private metrics: OperationMetrics[] = [];

  track<T>(
    operationName: string,
    operation: () => Promise<T>
  ): Promise<T> {
    const startTime = new Date();

    return operation()
      .then(result => {
        const endTime = new Date();
        this.recordMetric({
          operationName,
          startTime,
          endTime,
          duration: endTime.getTime() - startTime.getTime(),
          success: true,
        });
        return result;
      })
      .catch(error => {
        const endTime = new Date();
        this.recordMetric({
          operationName,
          startTime,
          endTime,
          duration: endTime.getTime() - startTime.getTime(),
          success: false,
          errorMessage: error.message,
        });
        throw error;
      });
  }

  private recordMetric(metric: OperationMetrics): void {
    this.metrics.push(metric);

    // Send to analytics service
    this.sendToAnalytics(metric);

    // Keep only recent metrics
    if (this.metrics.length > 1000) {
      this.metrics = this.metrics.slice(-500);
    }
  }

  private sendToAnalytics(metric: OperationMetrics): void {
    // Send to your analytics backend
    fetch('/api/metrics', {
      method: 'POST',
      body: JSON.stringify({
        ...metric,
        startTime: metric.startTime.toISOString(),
        endTime: metric.endTime.toISOString(),
      }),
    }).catch(err => console.error('Metrics send failed:', err));
  }

  getMetrics(): OperationMetrics[] {
    return [...this.metrics];
  }

  getSummary() {
    const successful = this.metrics.filter(m => m.success).length;
    const failed = this.metrics.filter(m => !m.success).length;
    const avgDuration =
      this.metrics.reduce((sum, m) => sum + m.duration, 0) /
      this.metrics.length;

    return {
      total: this.metrics.length,
      successful,
      failed,
      successRate: (successful / this.metrics.length) * 100,
      averageDuration: Math.round(avgDuration),
    };
  }
}
```

## References

- [Getting Started](./getting-started)
- [Usage Examples](./usage)
- [Security Best Practices](./security)
- [Troubleshooting](./troubleshooting)
