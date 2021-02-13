let websockets = new Map();
let websocketsIdx = 0;

export class WsConnection {
	constructor(elements){
		this.id = websocketsIdx;
		websocketsIdx++;
		this.elements = elements;
		this.peer = null;
	}

	init(){

		return new Promise((resolve, reject) => {
			// let ws = new WebSocket('wss://' + window.location.hostname + ':2000');
			let ws = new WebSocket('wss://' + window.location.host + window.location.pathname);
			websockets.set(websocketsIdx, ws)

			let sendMessage = this.sendMessage;

			ws.me = this;

			ws.onopen = function(){

				ws.sendData = function(type, data){
					ws.send(JSON.stringify({
						type: type,
						data: data,
					}))
				}

				resolve(ws);
			}
			ws.onerror = function(err){
				reject(err.message);
			}

		})

	}

}

export function createMessage(type, data){
	return JSON.stringify({
		type: type,
		data: data
	})
}
