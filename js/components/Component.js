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

    draw(context, cameraPosition, zoom)
    {
        context.fillStyle = this.color;
        context.beginPath();
        //console.log(this.size);

        let realX = (this.position.x - cameraPosition.x) * zoom;
        let realY = (this.position.y - cameraPosition.y) * zoom;

        context.rect(realX, realY, this.size.x*zoom, this.size.y*zoom);
        context.fill();

        for(let i=0;i<this.inputs.length;i++)
        {
            context.fillStyle = "rgba(50, 50, 50, 255)";
            context.beginPath();
            context.arc(realX + 4*zoom, realY + (i*20 + 10)*zoom, 8*zoom, 0, 2 * Math.PI);
            context.fill();
        }

        for(let i=0;i<this.outputs.length;i++)
        {
            context.fillStyle = "rgba(50, 50, 50, 255)";
            context.beginPath();
            context.arc(realX -4*zoom + this.size.x*zoom, realY + (i*20 + 10)*zoom, 8*zoom, 0, 2 * Math.PI);
            context.fill();
        }

        context.fillStyle = "rgba(255, 255, 255, 255)";

        let fontSize = Math.floor(12*zoom);
        context.font = `${fontSize}px serif`;
        context.fillText(this.name, realX + (this.size.x/2)*zoom - (3 * this.name.length)*zoom, 
        realY +  this.size.y/2*zoom);

        
       
    }

    getOutputPositionCenter(index, cameraPosition, zoom)
    {
        return {x: (this.position.x + this.size.x)*zoom, y: (this.position.y + index*20 + 10)*zoom};
    }
    getInputPositionCenter(index, cameraPosition, zoom)
    {
        return {x:(this.position.x)*zoom, y:( this.position.y + index*20 + 10)*zoom};
    }

    inWhichOutputIsPoint(point, cameraPosition, zoom)
    {
        return this.inWhichCircleIsPoint(point, this.outputs, this.size.x, cameraPosition, zoom);
    }

    inWhichInputIsPoint(point, cameraPosition, zoom)
    {
        return this.inWhichCircleIsPoint(point, this.inputs, 0, cameraPosition, zoom);
    }

    inWhichCircleIsPoint(point, arrayOfPorts, offsetX, cameraPosition, zoom)
    {
        for(let i=0;i< arrayOfPorts.length;i++)
        {
            //center x, center y, radius, start angle, end angle
            //context.arc(this.position.x, this.position.y + i*20 + 10, 8, 0, 2 * Math.PI);

            let firstExpression = point.x - (this.position.x - cameraPosition.x + offsetX)*zoom;
            firstExpression *= firstExpression;

            let secondExpression = point.y - (this.position.y - cameraPosition.y + i*20 + 10)*zoom;
            secondExpression *= secondExpression;

            if(firstExpression + secondExpression <= 8*zoom*8*zoom)
            {
                return i;
            }
            //console.log("checking " + i);
        }

        return -1;
    }

    isPointInComponent(point, cameraPosition, zoom)
    {
        if(point.x >= (this.position.x  - cameraPosition.x)*zoom && point.x <= (this.position.x - cameraPosition.x + this.size.x)*zoom)
        {
            if(point.y >= (this.position.y - cameraPosition.y*zoom) && point.y <= (this.position.y + this.size.y - cameraPosition.y*zoom))
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

    getDataToSave(components)
    {
        let result = "";

        result += `${this.position.x} ${this.position.y}`;
        result += " inputs:";
        for(let j=0; j<this.inputs.length;j++)
        {
            result += ` ${this.inputs[j] + 0}`;
        }

        result += " outputs:";
        for(let j=0; j<this.outputs.length;j++)
        {
            result += ` ${this.outputs[j] + 0}`;
        }

        return result;

    }
}

export default Component;