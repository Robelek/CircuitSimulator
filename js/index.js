import AND from "./components/basic/AND.js";
import INPUT from "./components/basic/INPUT.js";
import LED from "./components/basic/LED.js";
import NOT from "./components/basic/NOT.js";
import OR from "./components/basic/OR.js";
import NOR from "./components/basic/NOR.js";
import NAND from "./components/basic/NAND.js";
import BUFFER from "./components/basic/BUFFER.js";
import CLOCK from "./components/basic/CLOCK.js";
import ANDx3 from "./components/basic/ANDx3.js";
import XOR from "./components/basic/XOR.js";
import LABEL from "./components/misc/LABEL.js";
import MUX16 from "./components/MUX/MUX16.js";
import DEMUX4TO16 from "./components/MUX/DEMUX4TO16.js";
import PIPO8BITREGISTER from "./components/registers/PIPO8BITREGISTER.js";


let events = [];

let componentTemplates = [
    new INPUT(),
    new AND(),
    new ANDx3(),
    new LED(),
    new NOT(),
    new OR(),
    new NOR(),
    new NAND(),
    new BUFFER(),
    new CLOCK(events),
    new XOR(),
    new LABEL(),
    new MUX16(),
    new DEMUX4TO16(),
    new PIPO8BITREGISTER(),
];

let components = [];

let canvas = document.getElementById("canvas");
let context = canvas.getContext("2d");

let selectedComponent = null;
let selectedComponentOffset = {x: 0, y: 0};



let outputID = -1;

let currentMouseMode = "none";

let mousePosition = {x:0, y:0};



let connectionLines = [];

let currentLinePositions = [];

let cameraPosition = {x: 0, y: 0};
let scrollAmount = 5;

let zoom = 1;
let zoomAmount = 0.001;
let targetZoom = 1;

let boxSelectStart = null;
let boxSelectComponentsOffset = [];
let componentsInBoxSelect = [];
let connectionLinesInBoxSelect = [];
let initialConnectionLinesInBoxSelect = [];

let cameraPositionDisplay = null;
let contextMenuVisible = false;
const contextMenu = document.getElementsByClassName("contextMenu")[0];


let copiedComponents = [];
let copiedComponentsOffsets = [];
let copiedConnectionLines = [];

let connectionPointMouseOver = null;
//formatting will be:
//{component: component, isInput: isInput, index: index}

let keysPressed = {
    "ArrowLeft": false,
    "ArrowRight": false,
    "ArrowUp": false,
    "ArrowDown": false,
    "Shift": false,
}


function abs(number)
{
    if(number < 0)
    {
        return -number;
    }

    return number;
}

function drawConnectionLine(positionA, positionB) {
    context.strokeStyle = "rgba(255, 255, 255, 255)";
    context.beginPath();

    const offset = {
        x: cameraPosition.x * zoom,
        y: cameraPosition.y * zoom
    };

    context.moveTo((positionA.x - offset.x), (positionA.y - offset.y));
    context.lineTo((positionB.x - offset.x), (positionB.y - offset.y));
    context.stroke();
}

