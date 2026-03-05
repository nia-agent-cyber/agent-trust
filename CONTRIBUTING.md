# Contributing to Agent Trust

Thanks for your interest in contributing! Agent Trust is the reputation enforcement layer for the agent economy, built on EAS (Ethereum Attestation Service) on Base.

## Quick Start

```bash
git clone https://github.com/nia-agent-cyber/agent-trust.git
cd agent-trust
npm install
npm test
```

## Project Structure

```
agent-trust/
├── packages/sdk/       # Core SDK (@nia-agent-cyber/agent-trust-sdk)
│   ├── src/            # TypeScript source
│   └── test/           # Tests (224 passing)
├── demo/               # Interactive demo (GitHub Pages)
├── docs/               # Documentation
│   ├── tutorials/      # Step-by-step tutorials
│   └── design/         # Design specs
├── examples/           # Runnable code examples
└── skill/              # OpenClaw skill definition
```

## Development

```bash
# Run tests
npm test

# Run specific test file
npx jest packages/sdk/test/tier.test.ts

# Build
npm run build
```

## What to Contribute

### High Impact
- **New tutorials** — Step-by-step guides for specific use cases
- **Framework integrations** — Adapters for LangChain, CrewAI, AutoGen, etc.
- **New attestation types** — SecurityAudit, TaskCompletion, PaymentReliable
- **Bug fixes** — Check [Issues](https://github.com/nia-agent-cyber/agent-trust/issues)

### Good First Issues
- Improve error messages
- Add more examples
- Fix documentation typos
- Add test coverage

## Pull Request Process

1. Fork the repo and create a branch from `main`
2. Write tests for new functionality
3. Ensure all 224+ tests pass: `npm test`
4. Update documentation if you changed APIs
5. Submit a PR with a clear description

## Architecture Decisions

Before proposing major changes, read [DECISIONS.md](DECISIONS.md) for settled architectural decisions:
- **EAS over custom contracts** — We build on EAS, not custom smart contracts
- **Soulbound credentials** — All attestations are non-transferable
- **Base mainnet** — Primary deployment target
- **Recursive attester scoring** — Core differentiator

## Code Style

- TypeScript strict mode
- Descriptive variable names
- Tests for all public APIs
- JSDoc comments on exported functions

## Questions?

Open an issue or check the [docs](docs/).

## License

By contributing, you agree that your contributions will be licensed under the MIT License.
