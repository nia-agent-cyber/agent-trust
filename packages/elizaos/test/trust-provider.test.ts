import { describe, it, expect, vi } from 'vitest';
import { createTrustProvider } from '../src/trust-provider.js';
import type { AgentTrustLike } from '../src/types.js';
import type { IAgentRuntime, Memory, State } from '../src/eliza-types.js';

const VALID_ADDR = '0x' + 'c'.repeat(40);
const ZERO_ADDR = '0x' + '0'.repeat(40);

function mockRuntime(): IAgentRuntime {
  return { agentId: 'provider-agent', character: { name: 'Prov' } };
}

function mockMessage(text = '', extra: Record<string, unknown> = {}): Memory {
  return { content: { text, ...extra } };
}

function mockTrust(tier = 2, score = 65): AgentTrustLike {
  return {
    getTier: vi.fn().mockResolvedValue({ tier }),
    getScore: vi.fn().mockResolvedValue({ score }),
  };
}

describe('createTrustProvider', () => {
  it('returns trust context string for valid address in text', async () => {
    const prov = createTrustProvider({ agentTrust: mockTrust(2, 65) });
    const result = await prov.get(mockRuntime(), mockMessage(`address: ${VALID_ADDR}`));
    expect(result).toContain('[Trust Context]');
    expect(result).toContain('trusted');
    expect(result).toContain(VALID_ADDR);
    expect(result).toContain('65');
  });

  it('returns trust context for address in message content key', async () => {
    const prov = createTrustProvider({ agentTrust: mockTrust(1, 40), addressKey: 'caller' });
    const result = await prov.get(mockRuntime(), mockMessage('', { caller: VALID_ADDR }));
    expect(result).toContain('contributor');
  });

  it('returns trust context for address in state', async () => {
    const prov = createTrustProvider({ agentTrust: mockTrust(3, 85) });
    const state: State = { address: VALID_ADDR };
    const result = await prov.get(mockRuntime(), mockMessage(''), state);
    expect(result).toContain('verified');
    expect(result).toContain('85');
  });

  it('returns not-found message when no address', async () => {
    const prov = createTrustProvider({ agentTrust: mockTrust() });
    const result = await prov.get(mockRuntime(), mockMessage('no address here'));
    expect(result).toContain('No wallet address found');
  });

  it('returns not-found message for zero address', async () => {
    const prov = createTrustProvider({ agentTrust: mockTrust() });
    const result = await prov.get(mockRuntime(), mockMessage(ZERO_ADDR));
    expect(result).toContain('No wallet address found');
  });

  it('returns error string when getTier rejects', async () => {
    const trust: AgentTrustLike = {
      getTier: vi.fn().mockRejectedValue(new Error('timeout')),
      getScore: vi.fn().mockResolvedValue({ score: 0 }),
    };
    const prov = createTrustProvider({ agentTrust: trust });
    const result = await prov.get(mockRuntime(), mockMessage(VALID_ADDR));
    expect(result).toContain('timeout');
  });

  it('includes Verified: yes for tier >= 3', async () => {
    const prov = createTrustProvider({ agentTrust: mockTrust(3, 90) });
    const result = await prov.get(mockRuntime(), mockMessage(VALID_ADDR));
    expect(result).toContain('Verified: yes');
  });

  it('includes Verified: no for tier < 3', async () => {
    const prov = createTrustProvider({ agentTrust: mockTrust(2, 60) });
    const result = await prov.get(mockRuntime(), mockMessage(VALID_ADDR));
    expect(result).toContain('Verified: no');
  });

  it.each([
    [0, 'unverified'],
    [1, 'contributor'],
    [2, 'trusted'],
    [3, 'verified'],
    [4, 'expert'],
  ])('tier level %i shows name %s in output', async (level, name) => {
    const prov = createTrustProvider({ agentTrust: mockTrust(level, 50) });
    const result = await prov.get(mockRuntime(), mockMessage(VALID_ADDR));
    expect(result).toContain(name);
  });
});
