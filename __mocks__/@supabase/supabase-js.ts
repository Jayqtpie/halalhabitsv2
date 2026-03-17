export const createClient = jest.fn(() => ({
  auth: {
    signUp: jest.fn().mockResolvedValue({ data: { session: { user: { id: 'test-uid' } }, user: { id: 'test-uid' } }, error: null }),
    signInWithPassword: jest.fn().mockResolvedValue({ data: { session: { user: { id: 'test-uid' } }, user: { id: 'test-uid' } }, error: null }),
    signOut: jest.fn().mockResolvedValue({ error: null }),
    getSession: jest.fn().mockResolvedValue({ data: { session: null }, error: null }),
    onAuthStateChange: jest.fn().mockReturnValue({ data: { subscription: { unsubscribe: jest.fn() } } }),
    startAutoRefresh: jest.fn(),
    stopAutoRefresh: jest.fn(),
  },
  from: jest.fn().mockReturnValue({
    upsert: jest.fn().mockResolvedValue({ error: null }),
    update: jest.fn().mockReturnValue({ eq: jest.fn().mockResolvedValue({ error: null }) }),
    select: jest.fn().mockReturnValue({ eq: jest.fn().mockReturnValue({ single: jest.fn().mockResolvedValue({ data: null, error: null }) }) }),
    delete: jest.fn().mockReturnValue({ eq: jest.fn().mockResolvedValue({ error: null }) }),
  }),
}));
