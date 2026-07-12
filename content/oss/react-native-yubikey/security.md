---
title: Security Best Practices
description: Security guidelines for YubiKey authentication implementation
---

## Core Security Principles

### 1. Server-Side Validation

**Always validate on the server.** Never trust client-side validation alone.

```typescript
// ❌ INSECURE - Client-only validation
async function insecureLogin(otp: string) {
  if (otp.length === 44) {
    // Looks valid, grant access
    return true;
  }
}

// ✅ SECURE - Server validates
async function secureLogin(email: string, otp: string) {
  const response = await fetch('/api/login/verify-otp', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, otp }),
  });

  const data = await response.json();
  return data.success; // Server validates and returns result
}
```

### 2. Challenge/Response Verification

For FIDO2 and WebAuthn operations, always:

1. Generate random challenge on server
2. Send to client
3. Client performs operation with challenge
4. Server verifies same challenge in response

```typescript
// Server-side: Initiate FIDO2 registration
app.post('/api/fido2/register-begin', async (req, res) => {
  const challenge = crypto.randomBytes(32).toString('base64url');
  
  // Store challenge temporarily (with expiration)
  await redis.setex(
    `fido2:challenge:${req.user.id}`,
    300, // 5 minute expiration
    challenge
  );

  res.json({ challenge });
});

// Server-side: Complete FIDO2 registration
app.post('/api/fido2/register-complete', async (req, res) => {
  const challenge = await redis.get(`fido2:challenge:${req.user.id}`);
  
  if (!challenge) {
    return res.status(400).json({ error: 'Challenge expired' });
  }

  // Verify challenge is in the attestation response
  const storedChallenge = Buffer.from(challenge, 'utf-8');
  const receivedChallenge = Buffer.from(
    req.body.clientDataJSON.challenge,
    'utf-8'
  );

  if (!storedChallenge.equals(receivedChallenge)) {
    return res.status(400).json({ error: 'Invalid challenge' });
  }

  // Continue with registration
});
```

### 3. HTTPS Only

Never transmit YubiKey-related data over unencrypted connections.

```typescript
// ❌ INSECURE
const insecureUrl = 'http://example.com/api/verify-otp';

// ✅ SECURE
const secureUrl = 'https://example.com/api/verify-otp';

// Enforce in app
if (!url.startsWith('https://')) {
  throw new Error('HTTPS required for security operations');
}
```

### 4. Certificate Pinning

For high-security applications, implement certificate pinning:

```typescript
import { PinningHandler } from 'react-native-pinning-handler';

const pinningConfig = {
  'example.com': {
    pins: [
      'sha256/AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA=',
      // Add your certificate pins
    ],
    includeSubdomains: true,
  },
};

const secureFetch = (url: string, options: any) => {
  return PinningHandler.fetch(url, {
    ...options,
    pinningConfig,
  });
};

// Use secureFetch instead of fetch for sensitive operations
const response = await secureFetch('/api/verify-otp', {
  method: 'POST',
  body: JSON.stringify({ otp }),
});
```

## Authentication Implementation

### Rate Limiting

Implement rate limiting to prevent brute force attacks:

```typescript
// Server-side implementation
const rateLimit = require('express-rate-limit');

const otpLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 attempts
  message: 'Too many OTP verification attempts',
  keyGenerator: (req) => req.user.email, // Rate limit by user
  skip: (req) => req.user?.isAdmin, // Skip for admins if needed
});

app.post('/api/login/verify-otp', otpLimiter, async (req, res) => {
  // Verify OTP
});

// Client-side: Disable button after attempts
function OTPInput() {
  const [attempts, setAttempts] = useState(0);
  const maxAttempts = 5;

  const handleVerify = async () => {
    if (attempts >= maxAttempts) {
      alert('Too many attempts. Try again later.');
      return;
    }

    try {
      // Verify OTP
    } catch (error) {
      setAttempts(prev => prev + 1);
    }
  };

  return (
    <Button
      onPress={handleVerify}
      disabled={attempts >= maxAttempts}
    />
  );
}
```

### Session Management

Implement secure session handling:

