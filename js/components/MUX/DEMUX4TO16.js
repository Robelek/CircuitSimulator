import Component from "../Component.js";

//last four inputs are for addresses
class DEMUX4TO16 extends Component
{
    constructor()
    {
        super("DEMUX4TO16", [0,0,0,0], [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0], 160, "rgba(64, 78, 128, 255)");
        this.size.y = 340;

    }

    updateOutputs()
    {
        for(let i=0;i<this.outputs.length;i++)
        {
            this.outputs[i] = 0;
        }

        let addressSum = 0;
        let multiplier = 1;
        for(let i=0; i<this.inputs.length;i++)
        {
            addressSum += this.inputs[i] * multiplier;
            multiplier *= 2;
        }
        this.outputs[addressSum] = 1;
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
        for(let i=0;i<this.inputs.length;i++)
        {
            context.beginPath();
            context.arc(realX + 4*zoom, realY + (i*20 + 10)*zoom, 8*zoom, 0, 2 * Math.PI);
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

        for(let i=0;i<this.inputs.length;i++)
        {
            context.fillText("A" + i, realX + (2 * this.name.length)*zoom, 
            realY + (i*20 + 15)*zoom);
        }

        for(let i=0;i<this.outputs.length;i++)
        {
            context.fillText(i, realX +  (this.size.x - 2 * this.name.length)*zoom, 
            realY + (i*20 + 15)*zoom);
        }
        
       
    }

}

export default DEMUX4TO16;