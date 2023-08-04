class Component 
{
    constructor(name, inputs, outputs, width = 60, color = "rgba(255, 0, 0, 255)")
    {
        this.name = name;

        this.inputs = inputs;
        this.outputs = outputs;

        this.inputComponents = []
        this.outputComponents = []

        for(let i=0;i<inputs.length;i++)
        {
            this.inputComponents.push(null);
        }

        for(let i=0;i<outputs.length;i++)
        {
            this.outputComponents.push([]);
        }

        let biggest = this.inputs.length > this.outputs.length ? this.inputs.length : this.outputs.length;
        this.position = {x: 0, y: 0};
        this.size = {x: width, y: biggest*20};

        this.color = color;
    }

    get getName()
    {
        return this.name;
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
            context.arc(this.position.x + 4, this.position.y + i*20 + 10, 8, 0, 2 * Math.PI);
            context.fill();
        }

        for(let i=0;i<this.outputs.length;i++)
        {
            context.fillStyle = "rgba(50, 50, 50, 255)";
            context.beginPath();
            context.arc(this.position.x -4 + this.size.x, this.position.y + i*20 + 10, 8, 0, 2 * Math.PI);
            context.fill();
        }

        context.fillStyle = "rgba(255, 255, 255, 255)";
        context.font = "12px serif";
        context.fillText(this.name, this.position.x + (this.size.x/2) - (3 * this.name.length), this.position.y + this.size.y/2);

        
       
    }

    getOutputPositionCenter(index)
    {
        return {x: this.position.x + this.size.x, y: this.position.y + index*20 + 10};
    }
    getInputPositionCenter(index)
    {
        return {x: this.position.x, y: this.position.y + index*20 + 10};
    }

    inWhichOutputIsPoint(point)
    {
        return this.inWhichCircleIsPoint(point, this.outputs, this.size.x);
    }

    inWhichInputIsPoint(point)
    {
        return this.inWhichCircleIsPoint(point, this.inputs, 0);
    }

    inWhichCircleIsPoint(point, arrayOfPorts, offsetX)
    {
        for(let i=0;i< arrayOfPorts.length;i++)
        {
            //center x, center y, radius, start angle, end angle
            //context.arc(this.position.x, this.position.y + i*20 + 10, 8, 0, 2 * Math.PI);

            let firstExpression = point.x - (this.position.x + offsetX);
            firstExpression *= firstExpression;

            let secondExpression = point.y - (this.position.y + i*20 + 10);
            secondExpression *= secondExpression;

            if(firstExpression + secondExpression <= 8*8)
            {
                return i;
            }
            //console.log("checking " + i);
        }

        return -1;
    }

    isPointInComponent(point)
    {
        if(point.x >= this.position.x && point.x <= this.position.x + this.size.x)
        {
            if(point.y >= this.position.y && point.y <= this.position.y + this.size.y)
            {
                return true;
            }
        }

        return false;
    }

    connectToInput(component, outputIndex, inputIndex, events)
    {
        this.inputComponents[inputIndex] = {component: component, outputID: outputIndex};
    }

    handleRightClick()
    {
        return false;
    }

    updateOutputs()
    {

    }

    deleteComponent()
    {
        for(let i=0;i<this.inputComponents.length;i++)
        {
            if(this.inputComponents[i] != null)
            {
                let thatComponent = this.inputComponents[i].component;
                let thatOutputID = this.inputComponents[i].outputID;

                thatComponent.disconnectOutput(this, thatOutputID);
            }
        }

        for(let i=0;i<this.outputComponents.length;i++)
        {
            for(let j=0;j<this.outputComponents[i].length;j++)
            {
                if(this.outputComponents[i][j] != null)
                {
                    let thatComponent = this.outputComponents[i][j].component;
                    let thatInputID = this.outputComponents[i][j].inputID;
    
                    thatComponent.disconnectInput(thatInputID);
                }
            }
           
        }
    }

    disconnectInput(inputID)
    {
        this.inputComponents[inputID] = null;
        this.inputs[inputID] = 0;
    }
    disconnectOutput(component, outputID)
    {
        for(let i=0;i<this.outputComponents[outputID].length;i++)
        {
            if(this.outputComponents[outputID][i].component == component)
            {
                this.outputComponents[outputID].splice(i, 1);
                break;
            }
        }
    }
}

export default Component;