function drawComponents()
{
    
    for(let i=0;i<components.length;i++)
    {
        let component = components[i];
       // ////console.log(component);
        component.draw(context, cameraPosition, zoom);
       
    }

    for(let i=0;i<connectionLines.length;i++)
    {
        let thisLinePositions = connectionLines[i].linePositions;

        if(thisLinePositions.length > 0)
        {
            let firstPos = connectionLines[i].outputComponent.getOutputPositionCenter(connectionLines[i].outputID, cameraPosition, zoom);
            drawConnectionLine(firstPos, {x: thisLinePositions[0].x*zoom ,
                y: thisLinePositions[0].y*zoom});


            for(let j=0;j<thisLinePositions.length - 1;j++)
            {
                drawConnectionLine({x: thisLinePositions[j].x*zoom ,
                    y: thisLinePositions[j].y*zoom}, 
                    {x: thisLinePositions[j+1].x*zoom ,
                        y: thisLinePositions[j+1].y*zoom});
            }

            drawConnectionLine({x: thisLinePositions[thisLinePositions.length - 1].x*zoom ,
                y: thisLinePositions[thisLinePositions.length - 1].y*zoom}, 
                connectionLines[i].inputComponent.getInputPositionCenter(connectionLines[i].inputID, cameraPosition, zoom));
        }
        else
        {
            drawConnectionLine(connectionLines[i].outputComponent.getOutputPositionCenter(connectionLines[i].outputID, cameraPosition, zoom), 
            connectionLines[i].inputComponent.getInputPositionCenter(connectionLines[i].inputID, cameraPosition, zoom));
        }
      
       
    }

    let connectionMousePos = {x: mousePosition.x + cameraPosition.x*zoom, y: mousePosition.y + cameraPosition.y*zoom};
    if(keysPressed["Shift"] && currentMouseMode == "connectOutput")
    {
        let previousPos = null;
        if(currentLinePositions.length>0)
        {
            previousPos = currentLinePositions[currentLinePositions.length - 1];
        }
        else
        {
            previousPos = selectedComponent.getOutputPositionCenter(outputID, cameraPosition, zoom);
        }

        if(previousPos == null)
        {
            console.log("[ERROR] PREVIOUS POS NULL");
        }

        if(abs(connectionMousePos.x - previousPos.x) > abs(connectionMousePos.y - previousPos.y))
        {
            connectionMousePos = {x: connectionMousePos.x, y: previousPos.y};
        }
        else
        {
            connectionMousePos = {x: previousPos.x, y: connectionMousePos.y};
        }
        
    }
    
    if(currentMouseMode == "connectOutput" && selectedComponent != null)
    {

            let firstPos = selectedComponent.getOutputPositionCenter(outputID, cameraPosition, zoom);

            if(currentLinePositions.length > 0)
            {
                drawConnectionLine(firstPos, 
                    {x: currentLinePositions[0].x*zoom ,
                        y: currentLinePositions[0].y*zoom});
                for(let j=0;j<currentLinePositions.length - 1;j++)
                {
                    drawConnectionLine( 
                        {x: currentLinePositions[j].x*zoom ,
                        y: currentLinePositions[j].y*zoom},
                        {x: currentLinePositions[j+1].x*zoom ,
                            y: currentLinePositions[j+1].y*zoom});
                }
                
                drawConnectionLine(
                    {x: currentLinePositions[currentLinePositions.length - 1].x*zoom ,
                     y: currentLinePositions[currentLinePositions.length - 1].y*zoom} ,
                    {x: connectionMousePos.x, y: connectionMousePos.y});
            }
            else
            {
                drawConnectionLine(firstPos, 
                    {x: connectionMousePos.x,
                         y: connectionMousePos.y});
            }
           

    }

    if(boxSelectStart != null)
    {
        context.strokeStyle = "rgba(0, 255, 0, 255)";
        context.beginPath();
        context.rect(boxSelectStart.x, boxSelectStart.y, mousePosition.x - boxSelectStart.x, mousePosition.y - boxSelectStart.y);
        context.stroke();
    }

    if(componentsInBoxSelect.length > 0)
    {
        context.strokeStyle = "rgba(0, 255, 0, 255)";
        context.lineWidth = 2;

        for(let i=0;i<componentsInBoxSelect.length;i++)
        {
           
            context.beginPath();
            context.rect(componentsInBoxSelect[i].position.x*zoom - cameraPosition.x*zoom, 
                componentsInBoxSelect[i].position.y*zoom - cameraPosition.y*zoom, 
                componentsInBoxSelect[i].size.x*zoom, 
                componentsInBoxSelect[i].size.y*zoom);
            context.stroke();

        }

        context.lineWidth = 1;
    }


    for(let i=0;i<connectionLinesInBoxSelect.length;i++)
    {
        let thisLinePositions = connectionLinesInBoxSelect[i].linePositions;

        if(thisLinePositions.length > 0)
        {
            let firstPos = connectionLinesInBoxSelect[i].outputComponent.getOutputPositionCenter(connectionLinesInBoxSelect[i].outputID, cameraPosition, zoom);
            drawConnectionLine(firstPos, {x: thisLinePositions[0].x*zoom ,
                y: thisLinePositions[0].y*zoom});


            for(let j=0;j<thisLinePositions.length - 1;j++)
            {
                drawConnectionLine({x: thisLinePositions[j].x*zoom ,
                    y: thisLinePositions[j].y*zoom}, 
                    {x: thisLinePositions[j+1].x*zoom ,
                        y: thisLinePositions[j+1].y*zoom});
            }

            drawConnectionLine({x: thisLinePositions[thisLinePositions.length - 1].x*zoom ,
                y: thisLinePositions[thisLinePositions.length - 1].y*zoom}, 
                connectionLinesInBoxSelect[i].inputComponent.getInputPositionCenter(connectionLinesInBoxSelect[i].inputID, cameraPosition, zoom));
        }
        else
        {
            drawConnectionLine(connectionLinesInBoxSelect[i].outputComponent.getOutputPositionCenter(connectionLinesInBoxSelect[i].outputID, cameraPosition, zoom), 
            connectionLinesInBoxSelect[i].inputComponent.getInputPositionCenter(connectionLinesInBoxSelect[i].inputID, cameraPosition, zoom));
        }


    }

    if(connectionPointMouseOver != null)
    {
        let thatComponent = connectionPointMouseOver.component;
        thatComponent.highlightConnectionPoint(context, cameraPosition, zoom, connectionPointMouseOver.isInput, connectionPointMouseOver.index);
    }
}

function handleEvents()
{
    let previousEvents = events;
    events = [];

    for(let i=0;i<previousEvents.length;i++)
    {
        //console.log(previousEvents[i].type);
        // if(previousEvents[i].type == "connected")
        // {
        //     let component = previousEvents[i].component;

        //     for(let j=0;j<component.inputs.length;j++)
        //     {
        //         if(component.inputComponents[j] === null)
        //         {
        //             continue;
        //         }
                
        //         let outputID = component.inputComponents[j].outputID;
        //         let value =  component.inputComponents[j].component.outputs[outputID];

        //         component.inputs[j] = value;
        //     }

        //     component.updateOutputs();
        //     events.push({type: "valueChanged", component: component});
        // }

        // else if(previousEvents[i].type == "valueChanged")
        if(previousEvents[i].type == "connected" || (previousEvents[i].type == "valueChanged"))
        {
           

            let component = previousEvents[i].component;

            component.updateOutputs();

            for(let j=0;j<component.outputs.length;j++)
            {
                if(component.outputComponents[j] === null || component.outputComponents[j] === []) 
                {
                    continue;
                }

                for(let k=0;k<component.outputComponents[j].length;k++)
                {
                    let inputID = component.outputComponents[j][k].inputID;

                    let value =  component.outputs[j];
    
                    component.outputComponents[j][k].component.inputs[inputID] = value;
    
                 
                    let previouslyChanged = [];
                    
                    if(previousEvents[i].previouslyChanged !== undefined)
                    {
                        previouslyChanged = previousEvents[i].previouslyChanged;
                       
                    }

                    if(!previouslyChanged.includes(component.outputComponents[j][k].component))
                    {
                        previouslyChanged.push(component);
                        events.push({type: "valueChanged", component: component.outputComponents[j][k].component, previouslyChanged: previouslyChanged});
                    }
                   
                
                }
                
               
            }

          
        }
        
        
    }

}

