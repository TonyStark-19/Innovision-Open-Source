import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GET, DELETE } from './route';
import { NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';
import { getServerSession } from '@/lib/auth-server';
import * as fc from 'fast-check';

// Mock dependencies
vi.mock('@/lib/firebase-admin', () => ({
  adminDb: {
    collection: vi.fn(),
  },
}));

vi.mock('@/lib/auth-server', () => ({
  getServerSession: vi.fn(),
}));

vi.mock('next/server', () => ({
  NextResponse: {
    json: (data, init) => ({
      json: async () => data,
      status: init?.status || 200,
    }),
  },
}));

describe('DELETE /api/roadmap/[id] - Bug Condition Exploration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  /**
   * **Validates: Requirements 1.1, 1.2, 1.3, 2.1, 2.2, 2.3**
   * 
   * Property 1: Fault Condition - DELETE Handler Processes Requests
   * 
   * CRITICAL: This test MUST FAIL on unfixed code - failure confirms the bug exists
   * 
   * For any DELETE request to `/api/roadmap/[id]` where the user is authenticated 
   * and the course exists in their roadmaps collection, the fixed route handler 
   * SHALL delete the course document from Firestore and return a 200 success response.
   * 
   * EXPECTED OUTCOME ON UNFIXED CODE: Test FAILS because DELETE handler doesn't exist
   * - DELETE is undefined, causing test to fail
   * - In production, this results in 405 Method Not Allowed
   * 
   * EXPECTED OUTCOME ON FIXED CODE: Test PASSES
   * - DELETE handler exists and processes requests
   * - Returns appropriate status codes (200, 400, 401, 404)
   * - Deletes courses from Firestore
   */

  it('should handle authenticated DELETE request with existing course', async () => {
    // Arrange
    const mockSession = { user: { email: 'test@example.com' } };
    const mockCourseId = 'course123';
    const mockCourseData = { title: 'Test Course', description: 'Test' };
    
    const mockDelete = vi.fn().mockResolvedValue();
    const mockGet = vi.fn().mockResolvedValue({
      exists: true,
      data: () => mockCourseData,
    });
    const mockDoc = vi.fn().mockReturnValue({
      get: mockGet,
      delete: mockDelete,
    });
    const mockCollection = vi.fn().mockReturnValue({
      doc: mockDoc,
    });

    getServerSession.mockResolvedValue(mockSession);
    adminDb.collection.mockReturnValue({
      doc: vi.fn().mockReturnValue({
        collection: mockCollection,
      }),
    });

    const request = new Request('http://localhost:3000/api/roadmap/course123', {
      method: 'DELETE',
    });
    const params = { id: mockCourseId };

    // Act
    const response = await DELETE(request, { params });
    const data = await response.json();

    // Assert - This will FAIL on unfixed code because DELETE is undefined
    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.message).toBe('Course deleted');
    expect(mockDelete).toHaveBeenCalled();
  });

  it('should return 404 for DELETE request with non-existent course', async () => {
    // Arrange
    const mockSession = { user: { email: 'test@example.com' } };
    const mockCourseId = 'nonexistent';
    
    const mockGet = vi.fn().mockResolvedValue({
      exists: false,
    });
    const mockDoc = vi.fn().mockReturnValue({
      get: mockGet,
    });
    const mockCollection = vi.fn().mockReturnValue({
      doc: mockDoc,
    });

    getServerSession.mockResolvedValue(mockSession);
    adminDb.collection.mockReturnValue({
      doc: vi.fn().mockReturnValue({
        collection: mockCollection,
      }),
    });

    const request = new Request('http://localhost:3000/api/roadmap/nonexistent', {
      method: 'DELETE',
    });
    const params = { id: mockCourseId };

    // Act
    const response = await DELETE(request, { params });
    const data = await response.json();

    // Assert - This will FAIL on unfixed code because DELETE is undefined
    expect(response.status).toBe(404);
    expect(data.error).toBe('Course not found');
  });

  it('should return 401 for unauthenticated DELETE request', async () => {
    // Arrange
    getServerSession.mockResolvedValue(null);

    const request = new Request('http://localhost:3000/api/roadmap/course123', {
      method: 'DELETE',
    });
    const params = { id: 'course123' };

    // Act
    const response = await DELETE(request, { params });
    const data = await response.json();

    // Assert - This will FAIL on unfixed code because DELETE is undefined
    expect(response.status).toBe(401);
    expect(data.message).toBe('Unauthorized');
  });

  it('should return 400 for DELETE request with missing ID', async () => {
    // Arrange
    const mockSession = { user: { email: 'test@example.com' } };
    getServerSession.mockResolvedValue(mockSession);

    const request = new Request('http://localhost:3000/api/roadmap/', {
      method: 'DELETE',
    });
    const params = { id: undefined };

    // Act
    const response = await DELETE(request, { params });
    const data = await response.json();

    // Assert - This will FAIL on unfixed code because DELETE is undefined
    expect(response.status).toBe(400);
    expect(data.error).toBe('Course ID is required');
  });
});

