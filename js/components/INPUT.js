import Component from "./Component.js";

class INPUT extends Component
{
    constructor()
    {
        super("INPUT", [], [0], 30, "rgba(0, 100, 100, 255)");

        this.state = 0;
    }

   
    draw(context)
    {
        context.fillStyle = this.color;
        context.beginPath();
        //console.log(this.size);
        context.rect(this.position.x, this.position.y, this.size.x, this.size.y);
        context.fill();

        for(let i=0;i<this.inputs.length;i++)
        {
            context.fillStyle = "rgba(50, 50, 50, 255)";
            context.beginPath();
            context.arc(this.position.x, this.position.y + i*20 + 10, 8, 0, 2 * Math.PI);
            context.fill();
        }

        for(let i=0;i<this.outputs.length;i++)
        {
            context.fillStyle = "rgba(50, 50, 50, 255)";
            context.beginPath();
            context.arc(this.position.x + this.size.x, this.position.y + i*20 + 10, 8, 0, 2 * Math.PI);
            context.fill();
        }

        context.fillStyle = "rgba(255, 255, 255, 255)";
        context.font = "12px serif";
        context.fillText(this.state, this.position.x + (this.size.x/2) - (3 * this.name.length), this.position.y + this.size.y/2);

        
       
    }

    handleRightClick()
    {
        this.state = !this.state + 0;
        return true;
    }
}

export default INPUT;