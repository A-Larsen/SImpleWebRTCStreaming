import { WsConnection} from './modules/wsconnections.js';
import { PeerConnection } from './modules/peerconnections.js';
import { Media } from './modules/media.js';


let elements = {
	streamDisplay : document.getElementById('streamDisplay'),
}


navigator.mediaDevices.getUserMedia({video: true, audio: true})
.then(mySteam => {

	let peers = {};

	const wsConn = new WsConnection(elements );

	const peerConn = new PeerConnection({
		// host: 'importantmsg',
		port: '9000',
		path: '/',
		secure: true,
	});

	addVideoToStreamDispay(mySteam);

	peerConn.init()
	.then(peer => {

		peer.on('call', call => {
			call.answer(mySteam);
		});

		wsConn.init()
		.then(ws => {

			peer.on('open', id => {
				ws.sendData('talk-join', {
					id: id
				})
			})

			ws.onmessage = function(ev){

				let obj = JSON.parse(ev.data);

				switch(obj.type){
					case 'talk-add-user': {

						console.log(elements.streamDisplay);
						console.log("me: " + peer.id);
						let vids  = elements.streamDisplay.getElementsByTagName('video');

						for(let i = 0; i < vids.length; i++){
							if(vids[i].srcObject !== mySteam){
								vids[i].remove();
							}
						}

						obj.data.forEach(friendId => {
							const call = peer.call(friendId, mySteam);
							call.on('stream', friendStream => {
								let video = addVideoToStreamDispay(friendStream);
								peers[friendId] = {call, video};
							})

						})


						break;
					}

					case 'talk-remove-user': {
						console.log('user is being removed');
						let peer = peers[obj.data];
						peer.call.close();
						peer.video.remove();
					}
				}
			};

			console.log(wsConn.id);
			ws.sendData('what', {name: 'no one', age: 300});

		})
		.catch(err => {
			console.log('could not connect to websocket: ' + err);
		})
	})
})

function addVideoToStreamDispay(stream){
	let video = document.createElement('video');
	video.srcObject = stream;

	video.addEventListener('loadedmetadata', () => {
		video.play();
	})

	elements.streamDisplay.appendChild(video);
	return video;

}

