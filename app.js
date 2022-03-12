const app = require("express")()
const server = require("http").createServer(app)
const io = require("socket.io")(server, {
	cors: {
		origin: "*",
		methods: ["GET", "POST"]
	}
})
const logger = require("log4js").getLogger()
logger.level = "all"

const someFunction = () => {
	console.log("Executed!")
}

app.get("/", (req, res) => {
	res.json({ status: 200 })
	someFunction()
})

io.on("connection", (socket) => {
	logger.info(`New Connection: ${socket.id}`)
	socket.emit("welcome", "ようこそ")

	socket.on("disconnect", (reason) => {
		logger.info(`Disconnected: ${socket.id} - ${reason}`)
	})
})
 
server.listen(8080)