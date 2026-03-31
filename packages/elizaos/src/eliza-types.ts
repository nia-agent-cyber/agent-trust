/**
 * Minimal ElizaOS type shim for @elizaos/core
 *
 * These types mirror the public API of @elizaos/core >=0.1.0.
 * Real implementations are resolved at consumer install time via peerDependencies.
 * This shim allows TypeScript compilation and testing without installing @elizaos/core.
 */

/** The ElizaOS agent runtime context */
export interface IAgentRuntime {
  agentId: string;
  character: {
    name: string;
    settings?: Record<string, unknown>;
  };
  getSetting?: (key: string) => string | undefined;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any;
}

/** A message in an ElizaOS conversation */
export interface Memory {
  id?: string;
  content: {
    text: string;
    [key: string]: unknown;
  };
  userId?: string;
  roomId?: string;
  agentId?: string;
}

/** Agent conversation state */
export interface State {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any;
}

/** Function to update agent state */
export type HandlerCallback = (response: { text: string; [key: string]: unknown }) => Promise<void>;

/** ElizaOS Action — a named handler for agent capabilities */
export interface Action {
  name: string;
  similes?: string[];
  description: string;
  validate: (runtime: IAgentRuntime, message: Memory, state?: State) => Promise<boolean>;
  handler: (
    runtime: IAgentRuntime,
    message: Memory,
    state?: State,
    options?: Record<string, unknown>,
    callback?: HandlerCallback
  ) => Promise<boolean>;
  examples?: Array<Array<{ user: string; content: { text: string } }>>;
}

/** ElizaOS Evaluator — post-processing and scoring for responses */
export interface Evaluator {
  name: string;
  similes?: string[];
  description: string;
  alwaysRun?: boolean;
  validate: (runtime: IAgentRuntime, message: Memory, state?: State) => Promise<boolean>;
  handler: (runtime: IAgentRuntime, message: Memory, state?: State) => Promise<void>;
  examples?: Array<{
    context: string;
    messages: Array<{ user: string; content: { text: string } }>;
    outcome: string;
  }>;
}

/** ElizaOS Provider — enriches agent state with external context */
export interface Provider {
  get: (runtime: IAgentRuntime, message: Memory, state?: State) => Promise<string>;
}

/** ElizaOS Plugin — bundles actions, evaluators, providers */
export interface Plugin {
  name: string;
  description: string;
  actions?: Action[];
  evaluators?: Evaluator[];
  providers?: Provider[];
}