function updatePositionDisplay()
{
    cameraPositionDisplay.innerText = `Camera position: (${cameraPosition.x.toFixed(2)}, ${cameraPosition.y.toFixed(2)} | Zoom: ${zoom.toFixed(2)})`;
}

//https://en.wikipedia.org/wiki/Linear_interpolation
function lerp(startValue, endValue, t) {
    return (1 - t) * startValue + t * endValue;
}

function updateZoom()
{
    const canvasCenter = {
        x: canvas.width / 2 / zoom + cameraPosition.x,
        y: canvas.height / 2 / zoom + cameraPosition.y
    };
    
    zoom = lerp(zoom, targetZoom, 0.1);
    
    cameraPosition.x = canvasCenter.x - canvas.width / 2 / zoom;
    cameraPosition.y = canvasCenter.y - canvas.height / 2 / zoom;

    if(selectedComponent != null)
    {
        if(currentMouseMode == "moveComponent")
        {
            selectedComponent.position = {x: mousePosition.x/zoom + cameraPosition.x - selectedComponentOffset.x, y: mousePosition.y/zoom + cameraPosition.y - selectedComponentOffset.y};
        }
        
    }
}

window.onload = function()
{

    cameraPositionDisplay = document.getElementById("cameraPositionDisplay");
    updatePositionDisplay();

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
        ////console.log(e);
        let currentlyDragged = document.getElementsByClassName("dragged")[0];
        let newObject = eval("new " + componentTemplates[currentlyDragged.id].name + "()");

        if(newObject instanceof CLOCK)
        {
            newObject.addEvent = () =>
            {
                events.push({type: "valueChanged", component: newObject});
            }
        }

        newObject.position = {x: e.offsetX/zoom + cameraPosition.x, y: e.offsetY/zoom + cameraPosition.y};

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
        updateZoom();
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
    if(contextMenuVisible)
    {
        contextMenu.classList.toggle("hidden");
        contextMenu.style.left = "-200vw";
        contextMenuVisible = false;
    }

    let point = {x: e.offsetX, y: e.offsetY};

    if(e.shiftKey)
    {
       //console.log(`${e.offsetX} ${e.offsetY}, camera position: ${cameraPosition.x} ${cameraPosition.y}`);
   

       for(let i=0;i<components.length;i++)
       {
              if(components[i].isPointInComponent(point, cameraPosition, zoom))
              {
                console.log(components[i]);
              }
       }

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
            return true;
        }
        else
        {

            for(let i=0;i<components.length;i++)
            {
                if(components[i].isPointInComponent(point, cameraPosition, zoom))
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

        if(!contextMenuVisible)
        {
            contextMenu.style.left = e.clientX + "px";
            contextMenu.style.top = e.clientY + "px";
        
            contextMenu.classList.toggle("hidden");
            contextMenuVisible = true;

        }
        
        return;
    }

    for(let i=0;i<components.length;i++)
    {
      
        let inWhichOutput = components[i].inWhichOutputIsPoint(point, cameraPosition, zoom);

        if(inWhichOutput != -1 && currentMouseMode == "none")
        {
            currentLinePositions = [];
            selectedComponent = components[i];
            currentMouseMode = "connectOutput";
            outputID = inWhichOutput;
            return;
        }

        let inWhichInput = components[i].inWhichInputIsPoint(point, cameraPosition, zoom);
        if(inWhichInput != -1 && currentMouseMode == "none")
        {
            if(components[i].inputComponents[inWhichInput].component != null)
            {
                let connectionIndex = connectionLines.findIndex((connectionLine) =>
                {
                    if(connectionLine.inputComponent == components[i] && connectionLine.inputID == inWhichInput)
                    {
                        return true;
                    }
                })

                currentLinePositions = connectionLines[connectionIndex].linePositions;
                selectedComponent = connectionLines[connectionIndex].outputComponent;
                currentMouseMode = "connectOutput";
                outputID = connectionLines[connectionIndex].outputID;

                connectionLines[connectionIndex].outputComponent.outputComponents[connectionLines[connectionIndex].outputID].component = null;
                components[i].inputComponents[inWhichInput].component = null;
                
                connectionLines.splice(connectionIndex, 1);

                
            }
            return;
        }

      
        
        if(components[i].isPointInComponent(point, cameraPosition, zoom))
        {
            if(currentMouseMode == "none" && selectedComponent == null)
            {
                currentLinePositions = [];
                selectedComponent = components[i];
                selectedComponentOffset = {x: e.offsetX/zoom + cameraPosition.x - components[i].position.x, y: e.offsetY/zoom + cameraPosition.y - components[i].position.y};
                currentMouseMode = "moveComponent";
                return;
            }

            if(selectedComponent != null && currentMouseMode == "moveComponent")
            {
                currentLinePositions = [];
                selectedComponent = null;
                currentMouseMode = "none";
                return;
            }

            if(currentMouseMode == "connectOutput" && selectedComponent != null)
            {
                let inWhichInput = components[i].inWhichInputIsPoint(point, cameraPosition, zoom);
                
                if(inWhichInput != -1)
                {
                    //console.log("Hey!");
                    components[i].connectToInput(selectedComponent, outputID, inWhichInput, events);
    
    
                    selectedComponent.outputComponents[outputID].push({component:components[i], inputID: inWhichInput});
                    
    
                    //console.log()
                    connectionLines.push({linePositions: currentLinePositions, 
                        outputComponent: selectedComponent, 
                        inputComponent: components[i],
                        outputID: outputID,
                        inputID: inWhichInput});
        
                    //console.log(connectionLines);
        
    
                    //connection!
                    events.push(
                        {
                            type: "connected",
                            component: components[i],
                        });
    
    
                    selectedComponent = null;
                    currentLinePositions = [];
                    currentMouseMode = "none";
                    return;
            
                }
                
            }
            
            
            
        }

      
    }

    if(e.button == 0 && currentMouseMode == "connectOutput" && selectedComponent != null)
    {
        //left mouse button

        let connectionMousePos = {x:e.offsetX, y: e.offsetY};

        if(keysPressed["Shift"])
        {
            let previousPos = null;
            connectionMousePos = {x: e.offsetX, y: e.offsetY};
            //console.log(currentLinePositions);
            if(currentLinePositions.length>0)
            {
                previousPos = currentLinePositions[currentLinePositions.length - 1];
            }
            else
            {
                previousPos = selectedComponent.getOutputPositionCenter(outputID, cameraPosition, zoom)
            }


           ///
           if(abs(connectionMousePos.x - previousPos.x) > abs(connectionMousePos.y - previousPos.y))
           {
               connectionMousePos = {x: connectionMousePos.x, y: previousPos.y/zoom - cameraPosition.y};
           }
           else
           {
               connectionMousePos = {x: previousPos.x/zoom - cameraPosition.x, y: connectionMousePos.y};
           }
        }
       
        //console.log(connectionMousePos);
        currentLinePositions.push({x: connectionMousePos.x/zoom + cameraPosition.x, 
        y: connectionMousePos.y/zoom + cameraPosition.y});

    }
    else if(e.button == 0 && currentMouseMode == "none" && selectedComponent == null || componentsInBoxSelect == [] ||
    componentsInBoxSelect == null)
    {

        //box select start
        currentMouseMode = "boxSelect";
        boxSelectStart = {x: e.offsetX, y: e.offsetY};
        //console.log("box select start");

    }
    else if(e.button == 0 && currentMouseMode == "moveComponent" && componentsInBoxSelect != [] && componentsInBoxSelect != null)
    {
        componentsInBoxSelect = [];
        boxSelectComponentsOffset = [];
        initialConnectionLinesInBoxSelect = [];

        for(let i=0;i<connectionLinesInBoxSelect.length;i++)
        {
            connectionLines.push(connectionLinesInBoxSelect[i]);
        }
        console.log(connectionLinesInBoxSelect);

        connectionLinesInBoxSelect = [];

        currentMouseMode = "none";

    }
  
  
});

