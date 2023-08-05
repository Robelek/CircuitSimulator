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

    draw(context, cameraPosition)
    {
        context.fillStyle = this.color;
        context.beginPath();
        //console.log(this.size);
        context.rect(this.position.x - cameraPosition.x, this.position.y - cameraPosition.y, this.size.x, this.size.y);
        context.fill();

        for(let i=0;i<this.outputs.length;i++)
        {
            context.fillStyle = "rgba(50, 50, 50, 255)";
            context.beginPath();
            context.arc(this.position.x - cameraPosition.x - 4 + this.size.x, this.position.y - cameraPosition.y + i*20 + 10, 8, 0, 2 * Math.PI);
            context.fill();
        }

        context.fillStyle = "rgba(255, 255, 255, 255)";
        context.font = "12px serif";
        context.fillText(this.outputs[0] + 0 + " CLK", this.position.x  - cameraPosition.x + (this.size.x/2) - (3 * this.name.length),
         this.position.y - cameraPosition.y + this.size.y/2);

        
       
    }

}

export default CLOCK;