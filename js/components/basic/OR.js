import Component from "../Component.js";

class OR extends Component
{
    constructor()
    {
        super("OR", [0,0], [0]);
    }

    updateOutputs()
    {
        this.outputs[0] = this.inputs[0] || this.inputs[1];
    }
}

export default OR;