document.addEventListener('mousemove', function(e)
{
    mousePosition = {x: e.offsetX, y: e.offsetY};
});

canvas.addEventListener('mousemove', function(e)
{
    //////console.log(e.offsetX + " " + e.offsetY);
    if(currentMouseMode == "moveComponent")
    {
        if(selectedComponent != null)
        {
                selectedComponent.position = {x: e.offsetX/zoom + cameraPosition.x - selectedComponentOffset.x,
                 y: e.offsetY/zoom + cameraPosition.y - selectedComponentOffset.y};
        }
        else if(componentsInBoxSelect != null && componentsInBoxSelect != [])
        {
            //console.log(initialConnectionLinesInBoxSelect);

            connectionLinesInBoxSelect = [];
            for(let i=0;i<componentsInBoxSelect.length;i++)
            {
                componentsInBoxSelect[i].position = {x: e.offsetX/zoom + cameraPosition.x - boxSelectComponentsOffset[i].x,
                    y: e.offsetY/zoom + cameraPosition.y - boxSelectComponentsOffset[i].y};
            }

            for(let i=0;i<initialConnectionLinesInBoxSelect.length;i++)
            {
                connectionLinesInBoxSelect.push({linePositions: [],
                    outputComponent: initialConnectionLinesInBoxSelect[i].outputComponent,
                    inputComponent: initialConnectionLinesInBoxSelect[i].inputComponent,
                    outputID: initialConnectionLinesInBoxSelect[i].outputID,
                    inputID: initialConnectionLinesInBoxSelect[i].inputID})
                let thisLinePositions = [];
                for(let j=0;j<initialConnectionLinesInBoxSelect[i].linePositions.length;j++)
                {
                    thisLinePositions.push({
                        x:initialConnectionLinesInBoxSelect[i].linePositions[j].x,
                        y: initialConnectionLinesInBoxSelect[i].linePositions[j].y
                    });

             

                    //something also doesn't seem right here
                    //
                    // thisLinePositions[j] = {x: thisLinePositions[j].x - cameraPosition.x + e.offsetX,
                    //     y: thisLinePositions[j].y - cameraPosition.y + e.offsetY};

                    // thisLinePositions[j] = {x: thisLinePositions[j].x + cameraPosition.x + e.offsetX/zoom,
                    //     y: thisLinePositions[j].y + cameraPosition.y +  e.offsetY/zoom};

                    thisLinePositions[j] = {x: cameraPosition.x + e.offsetX/zoom - thisLinePositions[j].x ,
                    y: cameraPosition.y +  e.offsetY/zoom -  thisLinePositions[j].y };
            
                }

                connectionLinesInBoxSelect[i].linePositions = thisLinePositions;
            }

            
        }
    }

    if(connectionPointMouseOver!=null)
    {
        let thatComponent = connectionPointMouseOver.component;
        if(connectionPointMouseOver.isInput)
        {
            if(thatComponent.inWhichInputIsPoint({x: e.offsetX, y: e.offsetY}, cameraPosition, zoom) == connectionPointMouseOver.index)
            {
                return;
            }
        }
        else
        {
            if(thatComponent.inWhichOutputIsPoint({x: e.offsetX, y: e.offsetY}, cameraPosition, zoom) == connectionPointMouseOver.index)
            {
                return;
            }
        }

        connectionPointMouseOver  = null;
     
    }

    if(connectionPointMouseOver == null)
    {
        for(let i=0;i<components.length;i++)
        {
            let inWhichOutput = components[i].inWhichOutputIsPoint({x: e.offsetX, y: e.offsetY}, cameraPosition, zoom);
            if(inWhichOutput != -1)
            {
                connectionPointMouseOver = {component: components[i], isInput: false, index: inWhichOutput};
                return;
            }
    
            let inWhichInput = components[i].inWhichInputIsPoint({x: e.offsetX, y: e.offsetY}, cameraPosition, zoom);
            if(inWhichInput != -1)
            {
                connectionPointMouseOver = {component: components[i], isInput: true, index: inWhichInput};
                return;
            }
        }
    }

   
    
});

