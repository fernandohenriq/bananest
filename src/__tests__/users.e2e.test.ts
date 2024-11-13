import supertest from 'supertest';
import { beforeAll, describe, expect, test } from 'vitest';

import { MainModule } from '../modules/main.module';

describe('Users', () => {
  const mainModule = new MainModule();

  beforeAll(() => {
    mainModule.init();
  });

  describe('POST /api/users', () => {
    test('Should create a user', async () => {
      const response = await supertest(mainModule.app).post('/api/users').send({
        name: 'John Doe',
        email: 'john.doe@example.com',
        password: 'Abc@1234',
      });
      expect(response.status).toBe(201);
    });

    test('Should not create a user with invalid email', async () => {
      const response = await supertest(mainModule.app).post('/api/users').send({
        name: 'John Doe',
        email: 'invalid-email',
        password: '123456',
      });
      expect(response.status).toBe(400);
    });

    test('Should not create a user with invalid password', async () => {
      const response = await supertest(mainModule.app).post('/api/users').send({
        name: 'John Doe',
        email: 'john.doe@example.com',
        password: '12345',
      });
      expect(response.status).toBe(400);
    });
  });
});
