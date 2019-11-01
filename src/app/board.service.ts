import  { Injectable } from '@angular/core'
import { ROWS, COLS, POINTS } from './constants'
import { IPiece }  from './piece.component'

@Injectable({
    providedIn: 'root'
})

export class BoardService{

    getEmptyBoard() : number[][]{
        return Array.from({length: ROWS}, () => Array(COLS).fill(0))
    }

    isEmpty(value: number) :boolean {
        return value === 0
    }

    insideWalls(value: number):boolean {
        return value >= 0 && value < COLS
    }

    abovefloor(value:number):boolean {
        return value < ROWS;
    }

    rotate(piece: IPiece) :IPiece {
        let p:IPiece = JSON.parse(JSON.stringify(piece));
        for(let y = 0; y < p.shape.length; ++y) {
            for(let x = 0; x< y; ++x ){
                [p.shape[x][y], p.shape[y][x]] = [p.shape[y][x], p.shape[x][y]]
            }
        };
        p.shape.forEach( row => row.reverse());
        return p
    }

    notOccupied(board:number[][], x:number, y:number){
        return  board[y] && board[y][x] == 0 
    }

    valid( p : IPiece, board : number[][]):boolean {
        return p.shape.every( (row, dy) => {
            return row.every( (value, dx) =>{
                let x = p.x + dx;
                let y = p.y + dy;
                return this.isEmpty(value) ||
                (this.insideWalls(x) && this.abovefloor(y) && this.notOccupied(board, x, y))
            })
        })
    }

    getLinesClearedPoints( lines:number, level : number):number {
        let lineClearPoints;
        switch(lines) {
            case 1:
                lineClearPoints = POINTS.SINGLE;
            break;
            case 2:
                lineClearPoints = POINTS.DOUBLE;
            break;
            case 3:
                lineClearPoints = POINTS.TRIPLE;
            break;
            case 4:
                lineClearPoints =POINTS.TETRIS;
            break;
            default :
                lineClearPoints = 0
        }
        return (level +1) * lineClearPoints
    }
}