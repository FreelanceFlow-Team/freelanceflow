import { describe, it, expect } from 'vitest';
import { AppController } from './app.controller';

describe('AppController', () => {
  const appController = new AppController();

  it('check: returns ok status with timestamp', () => {
    const result = appController.check();
    expect(result.status).toBe('ok');
    expect(typeof result.timestamp).toBe('string');
  });
});
