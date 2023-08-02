class Component 
{
    constructor(name, inputs, outputs)
    {
        this.name = name;
        this.inputs = inputs;
        this.outputs = outputs;
    }

    get getName()
    {
        return this.name;
    }
}

export default Component;