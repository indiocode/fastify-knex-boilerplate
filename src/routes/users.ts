import { randomUUID } from 'crypto';
import type { FastifyInstance } from 'fastify';
import { z } from 'zod';

import { knex } from '~/database';
import { checkSessionIdExists } from '~/middlewares/check-session-id-exists';

export async function usersRoutes(app: FastifyInstance): Promise<void> {
	// app.addHook('preHandler', async (request, reply) => {
	// 	console.log(`[${request.method}] ${request.url}`);
	// });

	app.get(
		'/',
		{
			preHandler: [checkSessionIdExists],
		},
		async (request) => {
			const { sessionId } = request.cookies;

			const transactions = await knex('users')
				.where('session_id', sessionId)
				.select();

			return { transactions };
		},
	);

	app.get(
		'/:id',
		{
			preHandler: [checkSessionIdExists],
		},
		async (request) => {
			const getTransactionParamsSchema = z.object({
				id: z.string().uuid(),
			});

			const { id } = getTransactionParamsSchema.parse(request.params);

			const { sessionId } = request.cookies;

			const transaction = await knex('transactions')
				.where({
					id,
					session_id: sessionId,
				})
				.first();

			return { transaction };
		},
	);

	app.post('/', async (request, reply) => {
		const createTransactionBodySchema = z.object({
			title: z.string(),
			amount: z.number(),
			type: z.enum(['credit', 'debit']),
		});

		const { title, amount, type } = createTransactionBodySchema.parse(
			request.body,
		);

		let { sessionId } = request.cookies;

		if (!sessionId) {
			sessionId = randomUUID();

			reply.cookie('sessionId', sessionId, {
				path: '/',
				maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days
			});
		}

		await knex('transactions').insert({
			id: randomUUID(),
			title,
			amount: type === 'credit' ? amount : amount * -1,
			session_id: sessionId,
		});

		return reply.status(201).send();
	});
}
