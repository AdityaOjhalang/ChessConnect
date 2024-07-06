import { WebSocket } from "ws";
import { INIT_GAME } from "./messages";
import { Game } from "./Game";


export class GameManager {
	private games: Game[] = [];
	private users: WebSocket[] = [];
	private pendingUser: WebSocket | null; // This might be meant to be WebSocket[] if you intend to manage multiple pending users

	constructor() {
		this.games = [];
		this.pendingUser = null;
		this.users = [];
	}

	addUser(socket: WebSocket) {
		this.users.push(socket);
		this.addHandler(socket); // Assuming addHandler is a method you've implemented elsewhere
	}

	removeUser(socket: WebSocket) {
		this.users = this.users.filter(user => user !== socket);
		// Stop the game here (Implementation depends on how you manage games)
	}

	private addHandler(socket: WebSocket) {
		socket.on("message", (data: string) => {
			const message = JSON.parse(data);
			if (message.type === INIT_GAME) {
				if (this.pendingUser) {
					//start the game
					const game = new Game(this.pendingUser, socket);
					this.games.push(game);
					this.pendingUser = null;

				}
				else {
					this.pendingUser = socket;
				}
			}
			if (message.type === "move") {
				console.log("inside MOve")
				const game = this.games.find(game => game.player1 === socket || game.player2 === socket);
				if (game) {
					console.log("inside Make Move")
					game.makeMove(socket, message.move);
				}
			}
		});
	}

	// Additional methods (addHandler, createGame, joinGame) need to be defined
}