describe('GET /api/roadmap/[id] - Preservation Property Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  /**
   * **Validates: Requirements 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 3.7**
   * 
   * Property 2: Preservation - Existing GET Handler Unchanged
   * 
   * For any GET request to `/api/roadmap/[id]`, the fixed route file SHALL 
   * produce exactly the same behavior as the original code, preserving the 
   * existing course retrieval functionality without any modifications to the GET handler.
   * 
   * EXPECTED OUTCOME ON UNFIXED CODE: Tests PASS (establishes baseline behavior)
   * EXPECTED OUTCOME ON FIXED CODE: Tests PASS (confirms no regressions)
   */

  it('property: GET returns course data for authenticated user with existing course', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          email: fc.emailAddress(),
          courseId: fc.array(fc.constantFrom(...'0123456789abcdefABCDEF'.split('')), { minLength: 8, maxLength: 50 }).map(arr => arr.join('')),
          title: fc.string({ minLength: 1, maxLength: 100 }).filter(t => t.trim().length > 0),
          description: fc.string({ minLength: 0, maxLength: 500 }),
        }),
        async ({ email, courseId, title, description }) => {
          // Clear mocks before each property test run
          vi.clearAllMocks();
          
          // Arrange
          const mockSession = { user: { email } };
          const mockCourseData = { title, description };
          
          const mockGet = vi.fn().mockResolvedValue({
            exists: true,
            data: () => mockCourseData,
            id: courseId,
          });
          const mockDoc = vi.fn().mockReturnValue({
            get: mockGet,
          });
          const mockCollection = vi.fn().mockReturnValue({
            doc: mockDoc,
          });

          getServerSession.mockResolvedValue(mockSession);
          adminDb.collection.mockReturnValue({
            doc: vi.fn().mockReturnValue({
              collection: mockCollection,
            }),
          });

          const request = new Request(`http://localhost:3000/api/roadmap/${courseId}`, {
            method: 'GET',
          });
          const params = { id: courseId };

          // Act
          const response = await GET(request, { params });
          const data = await response.json();

          // Assert - Verify GET handler behavior is preserved
          expect(response.status).toBe(200);
          expect(data.id).toBe(courseId);
          expect(data.title).toBe(title);
          expect(data.description).toBe(description);
        }
      ),
      { numRuns: 20 }
    );
  });

  it('property: GET returns 404 for non-existent course', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          email: fc.emailAddress(),
          courseId: fc.array(fc.constantFrom(...'0123456789abcdefABCDEF'.split('')), { minLength: 8, maxLength: 50 }).map(arr => arr.join('')),
        }),
        async ({ email, courseId }) => {
          // Clear mocks before each property test run
          vi.clearAllMocks();
          
          // Arrange
          const mockSession = { user: { email } };
          
          const mockGet = vi.fn().mockResolvedValue({
            exists: false,
          });
          const mockDoc = vi.fn().mockReturnValue({
            get: mockGet,
          });
          const mockCollection = vi.fn().mockReturnValue({
            doc: mockDoc,
          });

          getServerSession.mockResolvedValue(mockSession);
          adminDb.collection.mockReturnValue({
            doc: vi.fn().mockReturnValue({
              collection: mockCollection,
            }),
          });

          const request = new Request(`http://localhost:3000/api/roadmap/${courseId}`, {
            method: 'GET',
          });
          const params = { id: courseId };

          // Act
          const response = await GET(request, { params });
          const data = await response.json();

          // Assert - Verify GET handler behavior is preserved
          expect(response.status).toBe(404);
          expect(data.error).toBe('Course not found');
        }
      ),
      { numRuns: 20 }
    );
  });

  it('property: GET returns 401 for unauthenticated requests', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.array(fc.constantFrom(...'0123456789abcdefABCDEF'.split('')), { minLength: 8, maxLength: 50 }).map(arr => arr.join('')),
        async (courseId) => {
          // Clear mocks before each property test run
          vi.clearAllMocks();
          
          // Arrange
          getServerSession.mockResolvedValue(null);

          const request = new Request(`http://localhost:3000/api/roadmap/${courseId}`, {
            method: 'GET',
          });
          const params = { id: courseId };

          // Act
          const response = await GET(request, { params });
          const data = await response.json();

          // Assert - Verify GET handler behavior is preserved
          expect(response.status).toBe(401);
          expect(data.message).toBe('Unauthorized');
        }
      ),
      { numRuns: 20 }
    );
  });

  it('property: GET returns 400 for missing course ID', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.emailAddress(),
        async (email) => {
          // Clear mocks before each property test run
          vi.clearAllMocks();
          
          // Arrange
          const mockSession = { user: { email } };
          getServerSession.mockResolvedValue(mockSession);

          const request = new Request('http://localhost:3000/api/roadmap/', {
            method: 'GET',
          });
          const params = { id: undefined };

          // Act
          const response = await GET(request, { params });
          const data = await response.json();

          // Assert - Verify GET handler behavior is preserved
          expect(response.status).toBe(400);
          expect(data.error).toBe('Course ID is required');
        }
      ),
      { numRuns: 20 }
    );
  });

  it('property: GET handles Firestore errors gracefully', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          email: fc.emailAddress(),
          courseId: fc.array(fc.constantFrom(...'0123456789abcdefABCDEF'.split('')), { minLength: 8, maxLength: 50 }).map(arr => arr.join('')),
        }),
        async ({ email, courseId }) => {
          // Clear mocks before each property test run
          vi.clearAllMocks();
          
          // Arrange
          const mockSession = { user: { email } };
          
          const mockGet = vi.fn().mockRejectedValue(new Error('Firestore error'));
          const mockDoc = vi.fn().mockReturnValue({
            get: mockGet,
          });
          const mockCollection = vi.fn().mockReturnValue({
            doc: mockDoc,
          });

          getServerSession.mockResolvedValue(mockSession);
          adminDb.collection.mockReturnValue({
            doc: vi.fn().mockReturnValue({
              collection: mockCollection,
            }),
          });

          const request = new Request(`http://localhost:3000/api/roadmap/${courseId}`, {
            method: 'GET',
          });
          const params = { id: courseId };

          // Act
          const response = await GET(request, { params });
          const data = await response.json();

          // Assert - Verify GET handler behavior is preserved
          expect(response.status).toBe(500);
          expect(data.error).toBe('Failed to fetch course');
        }
      ),
      { numRuns: 20 }
    );
  });
});
