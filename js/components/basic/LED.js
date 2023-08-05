import Component from "../Component.js";

class LED extends Component
{
    constructor()
    {
        super("LED", [0], [], 30, "rgba(20, 20, 20, 255)");
        this.radius = 16;

        this.turnedOffColor = "rgba(20, 20, 20, 255)";
        this.turnedOnColor = "rgba(255, 0, 0, 255)";
    }

   
    draw(context, cameraPosition)
    {
     

        context.fillStyle = "rgba(200,200,200,255)";
        context.beginPath();
        context.arc(this.position.x - cameraPosition.x + this.size.x/2, this.position.y - cameraPosition.y + this.size.y /2, this.radius+2, 0, 2 * Math.PI);
        context.fill();

        if(this.inputs[0] == 1)
        {
            context.fillStyle = this.turnedOnColor;
        }
        else
        {
            context.fillStyle = this.turnedOffColor;
        }
       
        context.beginPath();
        context.arc(this.position.x  - cameraPosition.x + this.size.x/2, this.position.y -cameraPosition.y + this.size.y /2, this.radius, 0, 2 * Math.PI);
        context.fill();

        for(let i=0;i<this.inputs.length;i++)
        {
            context.fillStyle = "rgba(50, 50, 50, 255)";
            context.beginPath();
            context.arc(this.position.x - cameraPosition.x + 4, this.position.y -cameraPosition.y + i*20 + 10, 8, 0, 2 * Math.PI);
            context.fill();
        }

        
       
    }

  
}

export default LED;