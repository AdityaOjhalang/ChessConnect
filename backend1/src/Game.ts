import { WebSocket } from "ws";
import { Chess } from 'chess.js'
import { GAME_OVER, INIT_GAME, MOVE } from "./messages";


export class Game {
	public player1: WebSocket;
	public player2: WebSocket;
	private board: Chess;
	private moves: string[];
	private startTime: Date;


	constructor(player1: WebSocket, player2: WebSocket) {
		this.player1 = player1;
		this.player2 = player2;
		this.board = new Chess();
		this.moves = [];
		this.startTime = new Date();
		this.player1.send(JSON.stringify({ type: INIT_GAME, payload: { color: "white" } }));
		this.player2.send(JSON.stringify({ type: INIT_GAME, payload: { color: "black" } }));
	}

	makeMove(socket: WebSocket, move:
		{ from: string, to: string, }
	) {
		//valdiation
		if (this.board.moves.length % 2 === 0 && socket !== this.player1) {
			//send error message
			return;
		}
		if (this.board.moves.length % 2 === 1 && socket !== this.player2) {
			//send error message
			return;
		}
		try { this.board.move(move); }
		catch (e) {
			//send error message
			return;
		}
		if (this.board.isGameOver()) {
			//send game over message
			this.player1.emit(JSON.stringify({
				type: GAME_OVER, payload: {
					winner: this.board.turn() === "w" ? "black" : "white",
				}
			}))

		}
		if (this.moves.length % 2 === 0) {
			this.player2.emit(JSON.stringify({ type: MOVE, payload: move }));
		}
		else {
			this.player1.emit(JSON.stringify({ type: MOVE, payload: move }));
		}

		//check game is over
		//send the updated board to both players 
	}
}