function isPointInsideRectangle(point, rectangle)
{
    if(point.x > rectangle.x && point.x < rectangle.x + rectangle.width)
    {
        if(point.y > rectangle.y && point.y < rectangle.y + rectangle.height)
        {
            return true;
        }
    }

    return false;

}
window.addEventListener('mouseup', function(e)
{
    
    if(boxSelectStart != null && currentMouseMode == "boxSelect")
    {
        //get everything in the rectangle
        componentsInBoxSelect = [];
        boxSelectComponentsOffset = [];
        connectionLinesInBoxSelect = [];
        initialConnectionLinesInBoxSelect=[];

        boxSelectStart = {x: boxSelectStart.x/zoom + cameraPosition.x, y: boxSelectStart.y/zoom + cameraPosition.y}
        let boxSelectEnd = {x: e.offsetX/zoom + cameraPosition.x, y: e.offsetY/zoom + cameraPosition.y};
     
       

        let rectangle = {x: Math.min(boxSelectStart.x, boxSelectEnd.x)*zoom - cameraPosition.x*zoom,
             y: Math.min(boxSelectStart.y, boxSelectEnd.y)*zoom - cameraPosition.y*zoom, 
             width: Math.abs(boxSelectStart.x - boxSelectEnd.x)*zoom, 
             height: Math.abs(boxSelectStart.y - boxSelectEnd.y)*zoom};

        //  context.beginPath();
        // context.fillStyle = "rgba(255, 0, 255, 255)";
        // context.fillRect(rectangle.x, rectangle.y, rectangle.width, rectangle.height);

            
        // context.beginPath();
        // context.fillStyle = "rgba(255, 0, 255, 255)";
        // context.fillRect(rectangle.x*zoom - cameraPosition.x*zoom, rectangle.y*zoom - cameraPosition.y*zoom, rectangle.width*zoom, rectangle.height*zoom);



        for(let i=0;i<components.length;i++)
        {
            if(isPointInsideRectangle({x: (components[i].position.x + components[i].size.x - cameraPosition.x)*zoom, 
                y: (components[i].position.y - cameraPosition.y)*zoom}
                , rectangle) ||
                isPointInsideRectangle({x: (components[i].position.x - cameraPosition.x)*zoom, 
                    y: (components[i].position.y - cameraPosition.y)*zoom}
                    , rectangle) ||
                    isPointInsideRectangle({x: (components[i].position.x - cameraPosition.x)*zoom, 
                        y: (components[i].position.y + components[i].size.y - cameraPosition.y)*zoom}
                        , rectangle) ||
                        isPointInsideRectangle({x: (components[i].position.x + components[i].size.x - cameraPosition.x)*zoom, 
                            y: (components[i].position.y + components[i].size.y - cameraPosition.y)*zoom}
                            , rectangle))
               
                {
                    boxSelectComponentsOffset.push({x: e.offsetX/zoom + cameraPosition.x - components[i].position.x,
                         y: e.offsetY/zoom + cameraPosition.y - components[i].position.y});

                    componentsInBoxSelect.push(components[i]);
                }
                
            // context.beginPath();
            // context.fillStyle = "rgba(255, 255, 0, 255)";
            // context.fillRect((components[i].position.x - cameraPosition.x)*zoom, 
            // (components[i].position.y - cameraPosition.y)*zoom, components[i].size.x*zoom, components[i].size.y*zoom);
            
        }
      
        let connectionLinesToRemoveIDs= [];
        for(let i=0;i<connectionLines.length;i++)
        {
            if(componentsInBoxSelect.includes(connectionLines[i].inputComponent) && componentsInBoxSelect.includes(connectionLines[i].outputComponent))
            {           

                let linePositions = [];
                for(let j=0;j<connectionLines[i].linePositions.length;j++)
                {
                    //something doesn't seem right here, after I drew it on paper
                    // linePositions.push(
                    //     {
                    //         x: connectionLines[i].linePositions[j].x - cameraPosition.x*zoom - mousePosition.x,
                    //         y: connectionLines[i].linePositions[j].y - cameraPosition.y*zoom - mousePosition.y
                    //     }
                    // )

                    linePositions.push(
                        {
                            x: mousePosition.x/zoom + cameraPosition.x - connectionLines[i].linePositions[j].x,
                            y: mousePosition.y/zoom + cameraPosition.y - connectionLines[i].linePositions[j].y,
                        }
                    )

                    //console.log(linePositions[j]);
                }
                
                initialConnectionLinesInBoxSelect.push(
                    {
                        linePositions: linePositions, 
                            outputComponent: connectionLines[i].outputComponent, 
                            inputComponent: connectionLines[i].inputComponent,
                            outputID: connectionLines[i].outputID,
                            inputID: connectionLines[i].inputID}

                        );
                    
                connectionLinesToRemoveIDs.push(i);
                
            }
        }

        let previousLength = connectionLines.length;
        for(let i=connectionLines.length-1;i>=0;i--)
        {
            if(connectionLinesToRemoveIDs.includes(i))
            {
                connectionLines.splice(i, 1);
            }
        }
       console.log(`${previousLength} after ${connectionLines.length}`);

        boxSelectStart = null;
        currentMouseMode = "moveComponent";
    }
   
});

