import { Command, Response } from '../../types/database';
import { authenticateUser, registerUser } from '../../utils/auth';
import { logger } from '../../utils/logger';

const tokens = new Map<string, string>(); // token -> userId

export async function authMiddleware(command: Command): Promise<Response | null> {
  // Handle auth commands
  if (command.command === 'register') {
    try {
      const [username, password] = command.args;
      const result = await registerUser(username, password);
      tokens.set(result.token, result.userId);
      return { status: 'success', data: result };
    } catch (error: any) {
      return { status: 'error', error: error.message };
    }
  }

  if (command.command === 'login') {
    try {
      const [username, password] = command.args;
      const result = await authenticateUser(username, password);
      tokens.set(result.token, result.userId);
      return { status: 'success', data: result };
    } catch (error: any) {
      return { status: 'error', error: error.message };
    }
  }

  // Validate token for other commands
  if (!command.token) {
    return { status: 'error', error: 'Authentication required' };
  }

  const userId = tokens.get(command.token);
  if (!userId) {
    return { status: 'error', error: 'Invalid token' };
  }

  command.userId = userId;
  return null; // Continue to next handler
}

export function removeToken(token: string): void {
  tokens.delete(token);
}