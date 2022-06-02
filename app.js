require("dotenv").config()

const Twitter = require("twitter")
const client = new Twitter({
	consumer_key: process.env.TWITTER_CONSUMER_KEY,
	consumer_secret: process.env.TWITTER_CONSUMER_SECRET,
	access_token_key: process.env.TWITTER_ACCESS_TOKEN_KEY,
	access_token_secret: process.env.TWITTER_ACCESS_TOKEN_SECRET
})

let trends = []
let lastUpdate = ""
const getTwitterTrends = () => {
	client.get("trends/place", {id: 23424856}, (err, res) => {
		if(!err){
			const prevTrends = res[0]["trends"]
	
			const sortedTrends = Object.keys(prevTrends).map((key) => {
				return prevTrends[key]
			}).sort((a, b) => {
				return (a.tweet_volume > b.tweet_volume) ? -1 : 1
			})

			trends = [{name: sortedTrends[0].name, url: sortedTrends[0].url, tweet_volume: sortedTrends[0].tweet_volume}, {name: sortedTrends[1].name, url: sortedTrends[1].url, tweet_volume: sortedTrends[1].tweet_volume}, {name: sortedTrends[2].name, url: sortedTrends[2].url, tweet_volume: sortedTrends[2].tweet_volume}]
			lastUpdate = `${new Date().getHours()}:${("00" + new Date().getMinutes()).slice(-2)}`
			console.log(`${time()} \x1b[36m\x1b[1mTwitterトレンドを取得・更新しました\x1b[0m`)
		}else{
			console.log(`${time()} \x1b[31m\x1b[1mTwitterトレンドの取得エラーが発生しました\x1b[0m`)
		}
	})
}

getTwitterTrends()
setInterval(() => {
	getTwitterTrends()
}, 60000)

const app = require("express")()
const server = require("http").createServer(app)
server.listen(process.env.PORT)
const io = require("socket.io")(server, {
	cors: {
		origin: "*",
		methods: ["GET", "POST"]
	}
})
let prevLog = "prevLog"

app.get("/twitter-trends", (req, res) => {
	res.header("Access-Control-Allow-Origin", "*")
	res.header("Access-Control-Allow-Methods", "GET")
	res.json({trends: trends, lastUpdate: lastUpdate})
})

const time = () => {
	return `[${new Date().toLocaleString("ja-JP")}]`
}

console.log(`${time()} \x1b[37m\x1b[46mSocket.IO server has ready on port ${process.env.PORT}!\x1b[0m`)

io.on("connection", (socket) => {
	console.log(`${time()} \x1b[32m\x1b[1mNew Connection: \x1b[0m${socket.id}`)
	socket.emit("welcome", trends)

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