```typescript
// Store session securely
import * as SecureStore from 'expo-secure-store';

async function storeAuthToken(token: string) {
  await SecureStore.setItemAsync('authToken', token);
}

async function getAuthToken(): Promise<string | null> {
  return await SecureStore.getItemAsync('authToken');
}

// Use token with timeout
async function executeWithToken(operation: () => Promise<any>) {
  const token = await getAuthToken();
  
  if (!token) {
    throw new Error('No authentication token');
  }

  try {
    return await operation();
  } catch (error) {
    if (error.status === 401) {
      // Token expired
      await SecureStore.deleteItemAsync('authToken');
      throw new Error('Session expired');
    }
    throw error;
  }
}
```

### Session Refresh

Periodically refresh authentication even with YubiKey:

```typescript
import { useEffect, useState } from 'react';
import * as SecureStore from 'expo-secure-store';

export function useAuthSession() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    // Check session every 5 minutes
    const interval = setInterval(async () => {
      const token = await SecureStore.getItemAsync('authToken');
      
      if (token) {
        try {
          // Verify token is still valid
          const response = await fetch('/api/auth/verify', {
            headers: { 'Authorization': `Bearer ${token}` },
          });
          
          if (!response.ok) {
            // Token invalid, re-authenticate
            await SecureStore.deleteItemAsync('authToken');
            setIsAuthenticated(false);
          }
        } catch (error) {
          console.error('Token verification failed:', error);
        }
      }
    }, 5 * 60 * 1000);

    return () => clearInterval(interval);
  }, []);

  return { isAuthenticated };
}
```

## Credential Management

### Secure Storage

Store credentials securely using platform-native storage:

```typescript
import * as SecureStore from 'expo-secure-store';

// Store FIDO2 credential ID
async function storeFIDO2CredentialId(credentialId: string) {
  await SecureStore.setItemAsync('fido2_cred_id', credentialId);
}

// Retrieve credential ID
async function getFIDO2CredentialId(): Promise<string> {
  const credentialId = await SecureStore.getItemAsync('fido2_cred_id');
  if (!credentialId) {
    throw new Error('No FIDO2 credential found');
  }
  return credentialId;
}

// Delete on logout
async function clearFIDO2Credential() {
  await SecureStore.deleteItemAsync('fido2_cred_id');
}
```

### Credential Recovery

Implement secure credential recovery:

```typescript
async function registerBackupCredentials() {
  // After primary FIDO2 registration, offer backup codes
  const response = await fetch('/api/auth/backup-codes', {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${token}` },
  });

  const { codes } = await response.json();

  // Display codes for user to save
  // Generate QR code for backup
  const qrCode = await generateQRCode(codes.join('\n'));

  return { codes, qrCode };
}

// Use backup code if YubiKey is lost
async function authenticateWithBackupCode(backupCode: string) {
  const response = await fetch('/api/auth/verify-backup-code', {
    method: 'POST',
    body: JSON.stringify({ backupCode }),
  });

  if (response.ok) {
    const { token } = await response.json();
    // Allow user to set up new device
    return token;
  }
}
```

## Key Management

### Key Rotation

Implement key rotation for server-side keys:

```typescript
// Server-side key rotation
async function rotateKeys() {
  const oldKey = await getSigningKey();
  const newKey = generateNewSigningKey();

  // Store both keys temporarily
  await storeSigningKey('current', newKey);
  await storeSigningKey('previous', oldKey);

  // After rotation period, delete old key
  setTimeout(() => {
    deleteSigningKey('previous');
  }, 30 * 24 * 60 * 60 * 1000); // 30 days
}

// Use key for verification
async function verifyAttestationSignature(signature: string) {
  const currentKey = await getSigningKey('current');
  const previousKey = await getSigningKey('previous');

  return (
    verify(signature, currentKey) ||
    verify(signature, previousKey)
  );
}
```

## Error Handling

### Don't Leak Information

Be careful with error messages to avoid leaking sensitive information:

```typescript
// ❌ INSECURE - Leaks information
async function loginWithOTP(email: string, otp: string) {
  try {
    const response = await fetch('/api/login/verify-otp', {
      method: 'POST',
      body: JSON.stringify({ email, otp }),
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message); // User doesn't exist? OTP invalid?
    }
  } catch (error) {
    alert(error.message); // Reveals too much
  }
}

