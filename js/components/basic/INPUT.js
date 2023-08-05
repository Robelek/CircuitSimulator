import Component from "../Component.js";

class INPUT extends Component
{
    constructor()
    {
        super("INPUT", [], [0], 30, "rgba(0, 100, 100, 255)");
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
        context.fillText(this.outputs[0] + 0, this.position.x - cameraPosition.x + (this.size.x/2) - (3 * this.name.length),
         this.position.y - cameraPosition.y + this.size.y/2);

        
       
    }

    handleRightClick()
    {
        this.outputs[0] = !this.outputs[0] + 0;
        return "valueChanged";
    }

}

export default INPUT;