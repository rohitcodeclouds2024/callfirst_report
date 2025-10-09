import User from '../models/user.js';
import Role from "../models/role.js";
import RolesUser from '../models/roleUser.js';
import Permission from "../models/permission.js";
import PermissionsRole from '../models/permissionRole.js';
import bcrypt from 'bcrypt';

export default async function registerUsersRoutes(fastify) {
	fastify.post(
    	"/users",
    	// { preValidation: [fastify.authenticate] },
		async (request, reply) => {
		  	try {
		    	const { name, email, contact_number, password, role_id } = request.body || {};

		    	if (!email || !password || !role_id) {
		      		return reply.status(400).send({ error: "name, email, password & role_id required" });
		    	}

		    	const hashed = await bcrypt.hash(password, 10);

		    	// create user
		    	const user = await User.create({
		      		name,
		      		email,
		      		contact_number,
		      		password: hashed,
		   	 	});

			    // map role_user
			    if (Array.isArray(role_id) && role_id.length > 0) {
  					const roleMappings = role_id.map((rid) => ({
    					user_id: user.id,
    					role_id: rid,
  					}));

  					await RolesUser.bulkCreate(roleMappings);
				}

		    	const out = user.get({ plain: true });
		    	delete out.password;

		    	return reply.code(201).send(out);
		  	} catch (err) {
		    	fastify.log.error(err);
		    	if (err.name === "SequelizeUniqueConstraintError") {
		      		return reply.status(409).send({ error: "email already exists" });
		    	}
		    	return reply.status(500).send({ error: "create_failed" });
		  	}
		}
	);

	fastify.get(
		'/users',
		// If you want this endpoint protected, uncomment the line below:
		{ preValidation: [fastify.authenticate] },
		async (request, reply) => {
			try {
				const page = Math.max(1, Number(request.query.page) || 1);
				const perPage = Math.max(1, Math.min(100, Number(request.query.perPage) || 20));
				const keyword = (request.query.keyword || '').trim();

				const where = {};
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
				return reply.status(500).send({ error: 'list_failed' });
			}
		}
	);


	fastify.get(
    	"/users/:id",
    	// { preValidation: [fastify.authenticate] }, // optional auth
    	async (request, reply) => {
      		try {
        		const id = Number(request.params.id);
        		if (!Number.isFinite(id) || id <= 0) {
          			return reply.code(400).send({ error: "invalid_id" });
        		}

        		// Fetch user and include role(s)
		        const user = await User.findByPk(id, {
		          attributes: { exclude: ["password"] }, // don’t return password
		          include: [
		            {
		              model: Role,
		              through: { attributes: [] }, // hide join table
		              attributes: ["id", "name"], // only return role id + name
		            },
		          ],
		        });

		        if (!user) {
		          return reply.code(404).send({ error: "not_found" });
		        }

        		// if you want to return single role_id (assuming one role per user)
        		const role_id = user.roles?.map((role) => role.id) || [];

		        return reply.send({
		          ...user.toJSON(),
		          role_id,
		        });
	      	} catch (err) {
	        	fastify.log.error(err);
	        	return reply.code(500).send({ error: "fetch_failed" });
	      	}
    	}
  	);

	fastify.put('/users/:id', { preValidation: [fastify.authenticate] }, async (request, reply) => {
	  	try {
	    	const id = request.params.id;
	    	const body = request.body || {};
	    	const up = { ...body };

	    	if (body.password) {
	      		up.password = await bcrypt.hash(body.password, 10);
	    	}

	    	const [count] = await User.update(up, { where: { id } });
	    	if (!count) return reply.status(404).send({ error: 'not_found' });

	    	// Fetch the user first so we can call setRoles
	    	const user = await User.findByPk(id, { attributes: { exclude: ['password'] } });

	    	// Update roles if provided
	    	const roleIds = Array.isArray(body.role_id)
      		? body.role_id.filter((r) => r != null && r !== "")
      		: [];

      		await user.setRoles(roleIds);

	    	return reply.send(user);
	  	} catch (err) {
	    	fastify.log.error(err);
	    	return reply.status(500).send({ error: 'update_failed' });
	  	}
	});


	fastify.delete('/users/:id', async (request, reply) => {
		try {
			const id = Number(request.params.id);
			if (!Number.isFinite(id) || id <= 0) {
				return reply.code(400).send({ error: 'invalid_id' });
			}

			const deleted = await User.destroy({ where: { id } });

			if (!deleted) {
				return reply.code(404).send({ error: 'not_found' });
			}

			// return 200 with body or 204 no-content — using 200 for easier client handling
			return reply.code(200).send({ ok: true, id });
		} catch (err) {
			fastify.log.error(err);
			return reply.code(500).send({ error: 'delete_failed' });
		}
	});

	fastify.post(
    	"/users/bulk-delete",
    	// { preValidation: [fastify.authenticate] },
    	async (request, reply) => {
      		try {
        		const { ids } = request.body || {};
        		if (!Array.isArray(ids) || ids.length === 0) {
          			return reply.code(400).send({ error: "ids must be a non-empty array" });
        		}

		        // Delete in bulk
		        const deletedCount = await User.destroy({
		          where: { id: ids },
		        });

		        return reply.send({
		          ok: true,
		          deletedCount,
		          ids,
		        });
		    } catch (err) {
		        fastify.log.error(err);
		        return reply.code(500).send({ error: "bulk_delete_failed" });
		    }
    	}
  	);

  	fastify.get(
    	"/clients",
    	// { preValidation: [fastify.authenticate] },
    	async (request, reply) => {
      		try {
        		const keyword = (request.query.keyword || "").trim();

        		//  Search condition
        		const where = {};
        		if (keyword) {
          			where[Op.or] = [
            			{ email: { [Op.like]: `%${keyword}%` } },
            			{ name: { [Op.like]: `%${keyword}%` } },
            			{ contact_number: { [Op.like]: `%${keyword}%` } },
          			];
        		}

        		// Join User → Roles through RolesUser
        		const users = await User.findAll({
          			where,
          			include: [
	            		{
	              			model: Role,
	              			through: RolesUser,
	              			where: { name: "Client" }, // Only users having role "client"
	              			attributes: ["id", "name"],
	           	 		},
          			],
          			attributes: { exclude: ["password"] },
          			order: [["id", "ASC"]],
        		});

        		return reply.send({
          			data: users,
          			meta: {
            			total: users.length,
          			},
        		});
      		} catch (err) {
        		fastify.log.error(err);
        		return reply.status(500).send({ error: "list_failed" });
      		}
    	}
    );

    fastify.get("/user/permissions", { preValidation: [fastify.authenticate] }, async (req, reply) => {
    	try {
      		const userId = req.user.id;

      		// Fetch user with roles and their permissions
      		const user = await User.findByPk(userId, {
        		include: [
          			{
            			model: Role,
            			include: [
	              			{
	                			model: Permission,
	                			attributes: ["id", "name"],
	                			through: { attributes: [] }, // hide pivot table data
	              			},
            			],
          			},
        		],
      		});

      		if (!user) return reply.status(404).send({ message: "User not found" });
      		// console.log(user.roles);

      		// Flatten permissions from roles
      		const allPermissions = user.roles.flatMap((role) => role.permissions);
      		// Remove duplicates
      		const uniquePermissions = Array.from(
        		new Map(allPermissions.map((p) => [p.id, p])).values()
      		);

      		const uniquePermissionsMap = uniquePermissions.map((p) => p.name);

      		return reply.send({ data: uniquePermissions, dataMap:uniquePermissionsMap });
    	} catch (err) {
      		console.error("Error fetching permissions:", err);
      		return reply.status(500).send({ message: "Internal server error" });
    	}
  	});
}