function handleArrowKeys(key)
{
    keysPressed[key] = true;

    if(keysPressed["ArrowRight"])
    {
        cameraPosition.x += scrollAmount / zoom;
    }
    else if(keysPressed["ArrowLeft"])
    {
        cameraPosition.x -= scrollAmount / zoom;
    }

    if(keysPressed["ArrowUp"])
    {
        cameraPosition.y -= scrollAmount / zoom;
    }
    else if(keysPressed["ArrowDown"])
    {
        cameraPosition.y += scrollAmount / zoom;
    }

    if(currentMouseMode == "moveComponent" && selectedComponent != null)
    {
        selectedComponent.position = {x: mousePosition.x - selectedComponentOffset.x + cameraPosition.x*zoom,
             y: mousePosition.y - selectedComponentOffset.y + cameraPosition.y*zoom};
    }


    updatePositionDisplay();
}

window.addEventListener("keydown", function(e) {
    let key = e.key;
    if(key=="ArrowRight" || key=="ArrowLeft" || key=="ArrowUp" || key=="ArrowDown")
    {
        handleArrowKeys(key);
        e.preventDefault();
    }
});

window.addEventListener('keydown', function(event) {
    let key = event.key;

    if(event.shiftKey)
    {
        keysPressed["Shift"] = true;
    }
    if(key == "Delete")
    {
        if(componentsInBoxSelect.length > 0)
        {
            //console.log("box select delete!");

            let componentsDeleted = [];
            for(let i=0;i<components.length;i++)
            {
                if(componentsInBoxSelect.includes(components[i]))
                {
                    componentsDeleted.push(components[i]);
                }
            }

            for(let i=connectionLines.length-1;i>=0;i--)
            {
                if(componentsInBoxSelect.includes(connectionLines[i].inputComponent) || componentsInBoxSelect.includes(connectionLines[i].outputComponent))
                {
                    connectionLines.splice(i, 1);
                  
                }

            }

            

            for(let i=0;i<componentsDeleted.length;i++)
            {
                let index = components.indexOf(componentsDeleted[i]);
                componentsDeleted[i].deleteComponent();
                components.splice(index, 1);
            }

            componentsInBoxSelect = [];
            boxSelectComponentsOffset = [];
            connectionLinesInBoxSelect = [];
            initialConnectionLinesInBoxSelect = [];
            currentMouseMode = "none";
        }
        else
        {
            //console.log("normal delete");
            let componentDeleted = null;
            let deletionIndex = -1;
            for(let i=0;i<components.length;i++)
            {
                if(components[i].isPointInComponent(mousePosition, cameraPosition, zoom))
                {
                    componentDeleted = components[i];
                    deletionIndex = i;
                   break;
                }
            }
    
            for(let i=connectionLines.length-1; i>=0; i--)
            {
                ////console.log(connectionLines[i]);
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
                    
    
                   
    
                }
            }

            componentDeleted.deleteComponent();
            components.splice(deletionIndex, 1);
        }

       

    }
});

window.addEventListener("keyup", function(event) {
    let key = event.key;
    if(key=="ArrowRight" || key=="ArrowLeft" || key=="ArrowUp" || key=="ArrowDown")
    {
        keysPressed[key] = false;
    }
    
    if(!event.shiftKey)
    {
        keysPressed["Shift"] = false;
    }
    
});



//disabling right click menu
contextMenu.addEventListener("contextmenu", (e) => {
    e.preventDefault();
});
canvas.addEventListener("contextmenu", (e) => {
    e.preventDefault();

});

