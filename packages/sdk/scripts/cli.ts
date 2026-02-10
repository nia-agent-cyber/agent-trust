#!/usr/bin/env npx ts-node
/**
 * Agent Trust CLI
 * 
 * Usage:
 *   npx ts-node scripts/cli.ts score <address>     - Get trust score
 *   npx ts-node scripts/cli.ts tier <address>      - Get trust tier
 *   npx ts-node scripts/cli.ts vouch <address> <level> [context]  - Vouch for agent
 *   npx ts-node scripts/cli.ts flag <address> <severity> <reason> - Flag bad actor
 */

import { EAS, SchemaEncoder } from '@ethereum-attestation-service/eas-sdk';
import { ethers } from 'ethers';
import { getAttestationSummary } from '../src/query';
import { SCHEMAS } from '../src/constants';
import {
  getTier,
  checkMeetsTier,
  getTierName,
  getTierEmoji,
  TIER_REQUIREMENTS,
  MAX_TIER,
  TierInfo,
  TierProgress,
  RequirementProgress,
} from '../src/tier';

const PRIVATE_KEY = process.env.PRIVATE_KEY;
const RPC_URL = 'https://sepolia.base.org';
const EAS_ADDRESS = '0x4200000000000000000000000000000000000021';

// ============ Helper Functions ============

/**
 * Create ASCII progress bar
 * @param current Current value
 * @param required Required value
 * @param width Width of progress bar
 * @returns ASCII progress bar string
 */
function progressBar(current: number, required: number, width: number = 10): string {
  if (required === 0) return '▓'.repeat(width);
  const ratio = Math.min(current / required, 1);
  const filled = Math.round(ratio * width);
  const empty = width - filled;
  return '▓'.repeat(filled) + '░'.repeat(empty);
}

/**
 * Format percentage
 */
function formatPercent(value: number): string {
  return `${value.toFixed(1)}%`;
}

/**
 * Format requirement status
 */
function formatRequirementStatus(progress: RequirementProgress): string {
  return progress.met ? '✓' : '';
}

/**
 * Calculate percentage progress
 */
function calculatePercent(current: number, required: number): number {
  if (required === 0) return 100;
  return Math.min((current / required) * 100, 100);
}

// ============ Commands ============

async function score(address: string) {
  console.log(`\n🔍 Trust Score for ${address}\n`);
  
  const summary = await getAttestationSummary(address, 'baseSepolia');
  
  console.log(`📊 Score: ${summary.trustScore.score}/100`);
  console.log(`   Confidence: ${(summary.trustScore.confidence * 100).toFixed(0)}%`);
  console.log(`   Verified: ${summary.trustScore.verified ? '✅' : '❌'}`);
  console.log(`   Attestations: ${summary.trustScore.attestationCount}`);
  
  if (summary.vouches.length > 0) {
    console.log(`\n👍 Vouches: ${summary.vouches.length}`);
    summary.vouches.forEach(v => {
      console.log(`   • Level ${v.trustLevel}/5 from ${v.attester.slice(0,10)}...`);
    });
  }
  
  if (summary.flags.length > 0) {
    console.log(`\n🚩 Flags: ${summary.flags.length}`);
    summary.flags.forEach(f => {
      console.log(`   • Severity ${f.severity}/5: ${f.reason.slice(0,50)}`);
    });
  }
  
  console.log('');
}

interface TierOptions {
  check?: number;
  json?: boolean;
}

