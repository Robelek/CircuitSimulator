import Component from "../Component.js";

class NOR extends Component
{
    constructor()
    {
        super("NOR", [0,0], [0]);
    }

    updateOutputs()
    {
        this.outputs[0] = !(this.inputs[0] || this.inputs[1]);
    }
}

export default NOR;