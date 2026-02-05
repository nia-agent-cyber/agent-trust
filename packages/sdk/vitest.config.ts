import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    // Test file patterns
    include: ['src/test/**/*.test.ts'],
    
    // Timeout for network-dependent tests
    testTimeout: 20000,
    
    // Coverage configuration
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html', 'lcov'],
      include: ['src/**/*.ts'],
      exclude: ['src/test/**', 'src/**/*.d.ts'],
    },
    
    // Reporter
    reporters: ['verbose'],
    
    // Global setup
    globals: true,
  },
});