async function tier(address: string, options: TierOptions = {}) {
  const { check, json } = options;

  // Check mode - exit 0 if meets tier, exit 1 if not
  if (check !== undefined) {
    try {
      const meetsTier = await checkMeetsTier(address, check, 'baseSepolia');
      
      if (json) {
        const tierInfo = await getTier(address, 'baseSepolia');
        console.log(JSON.stringify({
          address,
          meetsTier,
          requiredTier: check,
          requiredTierName: getTierName(check),
          actualTier: tierInfo.tier,
          actualTierName: tierInfo.name,
        }, null, 2));
      } else {
        if (meetsTier) {
          console.log(`✓ Agent meets Tier ${check} (${getTierName(check)}) requirements`);
        } else {
          const tierInfo = await getTier(address, 'baseSepolia');
          console.log(`✗ Agent does not meet Tier ${check} (${getTierName(check)}) requirements`);
          console.log(`  Current tier: ${tierInfo.tier} (${tierInfo.name})`);
          
          // Show what's missing
          if (tierInfo.progress) {
            const req = TIER_REQUIREMENTS[check];
            if (req) {
              const missing: string[] = [];
              if (tierInfo.progress.attestations.current < req.minAttestations) {
                missing.push(`${req.minAttestations - tierInfo.progress.attestations.current} attestations`);
              }
              if (tierInfo.progress.vouches.current < req.minVouches) {
                missing.push(`${req.minVouches - tierInfo.progress.vouches.current} vouches`);
              }
              if (tierInfo.progress.daysActive.current < req.minDaysActive) {
                missing.push(`${req.minDaysActive - tierInfo.progress.daysActive.current} days`);
              }
              if (missing.length > 0) {
                console.log(`  Missing: ${missing.join(', ')}`);
              }
            }
          }
        }
      }
      
      process.exit(meetsTier ? 0 : 1);
    } catch (error) {
      if (json) {
        console.log(JSON.stringify({ error: (error as Error).message }));
      } else {
        console.error(`Error: ${(error as Error).message}`);
      }
      process.exit(1);
    }
  }

  // Standard tier display
  try {
    const tierInfo = await getTier(address, 'baseSepolia');
    
    if (json) {
      // JSON output format
      const output: Record<string, unknown> = {
        address,
        tier: tierInfo.tier,
        name: tierInfo.name,
        emoji: tierInfo.emoji,
        stats: {
          attestations: tierInfo.progress?.attestations.current ?? 0,
          vouches: tierInfo.progress?.vouches.current ?? 0,
          approvalRate: tierInfo.progress?.approvalRate.current ?? 0,
          daysActive: tierInfo.progress?.daysActive.current ?? 0,
        },
      };
      
      if (tierInfo.nextTier !== null && tierInfo.progress) {
        const nextReq = TIER_REQUIREMENTS[tierInfo.nextTier];
        output.progress = {
          nextTier: tierInfo.nextTier,
          nextTierName: getTierName(tierInfo.nextTier),
          attestations: {
            current: tierInfo.progress.attestations.current,
            required: nextReq.minAttestations,
            met: tierInfo.progress.attestations.met,
          },
          vouches: {
            current: tierInfo.progress.vouches.current,
            required: nextReq.minVouches,
            met: tierInfo.progress.vouches.met,
          },
          approvalRate: {
            current: tierInfo.progress.approvalRate.current,
            required: nextReq.minApprovalRate,
            met: tierInfo.progress.approvalRate.met,
          },
          daysActive: {
            current: tierInfo.progress.daysActive.current,
            required: nextReq.minDaysActive,
            met: tierInfo.progress.daysActive.met,
          },
        };
      } else {
        output.progress = null;
      }
      
      console.log(JSON.stringify(output, null, 2));
      return;
    }

    // Human-readable output
    console.log(`\nTrust Tier: ${tierInfo.emoji} ${tierInfo.name} (Tier ${tierInfo.tier})`);
    console.log('━'.repeat(40));
    
    // Current stats
    console.log('\nCurrent Stats:');
    if (tierInfo.progress) {
      const p = tierInfo.progress;
      console.log(`  Attestations:  ${p.attestations.current} ${formatRequirementStatus(p.attestations)}`);
      console.log(`  Vouches:       ${p.vouches.current} ${formatRequirementStatus(p.vouches)}`);
      console.log(`  Approval Rate: ${formatPercent(p.approvalRate.current)} ${formatRequirementStatus(p.approvalRate)}`);
      console.log(`  Days Active:   ${p.daysActive.current} ${formatRequirementStatus(p.daysActive)}`);
    } else {
      console.log('  Maximum tier achieved!');
    }
    
    // Progress toward next tier
    if (tierInfo.nextTier !== null && tierInfo.progress) {
      const nextReq = TIER_REQUIREMENTS[tierInfo.nextTier];
      console.log(`\nProgress to ${getTierName(tierInfo.nextTier)} (Tier ${tierInfo.nextTier}):`);
      
      const p = tierInfo.progress;
      
      // Attestations
      const attPct = calculatePercent(p.attestations.current, nextReq.minAttestations);
      console.log(`  Attestations:  ${p.attestations.current}/${nextReq.minAttestations} ${progressBar(p.attestations.current, nextReq.minAttestations)} ${attPct.toFixed(0)}%${p.attestations.met ? ' ✓' : ''}`);
      
      // Vouches
      const vouchPct = calculatePercent(p.vouches.current, nextReq.minVouches);
      console.log(`  Vouches:       ${p.vouches.current}/${nextReq.minVouches} ${progressBar(p.vouches.current, nextReq.minVouches)} ${vouchPct.toFixed(0)}%${p.vouches.met ? ' ✓' : ''}`);
      
      // Approval Rate
      console.log(`  Approval Rate: ${formatPercent(p.approvalRate.current)}/${nextReq.minApprovalRate}%${p.approvalRate.met ? ' ✓' : ''}`);
      
      // Days Active
      const daysPct = calculatePercent(p.daysActive.current, nextReq.minDaysActive);
      console.log(`  Days Active:   ${p.daysActive.current}/${nextReq.minDaysActive} ${progressBar(p.daysActive.current, nextReq.minDaysActive)} ${daysPct.toFixed(0)}%${p.daysActive.met ? ' ✓' : ''}`);
    }
    
    console.log('');
  } catch (error) {
    console.error(`Error: ${(error as Error).message}`);
    process.exit(1);
  }
}

