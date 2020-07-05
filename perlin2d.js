class Gradient{
    constructor(angle=Math.random()*2*Math.PI,
                magnitude=1){
        this.angle=angle
        this.magnitude=magnitude
        this.vector=this.getVector()
    }
    getVector(){
        const x=this.magnitude*Math.cos(this.angle)
        const y=this.magnitude*Math.sin(this.angle)
        return{"x":x,"y":y}
    }
}

class Perlin2DLinear{
    constructor(width,height,cellWidth,blurSteps){
        this.width=width
        this.height=height
        this.cellSize=cellSize
        this.initGradientsGrid()
        this.initNoiseGrid()
        this.makeNoise()
        for(let i=0;i<blurSteps;++i)
            this.boxBlur()
        this.normalizeNoise()
    }
    initGradientsGrid(){
        this.gradientsGrid = []
        for(let y=0;y*this.cellSize<=this.height;++y){
            this.gradientsGrid.push([])
            for(let x=0;x*this.cellSize<=this.width;++x){
                this.gradientsGrid[y].push(new Gradient())
            }
        }
    }
    initNoiseGrid(){
        this.noiseGrid=[]
        for(let y=0;y<this.height;++y){
            this.noiseGrid.push([])
            for(let x=0;x<this.width;++x){
                this.noiseGrid[y].push(0)
            }
        }
    }
    makeNoise(){
        for(let y=0;y<this.height-this.height%this.cellSize;++y){
            for(let x=0;x<this.width-this.width%this.cellSize;++x){
                //from top left and clockwise, here are the four gradients surrounding point x,y
                const row=parseInt(y/this.cellSize)
                const col=parseInt(x/this.cellSize)
                const g1=this.gradientsGrid[row][col]
                const g2=this.gradientsGrid[row][1+col]
                const g3=this.gradientsGrid[1+row][1+col]
                const g4=this.gradientsGrid[1+row][col]
                //calculate vectors from each corners to the point x,y
                const cellX=x%this.cellSize
                const cellY=y%this.cellSize
                const p1={
                    "x":cellX-g1.vector.x,
                    "y":cellY-g1.vector.y}
                const p2={
                    "x":cellX-g2.vector.x,
                    "y":cellY-g2.vector.y}
                const p3={
                    "x":cellX-g3.vector.x,
                    "y":cellY-g3.vector.y}
                const p4={
                    "x":cellX-g4.vector.x,
                    "y":cellY-g4.vector.y}
                //calculate the gradient values for each 4 corners by doing the dot product of each corner gradient vector and the vector from that corner to the point x,y
                let Q1= g1.vector.x*p1.x+g1.vector.y*p1.y
                let Q2= g2.vector.x*p2.x+g2.vector.y*p2.y
                let Q3= g3.vector.x*p3.x+g3.vector.y*p3.y
                let Q4= g4.vector.x*p4.x+g4.vector.y*p4.y
                //bilinear interpolation
                const deltaTop=Q2-Q1
                const deltaBottom=Q3-Q4
                const top=deltaTop*(x%this.cellSize)/this.cellSize+Q1
                const bottom=deltaBottom*(x%this.cellSize)/this.cellSize+Q4
                const delta=bottom-top
                const value=((top+delta*(y%this.cellSize)/this.cellSize))
                this.noiseGrid[y][x]=value
            }
        }
    }
    normalizeNoise(){
        let max= -Infinity
        let min= +Infinity
        for(let y=0;y<this.height;++y){
            for(let x=0;x<this.width;++x){
                const value=this.noiseGrid[y][x]
                if(max<value) max=value
                if(min>value) min=value
            }
        }
        const range=max-min
        const ratio=2/range
        for(let y=0;y<this.height;++y){
            for(let x=0;x<this.width;++x){
                this.noiseGrid[y][x]*=ratio
            }
        }
        let offset=+Infinity
        for(let y=0;y<this.height;++y){
            for(let x=0;x<this.width-this.width%this.cellSize-1;++x){
                const value=this.noiseGrid[y][x]
                if(offset>value) offset=value
            }
        }
        offset+=1
        for(let y=0;y<this.height;++y){
            for(let x=0;x<this.width;++x){
                this.noiseGrid[y][x]-=offset
            }
        }
    }
    boxBlur(){
        let newNoiseGrid=[]
        for(let y=0;y<this.height;++y){
            newNoiseGrid.push(new Array(this.width))
            for(let x=0;x<this.width;++x){
                newNoiseGrid[y][x]=0
                let timesAdded=0
                if(y>0&&x>0){
                    newNoiseGrid[y][x] += this.noiseGrid[y-1][x-1]
                    ++timesAdded
                }
                if(y>0){
                    newNoiseGrid[y][x] += this.noiseGrid[y-1][x]
                    ++timesAdded
                }
                if(y>0&&x<this.width-1){
                    newNoiseGrid[y][x]+=this.noiseGrid[y-1][x+1]
                    ++timesAdded
                }
                if(x>0){
                    newNoiseGrid[y][x]+=this.noiseGrid[y][x-1]
                    ++timesAdded
                }
                newNoiseGrid[y][x]+=this.noiseGrid[y][x]
                ++timesAdded
                if(x<this.width-1){
                    newNoiseGrid[y][x]+=this.noiseGrid[y][x+1]
                    ++timesAdded
                }
                if(y<this.height-1&&x>0){
                    newNoiseGrid[y][x]+=this.noiseGrid[y+1][x-1]
                    ++timesAdded
                }
                if(y<this.height-1){
                    newNoiseGrid[y][x]+=this.noiseGrid[y+1][x]
                    ++timesAdded
                }
                if(y<this.height-1&&x<this.width-1){
                    newNoiseGrid[y][x]+=this.noiseGrid[y+1][x+1]
                    ++timesAdded
                }
                newNoiseGrid[y][x]/=timesAdded
            }
        }
        this.noiseGrid =newNoiseGrid
    }
}















