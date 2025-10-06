import bcrypt from 'bcrypt';
import { Op } from 'sequelize';
import User from '../models/user.js';

export default async function registerAuthRoutes(fastify) {
	fastify.post('/auth/signup', async (request, reply) => {
		try {
			const { email, password, name, slug, twilio_identity } = request.body || {};
			if (!email || !password) return reply.status(400).send({ error: 'email and password required' });

			const hashed = await bcrypt.hash(password, 10);
			const user = await User.create({ email, password: hashed, name, slug, twilio_identity });

			const data = user.get({ plain: true });
			delete data.password;
			return reply.code(201).send(data);
		} catch (err) {
			fastify.log.error(err);
			if (err.name === 'SequelizeUniqueConstraintError') return reply.status(409).send({ error: 'email already exists' });
			return reply.status(500).send({ error: 'signup_failed' });
		}
	});

	// inside src/routes/auth.js (or wherever you defined the route)
	fastify.post('/auth/login', async (request, reply) => {
		try {
			const { email, password } = request.body || {};
			if (!email || !password) {
				return reply.status(400).send({ error: 'email/password required' });
			}

			const user = await User.findOne({ where: { email } });
			if (!user) return reply.status(401).send({ error: 'invalid_credentials' });

			// If you want to check password, uncomment and use bcrypt.compare here:
			// const ok = await bcrypt.compare(password, user.password);
			// if (!ok) return reply.status(401).send({ error: 'invalid_credentials' });

			// Sign JWT
			const token = fastify.jwt.sign({
				id: user.id,
				email: user.email,
				name: user.name,
				slug: user.slug,
				twilioIdentity: user.twilio_identity,
			});

			// Update availability -> online and set last_active_at
			try {
				// use instance update so hooks/updatedAt run
				await user.update({
					availability: 'online',
					last_active_at: new Date(),
					// Do NOT touch socket_id here — socket layer will set it on connect
				});
			} catch (updErr) {
				fastify.log.error('Failed to set user online:', updErr);
				// continue even if update fails
			}

			// prepare safe user to return (remove sensitive fields)
			const safe = user.get ? user.get({ plain: true }) : { ...user };
			if (safe.password) delete safe.password;

			return reply.send({ token, user: safe });
		} catch (err) {
			fastify.log.error(err);
			return reply.status(500).send({ error: 'login_failed' });
		}
	});

	fastify.get('/agents/available', { preValidation: [fastify.authenticate] }, async (request, reply) => {
		try {
			const page = Math.max(1, Number(request.query.page) || 1);
			const perPage = Math.max(1, Math.min(200, Number(request.query.perPage) || 50));
			const keyword = (request.query.keyword || '').trim();

			const where = {
				availability: { [Op.notIn]: ['in-call', 'offline'] },
				// optional: only return agents with active socket
				// socket_id: { [Op.not]: null }
			};

			if (keyword) {
				where[Op.or] = [
					{ email: { [Op.like]: `%${keyword}%` } },
					{ name: { [Op.like]: `%${keyword}%` } },
					{ slug: { [Op.like]: `%${keyword}%` } },
					{ twilio_identity: { [Op.like]: `%${keyword}%` } },
				];
			}

			const offset = (page - 1) * perPage;
			const { rows, count } = await User.findAndCountAll({
				where,
				limit: perPage,
				offset,
				order: [['id', 'ASC']],
				attributes: { exclude: ['password'] },
			});

			return reply.send({
				data: rows,
				meta: {
					page,
					perPage,
					total: count,
					totalPages: Math.ceil(count / perPage),
				},
			});
		} catch (err) {
			fastify.log.error(err);
			return reply.code(500).send({ error: 'list_failed' });
		}
	});









	fastify.get('/auth/me', { preValidation: [fastify.authenticate] }, async (request, reply) => {
		const user = await User.findByPk(request.user.id, { attributes: { exclude: ['password'] } });
		if (!user) return reply.status(404).send({ error: 'not_found' });
		return reply.send(user);
	});
}
