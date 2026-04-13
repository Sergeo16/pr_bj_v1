import { POST } from '@/app/api/votes/route';
import { NextRequest } from 'next/server';
import { getPool } from '@/lib/db';

// Mock the database
jest.mock('@/lib/db', () => ({
  getPool: jest.fn(),
}));

describe('/api/votes', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should reject invalid vote data', async () => {
    const mockClient = {
      query: jest.fn(),
      release: jest.fn(),
    };

    const mockPool = {
      connect: jest.fn().mockResolvedValue(mockClient),
    };

    (getPool as jest.Mock).mockReturnValue(mockPool);

    const req = new NextRequest('http://localhost/api/votes', {
      method: 'POST',
      body: JSON.stringify({
        fullName: '',
        duoId: 1,
        departementId: 1,
        communeId: 1,
        arrondissementId: 1,
        villageId: 1,
        centreId: 1,
        count: -1,
      }),
    });

    const response = await POST(req);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBeDefined();
  });

  it('should accept valid vote data', async () => {
    const mockClient = {
      query: jest.fn()
        .mockResolvedValueOnce({ rows: [{ id: 1 }] }) // duo check
        .mockResolvedValueOnce({ rows: [{ id: 1 }] }) // departement check
        .mockResolvedValueOnce({ rows: [{ id: 1 }] }) // commune check
        .mockResolvedValueOnce({ rows: [{ id: 1 }] }) // arrondissement check
        .mockResolvedValueOnce({ rows: [{ id: 1 }] }) // village check
        .mockResolvedValueOnce({ rows: [{ id: 1 }] }) // centre check
        .mockResolvedValueOnce(null) // BEGIN
        .mockResolvedValueOnce({
          rows: [{ id: 1, created_at: new Date() }],
        }) // INSERT
        .mockResolvedValueOnce(null), // COMMIT
      release: jest.fn(),
    };

    const mockPool = {
      connect: jest.fn().mockResolvedValue(mockClient),
    };

    (getPool as jest.Mock).mockReturnValue(mockPool);

    const req = new NextRequest('http://localhost/api/votes', {
      method: 'POST',
      body: JSON.stringify({
        fullName: 'John Doe',
        duoId: 1,
        departementId: 1,
        communeId: 1,
        arrondissementId: 1,
        villageId: 1,
        centreId: 1,
        count: 100,
      }),
    });

    const response = await POST(req);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(mockClient.query).toHaveBeenCalledTimes(9);
  });
});

