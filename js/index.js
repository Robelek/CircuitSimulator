import AND from "./components/basic/AND.js";
import INPUT from "./components/basic/INPUT.js";
import LED from "./components/basic/LED.js";
import NOT from "./components/basic/NOT.js";
import OR from "./components/basic/OR.js";
import NOR from "./components/basic/NOR.js";
import NAND from "./components/basic/NAND.js";
import BUFFER from "./components/basic/BUFFER.js";

let componentTemplates = [
    new INPUT(),
    new AND(),
    new LED(),
    new NOT(),
    new OR(),
    new NOR(),
    new NAND(),
];

let components = [];

let canvas = document.getElementById("canvas");
let context = canvas.getContext("2d");

let selectedComponent = null;
let selectedComponentOffset = {x: 0, y: 0};

let outputID = -1;

let currentMouseMode = "none";

let mousePosition = {x:0, y:0};

let events = [];

let connectionLines = [];

let currentLinePositions = [];



function drawConnectionLine(positionA, positionB)
{

        context.strokeStyle = "rgba(255, 255, 255, 255)";
        context.beginPath();
        context.moveTo(positionA.x, positionA.y);
        context.lineTo(positionB.x, positionB.y);
        context.stroke();
   

   
}

function drawComponents()
{
    for(let i=0;i<components.length;i++)
    {
        let component = components[i];
       // //console.log(component);
        component.draw(context);
       
    }

    for(let i=0;i<connectionLines.length;i++)
    {
        let thisLinePositions = connectionLines[i].linePositions;

        if(thisLinePositions.length > 0)
        {
            let firstPos = connectionLines[i].outputComponent.getOutputPositionCenter(connectionLines[i].outputID);

            drawConnectionLine(firstPos, thisLinePositions[0]);
            for(let j=0;j<thisLinePositions.length - 1;j++)
            {
                drawConnectionLine(thisLinePositions[j], thisLinePositions[j+1]);
            }

            drawConnectionLine(thisLinePositions[thisLinePositions.length - 1], connectionLines[i].inputComponent.getInputPositionCenter(connectionLines[i].inputID));
        }
        else
        {
            drawConnectionLine(connectionLines[i].outputComponent.getOutputPositionCenter(connectionLines[i].outputID), connectionLines[i].inputComponent.getInputPositionCenter(connectionLines[i].inputID));
        }
      
       
    }

    if(currentMouseMode == "connectOutput" && selectedComponent != null)
    {

            let firstPos = selectedComponent.getOutputPositionCenter(outputID);

            if(currentLinePositions.length > 0)
            {
                drawConnectionLine(firstPos, currentLinePositions[0]);
                for(let j=0;j<currentLinePositions.length - 1;j++)
                {
                    drawConnectionLine(currentLinePositions[j], currentLinePositions[j+1]);
                }
                drawConnectionLine(currentLinePositions[currentLinePositions.length - 1], mousePosition);
            }
            else
            {
                drawConnectionLine(firstPos, mousePosition);
            }
           

    }


}

function handleEvents()
{
    let previousEvents = events;
    events = [];

    for(let i=0;i<previousEvents.length;i++)
    {
        console.log(previousEvents[i].type);
        if(previousEvents[i].type == "connected")
        {
            let component = previousEvents[i].component;

            for(let j=0;j<component.inputs.length;j++)
            {
                if(component.inputComponents[j] === null)
                {
                    continue;
                }
                
                let outputID = component.inputComponents[j].outputID;
                let value =  component.inputComponents[j].component.outputs[outputID];

                component.inputs[j] = value;
            }

            component.updateOutputs();
            events.push({type: "valueChanged", component: component});
        }
        else if(previousEvents[i].type == "valueChanged")
        {

            let component = previousEvents[i].component;

            component.updateOutputs();

            for(let j=0;j<component.outputs.length;j++)
            {
                if(component.outputComponents[j] === null)
                {
                    continue;
                }
                let inputID = component.outputComponents[j].inputID;

                let value =  component.outputs[j];

                component.outputComponents[j].component.inputs[inputID] = value;

                events.push({type: "valueChanged", component: component.outputComponents[j].component});
            }

          
        }
        
        
    }

}

window.onload = function()
{
    let componentList = document.getElementsByClassName("componentList")[0];
    
    for(let i=0;i<componentTemplates.length;i++)
    {
        let component = componentTemplates[i];
        
        let componentDiv = document.createElement("div");
        componentDiv.classList.add("component");
        componentDiv.innerText = component.getName;

        componentDiv.setAttribute('draggable', true);

        componentDiv.addEventListener('dragstart', function(e)
        {
            componentDiv.classList.add("dragged");
        });

        componentDiv.addEventListener('dragend', function(e)
        {
            componentDiv.classList.remove("dragged");
        });

        componentDiv.id = i;

        componentList.appendChild(componentDiv);
    }

    canvas.addEventListener('drop', function(e)
    {
        //console.log(e);
        let currentlyDragged = document.getElementsByClassName("dragged")[0];
        let newObject = eval("new " + componentTemplates[currentlyDragged.id].name + "()");

        newObject.position = {x: e.offsetX, y: e.offsetY};

        components.push(newObject);
    });

    canvas.addEventListener('dragover', function(e)
    {
        e.preventDefault();
    });

    
    setInterval(function()
    {
        context.clearRect(0, 0, canvas.width, canvas.height);
        drawComponents();
        handleEvents();
    } 
    , 1000/60);
}




