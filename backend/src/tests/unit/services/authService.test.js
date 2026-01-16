import { connectTestDB, disconnectTestDB, clearTestDB } from '../../helpers/mockDatabase.js';
import { register, login } from '../../../services/authService.js';
import User from '../../../models/User.js';

describe('AuthService', () => {
  beforeAll(async () => {
    await connectTestDB();
  });

  afterAll(async () => {
    await disconnectTestDB();
  });

  beforeEach(async () => {
    await clearTestDB();
  });

  describe('register', () => {
    it('should register a new user successfully', async () => {
      const userData = {
        name: 'John Doe',
        email: 'john@example.com',
        password: 'Password123!',
      };

      const result = await register(userData);

      expect(result).toHaveProperty('user');
      expect(result).toHaveProperty('userId');
      expect(result.user.email).toBe(userData.email);
      expect(result.user.name).toBe(userData.name);
      expect(result.user).not.toHaveProperty('password');
    });

    it('should throw error if email already exists', async () => {
      const userData = {
        name: 'John Doe',
        email: 'john@example.com',
        password: 'Password123!',
      };

      await register(userData);

      await expect(register(userData)).rejects.toThrow();
    });

    it('should hash the password before saving', async () => {
      const userData = {
        name: 'John Doe',
        email: 'john@example.com',
        password: 'Password123!',
      };

      await register(userData);

      const user = await User.findOne({ email: userData.email }).select('+password');
      expect(user.password).not.toBe(userData.password);
      expect(user.password).toMatch(/^\$2[aby]\$.{56}$/); // bcrypt hash pattern
    });

    it('should set default role to user', async () => {
      const userData = {
        name: 'John Doe',
        email: 'john@example.com',
        password: 'Password123!',
      };

      const result = await register(userData);

      expect(result.user.role).toBe('user');
    });
  });

  describe('login', () => {
    beforeEach(async () => {
      await register({
        name: 'Test User',
        email: 'test@example.com',
        password: 'Password123!',
      });
    });

    it('should login user with correct credentials', async () => {
      const result = await login('test@example.com', 'Password123!');

      expect(result).toHaveProperty('user');
      expect(result).toHaveProperty('userId');
      expect(result.user.email).toBe('test@example.com');
    });

    it('should throw error with incorrect password', async () => {
      await expect(login('test@example.com', 'WrongPassword123!')).rejects.toThrow();
    });

    it('should throw error with non-existent email', async () => {
      await expect(login('nonexistent@example.com', 'Password123!')).rejects.toThrow();
    });

    it('should return user without password field', async () => {
      const result = await login('test@example.com', 'Password123!');

      expect(result.user).not.toHaveProperty('password');
    });
  });
});
