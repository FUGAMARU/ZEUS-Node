const PORT = 1028
const app = require("express")()
const server = require("http").createServer(app)
server.listen(PORT)
const io = require("socket.io")(server, {
	cors: {
		origin: "*",
		methods: ["GET", "POST"]
	}
})
let prevLog = "prevLog"

const time = () => {
	return `[${new Date().toLocaleString("ja-JP")}]`
}

console.log(`${time()} \x1b[37m\x1b[46mSocket.IO server has ready on port ${PORT}!\x1b[0m`)

io.on("connection", (socket) => {
	console.log(`${time()} \x1b[32m\x1b[1mNew Connection: \x1b[0m${socket.id}`)
	socket.emit("welcome", "welcome")

	socket.on("disconnect", (reason) => {
		console.log(`${time()} \x1b[31m\x1b[1mDisconnected: \x1b[0m${socket.id} - ${reason}`)
	})

	socket.on("register", (res) => {
		if(res !== undefined){
			socket.join(res)
			const str = `${time()} ${socket.id} joined room ${res}`
			if(str !== prevLog){
				console.log(str)
				prevLog = str
			}
		}
	})

	socket.on("sendMessage", (res) => {
		console.log(`${time()} \x1b[36m\x1bㅤReceived Message:\x1b[0m\n${JSON.stringify(res)}`)
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