function toggleSidebar()
{
    let sidebarDiv = document.getElementsByClassName("sidebar")[0];
    sidebarDiv.classList.toggle("hidden");

    let arrow = sidebarDiv.getElementsByClassName("arrow")[0];
    arrow.classList.toggle("hidden");
}

window.toggleSidebar = toggleSidebar;

canvas.addEventListener('mousedown', function(e)
{
    let point = {x: e.offsetX, y: e.offsetY};

    if(e.shiftKey)
    {
       console.log({x: e.offsetX, y: e.offsetY});

       for(let i=0;i<components.length;i++)
       {
              if(components[i].isPointInComponent(point))
              {
                console.log(components[i]);
              }
       }

       return;
    }

    if(e.button == 2)
    {
        //right mouse button
        if(currentMouseMode == "connectOutput")
        {
            if(currentLinePositions.length > 1)
            {
                currentLinePositions.pop();
            }
            else
            {
                currentLinePositions = [];
                currentMouseMode = "none";
                selectedComponent = null;
    
            }
        }
        else
        {

            for(let i=0;i<components.length;i++)
            {
                if(components[i].isPointInComponent(point))
                {
                    let result = components[i].handleRightClick();
                    if(result)
                    {
                        if(result == "valueChanged")
                        {
                            events.push({type: "valueChanged", component: components[i]});
                        }
                        return;
                    }
                }
            }
        }
        
        return;
    }

    for(let i=0;i<components.length;i++)
    {
      
        let inWhichOutput = components[i].inWhichOutputIsPoint(point);

        if(inWhichOutput != -1 && currentMouseMode == "none")
        {
            selectedComponent = components[i];
            currentMouseMode = "connectOutput";
            outputID = inWhichOutput;
            //currentLinePositions.push(components[i].getOutputPositionCenter(inWhichOutput));
            return;
        }

        if(components[i].isPointInComponent(point))
        {
            if(currentMouseMode == "none" && selectedComponent == null)
            {
                selectedComponent = components[i];
                selectedComponentOffset = {x: e.offsetX - components[i].position.x, y: e.offsetY - components[i].position.y};
                currentMouseMode = "moveComponent";
                return;
            }

            if(selectedComponent != null && currentMouseMode == "moveComponent")
            {
                selectedComponent = null;
                currentMouseMode = "none";
                return;
            }
            
            if(currentMouseMode == "connectOutput" && selectedComponent != null)
            {
                let inWhichInput = components[i].inWhichInputIsPoint(point);
              
                components[i].connectToInput(selectedComponent, outputID, inWhichInput, events);

                selectedComponent.outputComponents[outputID] = {component:components[i], inputID: inWhichInput};
                

                console.log()
                connectionLines.push({linePositions: currentLinePositions, 
                    outputComponent: selectedComponent, 
                    inputComponent: components[i],
                    outputID: outputID,
                    inputID: inWhichInput});
    
                console.log(connectionLines);
    

                //connection!
                events.push(
                    {
                        type: "connected",
                        component: components[i],
                    });


                selectedComponent = null;
                currentLinePositions = [];
                currentMouseMode = "none";
                break;
        
            }
            
        }

      
    }

    if(e.button == 0 && currentMouseMode == "connectOutput" && selectedComponent != null)
    {
        //left mouse button
        currentLinePositions.push({x: e.offsetX, y: e.offsetY});
    }
  
  
});

document.addEventListener('mousemove', function(e)
{
    mousePosition = {x: e.offsetX, y: e.offsetY};
});

canvas.addEventListener('mousemove', function(e)
{
    ////console.log(e.offsetX + " " + e.offsetY);
    if(selectedComponent != null)
    {
        if(currentMouseMode == "moveComponent")
        {
            selectedComponent.position = {x: e.offsetX - selectedComponentOffset.x, y: e.offsetY - selectedComponentOffset.y};
        }
        
    }
});

window.addEventListener('keydown', function(event) {
    let key = event.key;
    if(key == "Delete")
    {
        console.log("delete");

        let componentDeleted = null;
        for(let i=0;i<components.length;i++)
        {
            if(components[i].isPointInComponent(mousePosition))
            {
                componentDeleted = components[i];
                components[i].deleteComponent();
                components.splice(i, 1);
                break;
            }
        }

        for(let i=0;i<connectionLines.length;i++)
        {
            //console.log(connectionLines[i]);
            if(connectionLines[i].inputComponent == componentDeleted || connectionLines[i].outputComponent == componentDeleted)
            {
                if(connectionLines[i].inputComponent == componentDeleted)
                {
                    events.push({type: "valueChanged", component: connectionLines[i].outputComponent});
                }
                else
                {
                    events.push({type: "valueChanged", component: connectionLines[i].inputComponent});
                }

                connectionLines.splice(i, 1);
                if(i>0)
                {
                    i--;
                }

               

            }
        }

    }
});



//disabling right click menu
window.addEventListener("contextmenu", (e) => {
    e.preventDefault();
});



