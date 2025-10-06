import { Op } from "sequelize";
import User from '../models/user.js';
import Role from "../models/role.js";
import Permission from "../models/permission.js";
import RolesUser from '../models/roleUser.js';
import PermissionsRole from '../models/permissionRole.js';

export default async function registerRolesRoutes(fastify) {
  fastify.get(
    "/roles",
    // { preValidation: [fastify.authenticate] },
    async (request, reply) => {
      try {
        const page = Math.max(1, Number(request.query.page) || 1);
        const perPage = Math.max(1, Math.min(100, Number(request.query.perPage) || 20));

        const offset = (page - 1) * perPage;

        const { rows, count } = await Role.findAndCountAll({
          limit: perPage,
          offset,
          order: [["id", "ASC"]],
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
        return reply.status(500).send({ error: "list_failed" });
      }
    }
  );
  fastify.delete("/roles/:id",
   // { preValidation: [fastify.authenticate] },
    async (request, reply) => {
      try {
        const id = Number(request.params.id);

        if (!Number.isFinite(id) || id <= 0) {
          return reply.status(400).send({ error: "invalid_id" });
        }

        // Optional: Check if role is assigned to any user
        const assignedCount = await RolesUser.count({ where: { role_id: id } });
        if (assignedCount > 0) {
          return reply.status(400).send({ error: "role_assigned_to_users" });
        }

        const deletedCount = await Role.destroy({ where: { id } });
        if (!deletedCount) {
          return reply.status(404).send({ error: "not_found" });
        }
        return reply.code(200).send({ message: "Role deleted successfully" });
      } catch (err) {
        fastify.log.error(err);
        return reply.status(500).send({ error: "delete_failed" });
      }
    }
  );
  fastify.post("/roles/bulk-delete",
    // { preValidation: [fastify.authenticate] },
    async (request, reply) => {
      try {
        const body = request.body;
        const ids = Array.isArray(body.ids) ? body.ids.filter((id) => Number.isFinite(id) && id > 0) : [];

        if (ids.length === 0) {
          return reply.status(400).send({ error: "no_valid_ids_provided" });
        }

        // Optional: Remove role-user associations first
        await RolesUser.destroy({ where: { role_id: ids } });

        // Delete roles
        const deletedCount = await Role.destroy({ where: { id: ids } });

        return reply.code(200).send({
          message: `${deletedCount} role(s) deleted successfully`,
        });
      } catch (err) {
        fastify.log.error(err);
        return reply.status(500).send({ error: "bulk_delete_failed" });
      }
    }
  );

  fastify.get("/roles/:id", async (req, reply) => {
    try {
      const role = await Role.findByPk(req.params.id, { include: Permission });
      if (!role) return reply.status(404).send({ error: "not_found" });
      return reply.send(role);
    } catch (err) {
      return reply.status(500).send({ error: "failed_to_fetch_role" });
    }
  });

  fastify.post("/roles", async (req, reply) => {
    try {
      const { name, permission_ids = [] } = req.body;
      const role = await Role.create({ name });
      if (permission_ids.length) {
        await role.setPermissions(permission_ids);
      }
      return reply.send(role);
    } catch (err) {
      console.log(err);
      return reply.status(500).send({ error: "failed_to_create_role" });
    }
  });

  fastify.put("/roles/:id", async (req, reply) => {
    try {
      const { name, permission_ids = [] } = req.body;
      const role = await Role.findByPk(req.params.id);
      if (!role) return reply.status(404).send({ error: "not_found" });

      await role.update({ name });
      await role.setPermissions(permission_ids);

      return reply.send(role);
    } catch (err) {
      return reply.status(500).send({ error: "failed_to_update_role" });
    }
  });

  fastify.get("/permissions/grouped", async (req, reply) => {
    try {
      const permissions = await Permission.findAll({
        attributes: ["id", "name", "page"],
        where: { status: 1 },
        raw: true,
      });

      const grouped = {};
      for (const perm of permissions) {
        if (!grouped[perm.page]) grouped[perm.page] = [];
        grouped[perm.page].push({ id: perm.id, name: perm.name });
      }

      const result = Object.entries(grouped).map(([page, data]) => ({
        name: page,
        data,
      }));

      return reply.send(result);
    } catch (err) {
      return reply.status(500).send({ error: "failed_to_fetch_permissions" });
    }
  });
}
