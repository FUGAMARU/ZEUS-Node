const time = require("./Time")

const eventListeners = (io) => {
	let prevLog = "prevLog"
	io.on("connection", (socket) => {
		console.log(`${time()} \x1b[32m\x1b[1mNew Connection: \x1b[0m${socket.id}`)
		socket.emit("welcome", "welcome")
	
		socket.on("disconnect", (reason) => {
			console.log(`${time()} \x1b[31m\x1b[1mDisconnected: \x1b[0m${socket.id} - ${reason}`)
		})
	
		socket.on("register", (res) => {
			if(res !== undefined){
				const str = `${time()} ${socket.id} joined room ${res}`
				if(str !== prevLog){
					socket.join(res)
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
}

module.exports = eventListeners