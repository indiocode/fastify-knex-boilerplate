import { execSync } from 'child_process';
import request from 'supertest';
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';

import { app } from '~/app';

describe('Users routes', () => {
	beforeAll(async () => {
		await app.ready();
	});

	afterAll(async () => {
		await app.close();
	});

	beforeEach(() => {
		execSync('yarn knex migrate:rollback --all');
		execSync('yarn knex migrate:latest');
	});

	it('should be able to create a new user', async () => {
		await request(app.server)
			.post('/users')
			.send({
				name: 'Jhollyfer Rodrigues',
				email: 'jhollyfer@mail.com',
			})
			.expect(201);
	});

	it('should be able to list all users', async () => {
		const createUserResponse = await request(app.server).post('/users').send({
			name: 'Jhollyfer Rodrigues',
			email: 'jhollyfer@mail.com',
		});

		const cookies = createUserResponse.get('Set-Cookie');

		const listUsersResponse = await request(app.server)
			.get('/users')
			.set('Cookie', cookies)
			.expect(200);

		expect(listUsersResponse.body.users).toEqual([
			expect.objectContaining({
				name: 'Jhollyfer Rodrigues',
				email: 'jhollyfer@mail.com',
			}),
		]);
	});

	it('should be able to get a especific user', async () => {
		const createUserResponse = await request(app.server).post('/users').send({
			name: 'Jhollyfer Rodrigues',
			email: 'jhollyfer@mail.com',
		});

		const cookies = createUserResponse.get('Set-Cookie');

		const listUsersResponse = await request(app.server)
			.get('/users')
			.set('Cookie', cookies)
			.expect(200);

		const userId = listUsersResponse.body.users[0].id;

		const getUserResponse = await request(app.server)
			.get(`/users/${userId}`)
			.set('Cookie', cookies)
			.expect(200);

		expect(getUserResponse.body.user).toEqual(
			expect.objectContaining({
				name: 'Jhollyfer Rodrigues',
				email: 'jhollyfer@mail.com',
			}),
		);
	});
});
