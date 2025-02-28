import Component from "../Component.js";

//last four inputs are for addresses
class RAM256B extends Component
{
    constructor()
    {
        //input 16 is write enabled
        //input 17 is clock
        //input 18 is read enabled
        super("RAM256B", [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0], [0,0,0,0,0,0,0,0], 140, "rgba(64, 78, 128, 255)");

        this.registers = new Array(256);

        for(let i=0;i<256;i++)
        {
            this.registers[i] = [0,0,0,0,0,0,0,0];
        }


        this.clockWasZero = true;

    }

    isSpecialInput(index)
    {
        if(index >= 16)
        {
            return true;
        }
        return false;
    }

    getCurrentAddress()
    {
        let address = 0;
        let multiplier = 1;
        for(let i=8;i<16;i++)
        {
           address+= this.inputs[i]*multiplier;
           multiplier*=2;
        }

        console.log(address)
        return address;
    }

    updateOutputs()
    {
        //rising edge of clock
        if(this.inputs[17] == 1 && this.clockWasZero)
        {

            let address = this.getCurrentAddress();

            //if write enabled we update the register at that address
            if(this.inputs[16] == 1)
            {
                for(let i=0;i<8;i++)
                {
                    this.registers[address][i] = this.inputs[i];
                }
            }

            //if read enabled we output that register
            if(this.inputs[18]==1)
            {
                for(let i=0;i<8;i++)
                {
                   this.outputs[i] =  this.registers[address][i] + 0;
                }
            }
            else
            {
                for(let i=0;i<8;i++)
                {
                   this.outputs[i] =  0;
                }
            }


        }

        if(this.inputs[17]==0)
        {
            this.clockWasZero = true;
        }
        else
        {
            this.clockWasZero = false;
        }
    }

    highlightConnectionPoint(context, cameraPosition, zoom, isInput, index)
    {
        let realX = (this.position.x - cameraPosition.x) * zoom;
        let realY = (this.position.y - cameraPosition.y) * zoom;
        context.fillStyle = "rgba(255, 255, 0, 255)";

        //console.log(realX, realY);
        if(isInput && !this.isSpecialInput(index))
        {
            context.beginPath();
            context.arc(realX + 4*zoom, realY + (index*20 + 10)*zoom, 8*zoom, 0, 2 * Math.PI);
            context.fill();

        }
        else if(isInput && this.isSpecialInput(index))
        {
            
            context.beginPath();
            context.arc(realX + ((index-16)*20 + this.size.x/4)*zoom, realY + (this.size.y)*zoom, 8*zoom, 0, 2 * Math.PI);
            context.fill();
        }
        else
        {
         
            context.beginPath();
            context.arc(realX -4*zoom + this.size.x*zoom, realY + (index*20 + 10)*zoom, 8*zoom, 0, 2 * Math.PI);
            context.fill();
            
        }
      

       
    }

    draw(context, cameraPosition, zoom)
    {
        context.fillStyle = this.color;
        context.beginPath();
        //console.log(this.size);

        let realX = (this.position.x - cameraPosition.x) * zoom;
        let realY = (this.position.y - cameraPosition.y) * zoom;

        context.rect(realX, realY, this.size.x*zoom, this.size.y*zoom);
        context.fill();

        context.fillStyle = "rgba(50, 50, 50, 255)";
        for(let i=0;i<16;i++)
        {
            context.beginPath();
            context.arc(realX + 4*zoom, realY + (i*20 + 10)*zoom, 8*zoom, 0, 2 * Math.PI);
            context.fill();
        }

        //address inputs drawing
        for(let i=0;i<3;i++)
        {
            context.beginPath();
            context.arc(realX + (i*20 + this.size.x/4)*zoom, realY + (this.size.y)*zoom, 8*zoom, 0, 2 * Math.PI);
            context.fill();
        }


        for(let i=0;i<this.outputs.length;i++)
        {
            context.beginPath();
            context.arc(realX -4*zoom + this.size.x*zoom, realY + (i*20 + 10)*zoom, 8*zoom, 0, 2 * Math.PI);
            context.fill();
        }

        context.fillStyle = "rgba(255, 255, 255, 255)";

        let fontSize = Math.floor(12*zoom);
        context.font = `${fontSize}px serif`;
        context.fillText("RAM256B", realX + (this.size.x/2)*zoom - (3 * ("RAM256B".length))*zoom, 
        realY +  this.size.y/2*zoom);

        for(let i=0;i<16;i++)
        {
            let text = "";
            if(i<8)
            {
                text = "I"+i;
            }
            else
            {
                text = "A"+(i-8);
            }
            context.fillText(text, realX + (12)*zoom, realY + (i*20 + 15)*zoom);
        }

        for(let i=0;i<8;i++)
        {
            context.fillText("O"+i, realX + (this.size.x - 24)*zoom, realY + (i*20 + 15)*zoom);
        }

        fontSize = Math.floor(10*zoom);
        context.font = `${fontSize}px serif`;
        context.fillText("WR", realX + (0*20 + this.size.x/4 -("WR".length/2)*5)*zoom, realY + (this.size.y + -20)*zoom);
        context.fillText("CLK", realX + (1*20 + this.size.x/4 - ("CLK".length/2)*5)*zoom, realY + (this.size.y + -20)*zoom);
        context.fillText("RE", realX + (2*20 + this.size.x/4 - ("RE".length/2)*5)*zoom, realY + (this.size.y + -20)*zoom);

       
        
       
    }

    
    getInputPositionCenter(index, cameraPosition, zoom)
    {
        if(this.isSpecialInput(index))
        {
            //console.log(index);
            return {x:(this.position.x + (index-16)*20 + this.size.x/4)*zoom, y:( this.position.y + this.size.y)*zoom};
        }
        else
        {
            return {x:(this.position.x)*zoom, y:( this.position.y + index*20 + 10)*zoom};
        }
       
    }

    inWhichInputIsPoint(point, cameraPosition, zoom)
    {
        let whichCircle = this.inWhichCircleIsPoint(point, this.inputs, 4, cameraPosition, zoom);
        if(whichCircle != -1 && whichCircle < 16)
        {
            return whichCircle;
        }
     
        for(let i=0;i<3;i++)
        {
            let firstExpression = point.x - (this.position.x - cameraPosition.x +  i*20 + this.size.x/4)*zoom;
            firstExpression *= firstExpression;

            let secondExpression = point.y - (this.position.y - cameraPosition.y + this.size.y)*zoom;
            secondExpression *= secondExpression;

            if(firstExpression + secondExpression <= 8*zoom*8*zoom)
            {
                return 16+i;
            }
        }

        return -1;
    }

    inWhichCircleIsPoint(point, arrayOfPorts, offsetX, cameraPosition, zoom)
    {
        for(let i=0;i< arrayOfPorts.length;i++)
        {
            //center x, center y, radius, start angle, end angle
            //context.arc(this.position.x, this.position.y + i*20 + 10, 8, 0, 2 * Math.PI);

            let firstExpression = point.x - (this.position.x - cameraPosition.x + offsetX)*zoom;
            firstExpression *= firstExpression;

            let secondExpression = point.y - (this.position.y - cameraPosition.y + i*20 + 10)*zoom;
            secondExpression *= secondExpression;

            if(firstExpression + secondExpression <= 8*zoom*8*zoom)
            {
                return i;
            }
            //console.log("checking " + i);
        }

        return -1;
    }
}

export default RAM256B;