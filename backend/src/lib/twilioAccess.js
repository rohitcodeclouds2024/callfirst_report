import { Server as IOServer } from "socket.io";
import jwt from "jsonwebtoken";
import User from "./models/user.js"; // Sequelize model

const io = new IOServer(app.server, {
	cors: {
		origin: ["http://localhost:3000", "http://127.0.0.1:3000"],
		credentials: true,
	},
});

// Authenticate every socket connection
io.use((socket, next) => {
	const token = socket.handshake.auth?.token;
	if (!token) return next(new Error("Auth required"));

	try {
		const payload = jwt.verify(token, process.env.JWT_SECRET);
		socket.user = payload; // attach decoded JWT (id, email, slug, etc.)
		return next();
	} catch (err) {
		return next(new Error("Invalid token"));
	}
});

io.on("connection", async (socket) => {
	const user = socket.user;
	console.log("🔌 Socket connected:", socket.id, "user:", user?.id);

	// Update DB: set this user's socket_id + mark online
	try {
		await User.update(
			{
				socket_id: socket.id,
				availability: "online",
				last_active_at: new Date(),
			},
			{ where: { id: user.id } }
		);
	} catch (err) {
		console.error("Failed to update user socket_id:", err);
	}

	// (Optional) broadcast presence update
	io.emit("presence:update", { userId: user.id, status: "online" });

	socket.on("disconnect", async () => {
		console.log("❌ Socket disconnected:", socket.id);
		try {
			await User.update(
				{
					socket_id: null,
					availability: "offline",
					last_active_at: new Date(),
				},
				{ where: { id: user.id } }
			);
		} catch (err) {
			console.error("Failed to clear socket_id on disconnect:", err);
		}

		// broadcast presence update
		io.emit("presence:update", { userId: user.id, status: "offline" });
	});
});
