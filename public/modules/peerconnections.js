let peerConnections = new Map();
let peerConnectionsIdx = 0;

export class PeerConnection {
	constructor(ws){
		this.id = peerConnectionsIdx;
		peerConnectionsIdx++;
		// this.peers = [];
		this.ws = null;
	}

	init(){
		return new Promise((resolve, reject) => {
			const peer = new Peer(null, this.options);
			peerConnections.set(peerConnectionsIdx, peer)

			peer.on('error', err => {
				console.log(err);
			})

			resolve(peer);
		})
	}
}
