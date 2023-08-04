import Component from "../Component.js";

class NAND extends Component
{
    constructor()
    {
        super("NAND", [0,0], [0]);
    }

    updateOutputs()
    {
        this.outputs[0] = !(this.inputs[0] && this.inputs[1]);
    }
}

export default NAND;