async function vouch(address: string, level: number, context: string) {
  if (!PRIVATE_KEY) {
    console.error('❌ Set PRIVATE_KEY environment variable');
    process.exit(1);
  }
  
  const provider = new ethers.JsonRpcProvider(RPC_URL);
  const signer = new ethers.Wallet(PRIVATE_KEY, provider);
  
  console.log(`\n👍 Vouching for ${address}`);
  console.log(`   From: ${signer.address}`);
  console.log(`   Trust Level: ${level}/5`);
  console.log(`   Context: ${context}\n`);
  
  const eas = new EAS(EAS_ADDRESS);
  eas.connect(signer);
  
  const schemaEncoder = new SchemaEncoder(SCHEMAS.vouch.schema);
  const encodedData = schemaEncoder.encodeData([
    { name: 'vouchee', value: address, type: 'address' },
    { name: 'trustLevel', value: level, type: 'uint8' },
    { name: 'context', value: context, type: 'string' },
    { name: 'evidenceHash', value: '0x' + '0'.repeat(64), type: 'bytes32' },
  ]);
  
  const tx = await eas.attest({
    schema: SCHEMAS.vouch.uid,
    data: {
      recipient: address,
      expirationTime: BigInt(0),
      revocable: true,
      data: encodedData,
    },
  });
  
  console.log('⏳ Submitting...');
  const uid = await tx.wait();
  
  console.log(`✅ Vouch created!`);
  console.log(`   UID: ${uid}`);
  console.log(`   View: https://base-sepolia.easscan.org/attestation/view/${uid}\n`);
}

