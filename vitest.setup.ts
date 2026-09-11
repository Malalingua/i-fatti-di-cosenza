import '@testing-library/jest-dom/vitest'

// Set up environment variables for testing
process.env.NEXT_PUBLIC_SANITY_PROJECT_ID ||= 'test-project-id'
process.env.NEXT_PUBLIC_SANITY_DATASET ||= 'production'
process.env.NODE_ENV ||= 'test'
