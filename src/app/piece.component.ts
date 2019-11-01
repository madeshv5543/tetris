import { COLORS, SHAPES} from './constants'
export interface IPiece{
    x: number,
    y:number,
    color:string,
    shape: number[][];
};

export class Piece implements IPiece {
    x:number;
    y:number;
    color:string;
    shape: number[][];

    constructor(private ctx: CanvasRenderingContext2D ){
        this.spawn()
    }

    spawn(){
        const typeId = this.randomizeTetrominoType(COLORS.length)
        this.color = COLORS[typeId];
        this.shape = SHAPES[typeId];
        this.x= typeId === 4 ? 4: 3;
        this.y = 0;
    }

    draw(){
        this.ctx.fillStyle= this.color;
        this.shape.forEach((row, y) => {
            row.forEach( (value, x) => {
                if(value > 0) {
                    this.ctx.fillRect(this.x + x, this.y + y, 1,1)
                }
            })
        })
    }

    drawNext(ctxNext: CanvasRenderingContext2D) {
        ctxNext.clearRect(0, 0, ctxNext.canvas.width, ctxNext.canvas.height);
        ctxNext.fillStyle = this.color;
        this.shape.forEach((row, y) =>{
            row.forEach((value, x) =>{
                if(value > 0) {
                    ctxNext.fillRect(x,y,1,1)
                }
            })
        })
    }

    move(P:IPiece){
        this.x = P.x;
        this.y = P.y;
        this.shape = P.shape;
    }

    randomizeTetrominoType(noOftypes: number):number {
        return Math.floor(Math.random() * noOftypes + 1)
    }
}

