import Component from "../Component.js";

class ANDx3 extends Component
{
    constructor()
    {
        super("ANDx3", [0,0,0], [0]);
    }

    updateOutputs()
    {
        //console.log("AND updated " + this.inputs[0] + " " + this.inputs[1] + " = " + (this.inputs[0] && this.inputs[1]));
        this.outputs[0] = this.inputs[0] && this.inputs[1] && this.inputs[2];
    }
}

export default ANDx3;