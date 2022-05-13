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

	socket.on("register", (res) => {
		if(res !== undefined){
			socket.join(res)
			console.log(`${socket.id}がルーム ${res} に参加しました`)
		}
	})

	socket.on("sendMessage", (res) => {
		console.log(`新規メッセージ => ${JSON.stringify(res)}`)
		if(res.scope === "global"){
			io.emit("receiveMessage", {
				scope: "global",
				userName: res.userName,
				iconSrc: res.iconSrc,
				datetime: `${new Date().getHours()}:${("00" + new Date().getMinutes()).slice(-2)}`,
				message: res.message
			})
		}else if(res.scope === "class"){
			io.in(res.classID).emit("receiveMessage", {
				scope: "class",
				userName: res.userName,
				iconSrc: res.iconSrc,
				datetime: `${new Date().getHours()}:${("00" + new Date().getMinutes()).slice(-2)}`,
				message: res.message
			})
		}
	})
})
 
server.listen(1028)