const filePickerOptions = {
    types: [
      {
        description: "Text files",
        accept: {
            "text/plain": [".txt"],
        },
      },
    ],
    excludeAcceptAllOption: true,
    multiple: false,
  };

  


  function getCircuitData()
  {
      let result = "";
      result+= `${components.length} \n`;
      for(let i=0;i<components.length;i++)
      {
          result += `${i} ${components[i].constructor.name} ${components[i].getDataToSave(components) } \n`;
      }
  
      result += `${connectionLines.length} \n`;
  
      for(let i=0;i<connectionLines.length;i++)
      {
          let thisLine = connectionLines[i];
          result += `${thisLine.linePositions.length} `;
          for(let j=0;j<thisLine.linePositions.length;j++)
          {
              result += `${thisLine.linePositions[j].x} ${thisLine.linePositions[j].y} `;
          }
          result += `${components.indexOf(thisLine.outputComponent)} ${components.indexOf(thisLine.inputComponent)} ${thisLine.outputID} ${thisLine.inputID} \n`;
      }
  
  
      return result;
  }
  
  function resetVariablesToInit()
  {
    components = [];
    selectedComponent = null;
    selectedComponentOffset = {x: 0, y: 0};
    outputID = -1;
    currentMouseMode = "none";
    mousePosition = {x:0, y:0};
    connectionLines = [];
    currentLinePositions = [];
    cameraPosition = {x: 0, y: 0};
    zoom = 1;
    targetZoom = 1;
    boxSelectStart = null;
    boxSelectComponentsOffset = [];
    componentsInBoxSelect = [];
    contextMenuVisible = false;

    keysPressed = {
        "ArrowLeft": false,
        "ArrowRight": false,
        "ArrowUp": false,
        "ArrowDown": false,
        "Shift": false,
    }

}
  async function saveCircuit() {
      const newHandle = await window.showSaveFilePicker(filePickerOptions);
      const writableStream = await newHandle.createWritable();
      await writableStream.write(getCircuitData());
      await writableStream.close();
    }
  
  async function loadCircuit() {
      resetVariablesToInit();
  
      const [fileHandle] = await window.showOpenFilePicker(filePickerOptions);
      const file = await fileHandle.getFile();
      const contents = await file.text();
  
      let lines = contents.split("\n");
  
  
      let howManyComponents = parseInt(lines[0]);
  
      for(let i=1;i<1+howManyComponents;i++)
      {
          if(lines[i] == "")
          {
              continue;
          }
          let data = lines[i].split(" ");
  
          let thisComponent = eval("new " + data[1] + "()");
          thisComponent.position = {x: parseInt(data[2]), y: parseInt(data[3])};
  
          let currentIndex = 5;
          //console.log("inputs:");
          for(let j=0;j<thisComponent.inputs.length;j++)
          {
              thisComponent.inputs[j] = parseInt(data[currentIndex]);
              //console.log(data[currentIndex]);
              currentIndex++;
          }
  
          currentIndex++;
  
          //console.log("outputs:");
          for(let j=0;j<thisComponent.outputs.length;j++)
          {
              thisComponent.outputs[j] = parseInt(data[currentIndex]);
              //console.log(data[currentIndex]);
              currentIndex++;
          }
  
          if(data[1] == "LABEL")
          {
            thisComponent.name = data[currentIndex];
          }
          components.push(thisComponent);
      
      }
  
      let currentLineIndex = 1+howManyComponents;
      let howManyConnectionLines = parseInt(lines[currentLineIndex]);
      currentLineIndex++;
  
      for(let i=0;i<howManyConnectionLines;i++)
      {
          /*
          connectionLine format:
              howManyLinePositions linePosition1.x linePosition1.y indexOfOutputComponent indexOfinputComponent outputID inputID 
          */
  
          let data = lines[currentLineIndex].split(" ");
  
          let currentIndex = 0;
          let howManyLinePositions = parseInt(data[currentIndex]);
          currentIndex++;
  
          let linePositions = [];
    
          for(let j=0;j<howManyLinePositions;j++)
          {
              linePositions.push({x: parseInt(data[currentIndex]), y: parseInt(data[currentIndex+1])});
              currentIndex+=2;
          }
  
          let indexOfOutputComponent = parseInt(data[currentIndex]);
          let indexOfInputComponent = parseInt(data[currentIndex+1]);
          let outputID = parseInt(data[currentIndex+2]);
          let inputID = parseInt(data[currentIndex+3]);
   
  
          let thisConnectionLine = {linePositions: linePositions, 
              outputComponent: components[indexOfOutputComponent], 
              inputComponent: components[indexOfInputComponent],
              outputID: outputID,
              inputID: inputID}
  
          
          components[indexOfInputComponent].connectToInput(components[indexOfOutputComponent], outputID, inputID, events);
          components[indexOfOutputComponent].outputComponents[outputID].push({component:components[indexOfInputComponent], inputID: inputID});
  
          //console.log(thisConnectionLine);
  
          connectionLines.push(thisConnectionLine);
  
          currentLineIndex++;
      }
  
  
  
  }
  


//the screen center version
canvas.addEventListener("wheel", function(event) {



    targetZoom -= event.deltaY * zoomAmount;

    if (targetZoom < 0.1) {
        targetZoom = 0.1;
    }
    if (targetZoom > 2) {
        targetZoom = 2;
    }


    cameraPositionDisplay.innerText = `Camera position: (${cameraPosition.x.toFixed(2)}, ${cameraPosition.y.toFixed(2)} | Zoom: ${zoom.toFixed(2)})`;
    event.preventDefault();
});

  window.saveCircuit = saveCircuit;
  window.loadCircuit = loadCircuit;

function editText()
{
    let text = prompt("Enter text to display", "Hello world!");
    //console.log(text);
}

function saveAsCustomComponent()
{
    if(componentsInBoxSelect != [] && componentsInBoxSelect.length >0)
    {
        let componentName = prompt("Enter new component name", "MyComponent");
        //console.log(componentName);

        

        let selectedConnectionLines = [];
        for(let i=0;i<connectionLines.length;i++)
        {
            let thisInputComponent = connectionLines[i].inputComponent;
            let thisOutputComponent = connectionLines[i].outputComponent;

            if(componentsInBoxSelect.includes(thisInputComponent) && componentsInBoxSelect.includes(thisOutputComponent))
            {
                selectedConnectionLines.push(connectionLines[i]);
            }
        }
        

        let freeInputs = [];

        for(let i=0;i<componentsInBoxSelect.length;i++)
        {
            for(let j=0;j<componentsInBoxSelect[i].inputs.length;j++)
            {
                if(componentsInBoxSelect[i].inputComponents[j] == null || 
                    !componentsInBoxSelect.includes(componentsInBoxSelect[i].inputComponents[j].component))
                {
                    freeInputs.push(
                        {
                            component: componentsInBoxSelect[i],
                            inputID: j
                        });

                }
            }
        }

        //working fine!
        //console.log(componentsInBoxSelect);
        //console.log(selectedConnectionLines);
        //console.log(freeInputs);


        contextMenuVisible = false;
        contextMenu.classList.add("hidden");


        componentsInBoxSelect = [];
        currentMouseMode = "none";
        




    }
    else
    {
        alert("No components selected!");
    }
    
}

