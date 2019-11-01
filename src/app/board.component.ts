import  { Component, ViewChild, ElementRef, OnInit, HostListener } from '@angular/core';
import { COLS, BLOCK_SIZE, ROWS, KEY, POINTS, LEVEL, LINES_PER_LEVEL, COLORS } from  './constants'
import { BoardService  } from './board.service'
import { Piece, IPiece } from './piece.component'

@Component({
    selector: 'game-board',
    templateUrl: 'board.component.html'
})

export class BoardComponent implements OnInit {
    @ViewChild('board', {static: true})
    canvas: ElementRef<HTMLCanvasElement>;
    @ViewChild('next', { static : true})
    canvasNext: ElementRef<HTMLCanvasElement> 
    ctx: CanvasRenderingContext2D;
    ctxNext : CanvasRenderingContext2D;
    points: number;
    lines: number;
    level: number;
    board:number[][];
    piece: Piece;
    next: Piece;
    requestId: number;
    time :{ start: number, elapsed: number, level: number};
    constructor( private boardService: BoardService){

    }
    moves = {
        [KEY.LEFT]  : ( p : IPiece) : IPiece => ({ ...p, x: p.x - 1 }),
        [KEY.RIGHT] : ( p : IPiece) : IPiece => ({...p, x: p.x + 1 }),
        [KEY.DOWN]  : ( p : IPiece) : IPiece => ({...p, y:p.y + 1}),
        [KEY.SPACE] : ( p: IPiece ) : IPiece => ({...p, y:p.y +1}),
        [KEY.UP]    : ( p : IPiece) : IPiece => this.boardService.rotate(p)
    }
    

    @HostListener('window:keydown', ['$event'])
    keyEvent(event: KeyboardEvent) {
        if(!this.board || !this.piece || !this.next) {
            return;
        }
        if(event.keyCode === KEY.ESC) {
            this.gameOver()
        }else if(this.moves[event.keyCode]) {
            event.preventDefault();
            let P = this.moves[event.keyCode](this.piece);
            if(event.keyCode === KEY.SPACE) {
                while(this.boardService.valid(P, this.board)){
                    this.points += POINTS.HARD_DROP;
                    this.piece.move(P);
                    P = this.moves[KEY.DOWN](this.piece)
                }
            }else if(this.boardService.valid(P, this.board))
            {
                this.piece.move(P)
               if(event.keyCode === KEY.DOWN) {
                   this.points += POINTS.SOFT_DROP;
               }
            }
        }
    }

    ngOnInit(){
        this.initBoard();
        this.initNext();
        this.restGame();
    }

    initBoard() {
        this.ctx = this.canvas.nativeElement.getContext('2d');
        this.ctx.canvas.width = COLS * BLOCK_SIZE;
        this.ctx.canvas.height = ROWS * BLOCK_SIZE;

        this.ctx.scale(BLOCK_SIZE, BLOCK_SIZE);
    }

    initNext(){
        this.ctxNext = this.canvasNext.nativeElement.getContext('2d');

        this.ctxNext.canvas.width = 4 * BLOCK_SIZE;
        this.ctxNext.canvas.height = 4 * BLOCK_SIZE;

        this.ctxNext.scale(BLOCK_SIZE, BLOCK_SIZE)
    }

    restGame() {
        this.points = 0;
        this.lines = 0;
        this.level = 0;
        this.board = this.boardService.getEmptyBoard();
        this.time = { start: 0, elapsed: 0, level : LEVEL[this.level]}
    }

    play() {
        this.restGame();
        this.next = new Piece(this.ctx)
        this.piece = new Piece(this.ctx);
        this.next.drawNext(this.ctxNext);
        this.time.start = performance.now();

        if(this.requestId) {
            cancelAnimationFrame(this.requestId)
        };

        this.animate()
    }

    freeze(){
        this.piece.shape.forEach((row, y) =>{
            row.forEach((value, x) =>{
                if(value > 0) {
                    this.board[y + this.piece.y][x + this.piece.x] = value;
                                              }
            })
        })
    }

    animate(now = 0) {
        this.time.elapsed = now - this.time.start;
        if(this.time.elapsed > this.time.level) {
            this.time.start = now;
            if(!this.drop()) {
                this.gameOver();
                return
            }
        };
        this.draw();
        this.requestId = requestAnimationFrame(this.animate.bind(this));
    }

    draw(){
        this.ctx.clearRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);
        this.piece.draw();
        this.drawBoard()
    }

    drawBoard(){
        this.board.forEach((row, y) =>{
            row.forEach((value, x) => {
                if(value > 0) {
                    this.ctx.fillStyle = COLORS[value];
                    this.ctx.fillRect(x, y , 1, 1)
                }
            })
        })
    }

    drop():boolean {
        let p = this.moves[KEY.DOWN](this.piece);
        if(this.boardService.valid(p, this.board)){
            this.piece.move(p)
        }else{
            this.freeze()
            this.clearLines()
            if(this.piece.y === 0) {
                return false
            }
            this.piece = this.next;
            this.next = new Piece(this.ctx);
            this.next.drawNext(this.ctxNext)
        }
        return true;
    }

    clearLines() {
        let lines = 0;
        this.board.forEach( (row, y) =>{
            if(row.every( value => value !== 0)) {
                lines++;
                this.board.splice(y, 1);
                this.board.unshift(Array(COLS).fill(0))
            }
        });
        if(lines > 0) {
            this.points += this.boardService.getLinesClearedPoints(lines, this.level);
            this.lines += lines;
            if(this.lines >= LINES_PER_LEVEL) {
                this.level ++;
                this.lines -= LINES_PER_LEVEL;
                this.time.level = LEVEL[this.level];
            }
        }
    }

    gameOver(){
        cancelAnimationFrame(this.requestId);
        this.ctx.fillStyle = 'black';
        this.ctx.fillRect(1, 3, 8, 1.2);
        this.ctx.font = '1px Arial';
        this.ctx.fillStyle = 'red';
        this.ctx.fillText('GAME OVER', 1.8, 4)
    }
}
