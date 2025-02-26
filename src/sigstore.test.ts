/*
Copyright 2022 The Sigstore Authors.

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*/
import { SigstoreDSSEBundle } from './bundle';
import { Signer } from './sign';
import { sign, signAttestation, verify, verifyDSSE } from './sigstore';
import { Verifier } from './verify';

jest.mock('./sign');

describe('sign', () => {
  const payload = Buffer.from('Hello, world!');

  // Signer output
  const signedPayload = {
    base64Signature: 'signature',
    cert: 'cert',
  };

  const mockSigner = jest.mocked(Signer);
  const mockSign = jest.fn();

  beforeEach(() => {
    mockSigner.mockClear();

    mockSign.mockClear();
    mockSign.mockResolvedValueOnce(signedPayload);
    jest.spyOn(Signer.prototype, 'signBlob').mockImplementation(mockSign);
  });

  it('constructs the Signer with the correct options', async () => {
    await sign(payload);

    // Signer was constructed
    expect(mockSigner).toHaveBeenCalledTimes(1);
    const args = mockSigner.mock.calls[0];

    // Signer was constructed with options
    expect(args).toHaveLength(1);
    const options = args[0];

    // Signer was constructed with the correct options
    expect(options).toHaveProperty('fulcio', expect.anything());
    expect(options).toHaveProperty('rekor', expect.anything());
    expect(options.identityProviders).toHaveLength(1);
  });

  it('invokes the Signer instance with the correct params', async () => {
    await sign(payload);

    expect(mockSign).toHaveBeenCalledWith(payload);
  });

  it('returns the correct envelope', async () => {
    const sig = await sign(payload);

    expect(sig).toEqual(signedPayload);
  });
});

describe('signAttestation', () => {
  const payload = Buffer.from('Hello, world!');
  const payloadType = 'text/plain';

  // Signer output
  const signedPayload = {
    base64Signature: 'signature',
    cert: 'cert',
  };

  const mockSigner = jest.mocked(Signer);
  const mockSign = jest.fn();

  beforeEach(() => {
    mockSigner.mockClear();

    mockSign.mockClear();
    mockSign.mockResolvedValueOnce(signedPayload);
    jest
      .spyOn(Signer.prototype, 'signAttestation')
      .mockImplementation(mockSign);
  });

  it('constructs the Signer with the correct options', async () => {
    await signAttestation(payload, payloadType);

    // Signer was constructed
    expect(mockSigner).toHaveBeenCalledTimes(1);
    const args = mockSigner.mock.calls[0];

    // Signer was constructed with options
    expect(args).toHaveLength(1);
    const options = args[0];

    // Signer was constructed with the correct options
    expect(options).toHaveProperty('fulcio', expect.anything());
    expect(options).toHaveProperty('rekor', expect.anything());
    expect(options.identityProviders).toHaveLength(1);
  });

  it('invokes the Signer instance with the correct params', async () => {
    await signAttestation(payload, payloadType);

    expect(mockSign).toHaveBeenCalledWith(payload, payloadType);
  });

  it('returns the correct envelope', async () => {
    const sig = await signAttestation(payload, payloadType);

    expect(sig).toEqual(signedPayload);
  });
});

describe('#verify', () => {
  const payload = Buffer.from('Hello, world!');
  const signature = 'a1b2c3';
  const cert = 'cert';

  const mockVerify = jest.fn();

  beforeEach(() => {
    mockVerify.mockClear();
    mockVerify.mockResolvedValueOnce(false);
    jest.spyOn(Verifier.prototype, 'verify').mockImplementation(mockVerify);
  });

  it('invokes the Verifier instance with the correct params', async () => {
    await verify(payload, signature, cert);

    expect(mockVerify).toHaveBeenCalledWith(payload, signature, cert);
  });

  it('returns the value returned by the verifier', async () => {
    const result = await verify(payload, signature, cert);
    expect(result).toBe(false);
  });
});

describe('#verifyDSSE', () => {
  const bundle: SigstoreDSSEBundle = {
    attestationType: 'attestation/dsse',
    attestation: {
      payload: '',
      payloadType: '',
      signatures: [],
    },
    certificate: '',
    integratedTime: 0,
    signedEntryTimestamp: '',
    logIndex: 0,
    logID: '',
  };

  const mockVerify = jest.fn();

  beforeEach(() => {
    mockVerify.mockClear();
    mockVerify.mockResolvedValueOnce(false);
    jest.spyOn(Verifier.prototype, 'verifyDSSE').mockImplementation(mockVerify);
  });

  it('invokes the Verifier instance with the correct params', async () => {
    await verifyDSSE(bundle);

    expect(mockVerify).toHaveBeenCalledWith(bundle);
  });

  it('returns the value returned by the verifier', async () => {
    const result = await verifyDSSE(bundle);
    expect(result).toBe(false);
  });
});