function copySelected()
{
    copiedComponents = [];
    copiedComponentsOffsets = [];
    copiedConnectionLines = [];
    

    for(let i=0;i<connectionLinesInBoxSelect.length;i++)
    {
        connectionLines.push(connectionLinesInBoxSelect[i]);
    }


    let middlePosition = {x:0, y:0};
    for(let i=0;i<componentsInBoxSelect.length;i++)
    {
        copiedComponents.push(componentsInBoxSelect[i].copy());

        middlePosition = {x:middlePosition.x + copiedComponents[i].position.x,
            y:middlePosition.y + copiedComponents[i].position.y};
    }

    middlePosition = {x: middlePosition.x / componentsInBoxSelect.length,
        y:middlePosition.y / componentsInBoxSelect.length};

    for(let i=0;i<copiedComponents.length;i++)
    {
        copiedComponentsOffsets.push({x: middlePosition.x - copiedComponents[i].position.x,
            y: middlePosition.y - copiedComponents[i].position.y});
    }

    for(let i=0;i<connectionLines.length;i++)
    {
        if(componentsInBoxSelect.includes(connectionLines[i].inputComponent) &&
            componentsInBoxSelect.includes(connectionLines[i].outputComponent))
        {

            let thisCopiedLinePositions = [];
            for(let j=0;j<connectionLines[i].linePositions.length;j++)
            {
                thisCopiedLinePositions.push({x: middlePosition.x - connectionLines[i].linePositions[j].x,
                    y: middlePosition.y - connectionLines[i].linePositions[j].y});
            }

            copiedConnectionLines.push({linePositions: thisCopiedLinePositions, 
                outputComponentID: componentsInBoxSelect.indexOf(connectionLines[i].outputComponent),
                inputComponentID: componentsInBoxSelect.indexOf(connectionLines[i].inputComponent),
                outputID: connectionLines[i].outputID,
                inputID: connectionLines[i].inputID});

            //console.log(copiedConnectionLines);
        }
    }

    console.log(copiedConnectionLines);
    contextMenuVisible = false;
    contextMenu.classList.add("hidden");

    componentsInBoxSelect = [];
    boxSelectComponentsOffset = [];
    initialConnectionLinesInBoxSelect = [];


    connectionLinesInBoxSelect = [];

    currentMouseMode = "none";

    //console.log(copiedComponentsOffsets);
}

function pasteComponents()
{
    componentsInBoxSelect = [];
    boxSelectComponentsOffset = [];
    initialConnectionLinesInBoxSelect = [];
    connectionLinesInBoxSelect = [];

    for(let i=0;i<copiedComponents.length;i++)
    {

        let anotherCopy = copiedComponents[i].copy();
        
        // selectedComponent.position = {x: mousePosition.x - selectedComponentOffset.x + cameraPosition.x*zoom,
        //     y: mousePosition.y - selectedComponentOffset.y + cameraPosition.y*zoom};
            
       
        ////console.log(anotherCopy.position);
        components.push(anotherCopy);

        componentsInBoxSelect.push(anotherCopy);
        boxSelectComponentsOffset.push(copiedComponentsOffsets[i]);
    }

    //console.log(componentsInBoxSelect);
    //console.log(copiedConnectionLines);
    for(let i=0;i<copiedConnectionLines.length;i++)
    {

        let inputComponent = componentsInBoxSelect[copiedConnectionLines[i].inputComponentID];
        let outputComponent = componentsInBoxSelect[copiedConnectionLines[i].outputComponentID];

        //console.log(copiedConnectionLines[i]);
        //console.log(inputComponent);

        console.log("Input component and output component");
        console.log(inputComponent);
        console.log(outputComponent);

        inputComponent.inputComponents[copiedConnectionLines[i].inputID] = {component: outputComponent,
            outputID: copiedConnectionLines[i].outputID};

        outputComponent.outputComponents[copiedConnectionLines[i].outputID].push({component: inputComponent,
            inputID: copiedConnectionLines[i].inputID});

       

    

        let thisLinePositions = [];

        for(let j=0;j<copiedConnectionLines[i].linePositions.length;j++)
        {
            thisLinePositions.push({
                x: copiedConnectionLines[i].linePositions[j].x,
                y: copiedConnectionLines[i].linePositions[j].y
            });
        }

        
        connectionLinesInBoxSelect.push({linePositions: thisLinePositions,
            inputComponent: inputComponent,
            outputComponent: outputComponent,
            inputID: copiedConnectionLines[i].inputID,
            outputID: copiedConnectionLines[i].outputID});
        

        //console.log(connectionLines[connectionLines.length-1]);

    }

    initialConnectionLinesInBoxSelect = connectionLinesInBoxSelect;

    for(let i= 0;i<componentsInBoxSelect.length;i++)
    {
        componentsInBoxSelect.position = {x: cameraPosition.x*zoom - copiedComponentsOffsets[i].x,
            y: cameraPosition.y*zoom - copiedComponentsOffsets[i].y};
   
    }

    console.log("lines in box: ");
    console.log(connectionLinesInBoxSelect);

    currentMouseMode = "moveComponent";
    contextMenuVisible = false;
    contextMenu.classList.add("hidden");
}

window.editText = editText;
window.saveAsCustomComponent = saveAsCustomComponent;
window.copySelected = copySelected;
window.pasteComponents = pasteComponents;