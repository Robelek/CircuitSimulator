import Component from "../Component.js";

class AND extends Component
{
    constructor()
    {
        super("AND", [0,0], [0]);
    }

    updateOutputs()
    {
        //console.log("AND updated " + this.inputs[0] + " " + this.inputs[1] + " = " + (this.inputs[0] && this.inputs[1]));
        this.outputs[0] = this.inputs[0] && this.inputs[1];
    }
}

export default AND;