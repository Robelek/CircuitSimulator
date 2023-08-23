import Component from "../Component.js";

//last four inputs are for addresses
class MUX16 extends Component
{
    constructor()
    {
        super("MUX16", [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0], [0], 100, "rgba(64, 78, 128, 255)");
        this.size.y = 340;
    }

    isInputAddress(index)
    {
        if(index >= 16)
        {
            return true;
        }
        return false;
    }

    updateOutputs()
    {
        let addressSum = 0;
        let multiplier = 1;
        for(let i=19; i>=16;i--)
        {
            addressSum += this.inputs[i] * multiplier;
            multiplier *= 2;
        }
        console.log(addressSum);
        this.outputs[0] = this.inputs[addressSum];
    }

    highlightConnectionPoint(context, cameraPosition, zoom, isInput, index)
    {
        let realX = (this.position.x - cameraPosition.x) * zoom;
        let realY = (this.position.y - cameraPosition.y) * zoom;
        context.fillStyle = "rgba(255, 255, 0, 255)";

        console.log(realX, realY);
        if(isInput && !this.isInputAddress(index))
        {
            context.beginPath();
            context.arc(realX + 4*zoom, realY + (index*20 + 10)*zoom, 8*zoom, 0, 2 * Math.PI);
            context.fill();

        }
        else if(isInput && this.isInputAddress(index))
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
        for(let i=0;i<4;i++)
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
        context.fillText(this.name, realX + (this.size.x/2)*zoom - (3 * this.name.length)*zoom, 
        realY +  this.size.y/2*zoom);

        for(let i=0;i<4;i++)
        {
            context.fillText("A" + (3-i), realX + (i*20 + this.size.x/4 -5)*zoom, realY + (this.size.y + -20)*zoom);
        }

        
       
    }

    
    getInputPositionCenter(index, cameraPosition, zoom)
    {
        if(this.isInputAddress(index))
        {
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
        if(whichCircle != -1 && whichCircle <16)
        {
            return whichCircle;
        }
     
        for(let i=0;i<4;i++)
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

export default MUX16;