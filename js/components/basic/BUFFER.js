import Component from "../Component.js";

class BUFFER extends Component
{
    constructor()
    {
        super("BUFFER", [0], [1]);
    }

    updateOutputs()
    {
        this.outputs[0] = this.inputs[0] + 0;
    }
}

export default BUFFER;