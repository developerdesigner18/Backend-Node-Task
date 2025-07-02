const { Server } = require("socket.io");
const InitializeSocketIo = (server) => {
  const io = new Server(server, {
    cors: {
      origin: "http://localhost:5173",
      methods: ["GET", "POST"],
    },
  });

  return io;
};
module.exports = InitializeSocketIo;