async function flag(address: string, severity: number, reason: string) {
  if (!PRIVATE_KEY) {
    console.error('❌ Set PRIVATE_KEY environment variable');
    process.exit(1);
  }
  
  const provider = new ethers.JsonRpcProvider(RPC_URL);
  const signer = new ethers.Wallet(PRIVATE_KEY, provider);
  
  console.log(`\n🚩 Flagging ${address}`);
  console.log(`   From: ${signer.address}`);
  console.log(`   Severity: ${severity}/5`);
  console.log(`   Reason: ${reason}\n`);
  
  const eas = new EAS(EAS_ADDRESS);
  eas.connect(signer);
  
  const schemaEncoder = new SchemaEncoder(SCHEMAS.flag.schema);
  const encodedData = schemaEncoder.encodeData([
    { name: 'flagged', value: address, type: 'address' },
    { name: 'severity', value: severity, type: 'uint8' },
    { name: 'reason', value: reason, type: 'string' },
    { name: 'evidenceHash', value: '0x' + '0'.repeat(64), type: 'bytes32' },
  ]);
  
  const tx = await eas.attest({
    schema: SCHEMAS.flag.uid,
    data: {
      recipient: address,
      expirationTime: BigInt(0),
      revocable: true,
      data: encodedData,
    },
  });
  
  console.log('⏳ Submitting...');
  const uid = await tx.wait();
  
  console.log(`✅ Flag created!`);
  console.log(`   UID: ${uid}`);
  console.log(`   View: https://base-sepolia.easscan.org/attestation/view/${uid}\n`);
}

// ============ Argument Parsing ============

function parseArgs(args: string[]): { command: string; positional: string[]; flags: Record<string, string | boolean> } {
  const command = args[0] || '';
  const positional: string[] = [];
  const flags: Record<string, string | boolean> = {};
  
  let i = 1;
  while (i < args.length) {
    const arg = args[i];
    if (arg.startsWith('--')) {
      const key = arg.slice(2);
      // Check if next arg exists and is not a flag
      if (i + 1 < args.length && !args[i + 1].startsWith('--')) {
        flags[key] = args[i + 1];
        i += 2;
      } else {
        flags[key] = true;
        i++;
      }
    } else {
      positional.push(arg);
      i++;
    }
  }
  
  return { command, positional, flags };
}

async function main() {
  const [,, ...rawArgs] = process.argv;
  const { command, positional, flags } = parseArgs(rawArgs);
  
  switch (command) {
    case 'score':
      if (!positional[0]) {
        console.error('Usage: cli.ts score <address>');
        process.exit(1);
      }
      await score(positional[0]);
      break;
      
    case 'tier':
      if (!positional[0]) {
        console.error('Usage: cli.ts tier <address> [--check <min-tier>] [--json]');
        process.exit(1);
      }
      await tier(positional[0], {
        check: flags.check !== undefined ? parseInt(flags.check as string, 10) : undefined,
        json: flags.json === true,
      });
      break;
      
    case 'vouch':
      if (!positional[0] || !positional[1]) {
        console.error('Usage: cli.ts vouch <address> <level 1-5> [context]');
        process.exit(1);
      }
      await vouch(positional[0], parseInt(positional[1]), positional.slice(2).join(' ') || 'Vouch');
      break;
      
    case 'flag':
      if (!positional[0] || !positional[1] || !positional[2]) {
        console.error('Usage: cli.ts flag <address> <severity 1-5> <reason>');
        process.exit(1);
      }
      await flag(positional[0], parseInt(positional[1]), positional.slice(2).join(' '));
      break;
      
    default:
      console.log(`
Agent Trust CLI

Commands:
  score <address>                          - Get trust score
  tier <address>                           - Get trust tier with progress
  tier <address> --check <min-tier>        - Check if agent meets tier (exit 0/1)
  tier <address> --json                    - Output tier info as JSON
  vouch <address> <level> [context]        - Vouch for agent (level 1-5)
  flag <address> <severity> <reason>       - Flag bad actor (severity 1-5)

Tier Levels:
  0 - New          (no reputation)
  1 - Contributor  (basic activity)
  2 - Trusted      (established reputation)
  3 - Verified     (strong community validation)
  4 - Expert       (elite status)

Environment:
  PRIVATE_KEY - Required for vouch/flag operations

Examples:
  cli.ts tier 0x1234...                    # Show tier and progress
  cli.ts tier 0x1234... --json             # JSON output
  cli.ts tier 0x1234... --check 2          # Check if meets Trusted tier
  cli.ts tier 0x1234... --check 2 --json   # Check with JSON output
`);
  }
}

main().catch(console.error);
