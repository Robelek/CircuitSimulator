import Component from "../Component.js";

class INPUT extends Component
{
    constructor()
    {
        super("INPUT", [], [0], 30, "rgba(0, 100, 100, 255)");
    }

   
    draw(context, cameraPosition, zoom)
    {
        context.fillStyle = this.color;
        context.beginPath();
        //console.log(this.size);

        let realX = (this.position.x - cameraPosition.x)*zoom;
        let realY = (this.position.y - cameraPosition.y)*zoom;

        context.rect(realX, realY, this.size.x*zoom, this.size.y*zoom);
        context.fill();

        for(let i=0;i<this.outputs.length;i++)
        {
            context.fillStyle = "rgba(50, 50, 50, 255)";
            context.beginPath();
            context.arc(realX - 4*zoom + this.size.x*zoom, realY + (i*20 + 10)*zoom, 8*zoom, 0, 2 * Math.PI);
            context.fill();
        }

        context.fillStyle = "rgba(255, 255, 255, 255)";

        let fontSize = Math.floor(12*zoom);
        context.font = `${fontSize}px serif`;

        context.fillText(this.outputs[0] + 0, realX+ (this.size.x/2)*zoom - (3 * this.name.length)*zoom,
         realY + this.size.y/2*zoom);

        
       
    }

    handleRightClick()
    {
        this.outputs[0] = !this.outputs[0] + 0;
        return "valueChanged";
    }

}

export default INPUT;