import Component from "../Component.js";

class NOT extends Component
{
    constructor()
    {
        super("NOT", [0], [1]);
    }

    updateOutputs()
    {
        this.outputs[0] = !this.inputs[0] + 0;
    }
}

export default NOT;