require("dotenv").config()
const time = require("./src/Time")

const app = require("express")()

//Socket.IO
const server = require("http").createServer(app)
server.listen(process.env.PORT)
const io = require("socket.io")(server, {
	cors: {
		origin: "*",
		methods: ["GET", "POST"]
	}
})
require("./src/Socket.IOEvents")(io)
console.log(`${time()} \x1b[37m\x1b[46mSocket.IO server has ready on port ${process.env.PORT}!\x1b[0m`)

//Express Routing
const TwitterTrendsProvider = require("./src/TwitterTrendsProvider")
app.use("/", TwitterTrendsProvider)