// ✅ SECURE - Generic error message
async function loginWithOTP(email: string, otp: string) {
  try {
    const response = await fetch('/api/login/verify-otp', {
      method: 'POST',
      body: JSON.stringify({ email, otp }),
    });
    
    if (!response.ok) {
      throw new Error('Invalid email or OTP');
    }
  } catch (error) {
    alert('Authentication failed. Please try again.');
  }
}
```

### Log Appropriately

Log security events without exposing sensitive data:

```typescript
// ❌ INSECURE - Logs sensitive data
console.log('OTP:', otp.code); // Logs to console
console.log('User:', email); // Logs to console

// ✅ SECURE - Logs only what's needed
console.log('OTP verification attempted for user');
logger.info('fido2_registration_completed', {
  userId: userId,
  timestamp: new Date(),
  // Don't log: attestationObject, clientDataJSON, credentialId
});
```

## Data Protection

### Encrypt Sensitive Data

Encrypt sensitive data before transmission:

```typescript
import TweetNaCl from 'tweetnacl';

async function encryptBeforeTransit(data: string, publicKey: Uint8Array) {
  const nonce = TweetNaCl.randomBytes(24);
  const encrypted = TweetNaCl.box(
    Buffer.from(data),
    nonce,
    publicKey,
    clientPrivateKey
  );

  return {
    nonce: Buffer.from(nonce).toString('base64'),
    encrypted: Buffer.from(encrypted).toString('base64'),
  };
}
```

### Clear Sensitive Data

Always clear sensitive data from memory:

```typescript
async function handleFIDO2Operation(otp: string) {
  try {
    // Use OTP
    const result = await reader.readOTP();
    
    // Clear from memory
    otp = '';
    result = undefined;
  } finally {
    // Ensure cleanup even on error
    otp = '';
  }
}
```

## Audit Logging

Implement comprehensive audit logging:

```typescript
interface AuditLog {
  timestamp: Date;
  userId: string;
  action: string;
  status: 'success' | 'failure';
  metadata?: Record<string, any>;
}

async function logAuditEvent(event: AuditLog) {
  // Send to secure logging service
  await fetch('/api/audit-logs', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      ...event,
      timestamp: event.timestamp.toISOString(),
    }),
  });
}

// Use for all security-relevant events
await logAuditEvent({
  timestamp: new Date(),
  userId: user.id,
  action: 'fido2_authentication',
  status: 'success',
  metadata: { deviceType: 'YubiKey5Ci' },
});
```

## Compliance Considerations

### GDPR

- Store minimal PII associated with YubiKeys
- Implement data deletion on account removal
- Provide data export functionality

### HIPAA

If handling health data:
- Use encryption in transit and at rest
- Implement audit logging
- Follow access control policies
- Use business associate agreements with cloud providers

### PCI-DSS

If handling payment data:
- Tokenize credential data
- Use FIDO2 instead of passwords
- Implement strong encryption
- Regular security assessments

## Security Checklist

- [ ] All YubiKey operations use HTTPS
- [ ] Server-side validation for all authentication
- [ ] Challenge/response verification for FIDO2
- [ ] Rate limiting on authentication endpoints
- [ ] Session timeout and refresh implemented
- [ ] Secure credential storage (no plaintext)
- [ ] Certificate pinning (if applicable)
- [ ] Error messages don't leak information
- [ ] Sensitive data cleared from memory
- [ ] Audit logging for security events
- [ ] Key rotation strategy
- [ ] Backup authentication methods
- [ ] Regular security updates
- [ ] Security testing and code review

## References

- [OWASP Authentication Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Authentication_Cheat_Sheet.html)
- [NIST Digital Identity Guidelines](https://pages.nist.gov/800-63-3/)
- [FIDO2 Security Considerations](https://fidoalliance.org/fido2/)
- [YubiKey Security Documentation](https://developers.yubico.com/)
