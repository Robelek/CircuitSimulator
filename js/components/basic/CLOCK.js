import Component from "../Component.js";

class CLOCK extends Component
{
    constructor()
    {
        super("CLOCK", [], [0], 50, "rgba(0, 100, 200, 255)");
        this.enabled = false;

        this.addEvent = null;
        this.intervalID = -1;

        this.frequency = 1000;
    }

    handleRightClick()
    {
        this.enabled = !this.enabled;

        if(this.enabled)
        {
            this.intervalID = setInterval(() => {
                this.outputs[0] = !this.outputs[0] + 0;
                if(this.addEvent!=null)
                {
                    this.addEvent();
                }
               
            }, this.frequency);
        }
        else
        {
            clearInterval(this.intervalID);
        }

        return true;
    }

    deleteComponent()
    {
       
        if(this.enabled)
        {
            this.enabled = false;
            clearInterval(this.intervalID)
        }
       
        super.deleteComponent();
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

        context.fillText(this.outputs[0] + 0 + " CLK", realX + (this.size.x/2)*zoom - (3 * this.name.length)*zoom,
         realY +  this.size.y/2*zoom);

        
       
    }

}

export default CLOCK;