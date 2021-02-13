const express = require('express');
const { PeerServer } = require('peer');
const ws = require('ws');
const path = require('path');
const https = require('https');
const fs = require('fs');

// const port = 3000, host = 'localhost';

const port = 443;
const host = "importantmsg.xyz"
const app = express();

const httpsOptions = {
	cert: fs.readFileSync('/etc/ssl/certs/importantmsg_xyz.pem'),
	ca: fs.readFileSync('/root/ssl/importantmsg_xyz.ca-bundle'),
	key: fs.readFileSync('/root/ssl/importantmsg_xyz.key')
}
const httpsServer = https.createServer(httpsOptions, app);

// const peerServer = PeerServer({
// 	port: 9000, 
// 	path: '/'
// });

const peerServer = PeerServer({
  port: 9000,
  ssl: {
	key: fs.readFileSync('/root/ssl/importantmsg_xyz.key'),
	cert: fs.readFileSync('/etc/ssl/certs/importantmsg_xyz.pem'),
  }
});

let talkUsers = new Map();

app.set('view engine', 'ejs')
app.set('veiws', path.join(__dirname, 'views' ))

app.use(express.static(path.join(__dirname, 'public')))

// const wss = new ws.Server({
// 	port: 2000,
// })

const wss = new ws.Server({
	noServer: true,
})

wss.on('connection', socket => {

	socket.on('message', jsonData => {
		let obj = JSON.parse(jsonData);

		switch(obj.type){
			case 'talk-join' :{
				let data = obj.data;
				talkUsers.set(socket, data.id);

				console.log(talkUsers.size);


				talkUsers.forEach((value, key, map) => {
					let users = Array.from(map.values());
					users.splice(
						users.indexOf(value),
						1
					)
					if(users.length > 0){
						key.send(JSON.stringify({
							type: 'talk-add-user',
							data: users,
						}))

					}
				})


				break;
			}
		}
	})

	socket.on('close', () => {
		talkUsers.forEach((value, key, map) => {
			if(key !== socket){
				key.send(JSON.stringify({
					type: 'talk-remove-user',
					data: talkUsers.get(socket),

				}));
			}
		})

		talkUsers.delete(socket);
	})
})

httpsServer.listen(port, host);

httpsServer.on('upgrade', (request, socket, head) => {
	wss.handleUpgrade(request, socket, head, socket => {
		wss.emit('connection', socket, request);
	});
})

app.get('/', (req, res) => {
	res.render('index');
	
})
