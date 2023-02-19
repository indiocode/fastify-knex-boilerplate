import type { FastifyReply, FastifyRequest } from 'fastify';

export async function checkSessionIdExists(
	request: FastifyRequest,
	reply: FastifyReply,
): Promise<void> {
	const { sessionId } = request.cookies;

	if (!sessionId) return reply.status(401).send({ error: 'Unauthorized' });
}
