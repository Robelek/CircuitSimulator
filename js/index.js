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
                if(component.outputComponents[j] === null || component.outputComponents[j] === []) 
                {
                    continue;
                }

                for(let k=0;k<component.outputComponents[j].length;k++)
                {
                    let inputID = component.outputComponents[j][k].inputID;

                    let value =  component.outputs[j];
    
                    component.outputComponents[j][k].component.inputs[inputID] = value;
    
                    events.push({type: "valueChanged", component: component.outputComponents[j][k].component});
                }
                
               
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

        if(newObject instanceof CLOCK)
        {
            newObject.addEvent = () =>
            {
                events.push({type: "valueChanged", component: newObject});
            }
        }

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
            currentLinePositions = [];
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
                currentLinePositions = [];
                selectedComponent = components[i];
                selectedComponentOffset = {x: e.offsetX - components[i].position.x, y: e.offsetY - components[i].position.y};
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
                let inWhichInput = components[i].inWhichInputIsPoint(point);
              
                if(inWhichInput != -1)
                {
                    components[i].connectToInput(selectedComponent, outputID, inWhichInput, events);


                    selectedComponent.outputComponents[outputID].push({component:components[i], inputID: inWhichInput});
                    
    
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
                    return;
            
                }
               
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

async function saveCircuit() {
    const newHandle = await window.showSaveFilePicker(filePickerOptions);
    const writableStream = await newHandle.createWritable();
    await writableStream.write(getCircuitData());
    await writableStream.close();
  }

async function loadCircuit() {
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
        console.log("inputs:");
        for(let j=0;j<thisComponent.inputs.length;j++)
        {
            thisComponent.inputs[j] = parseInt(data[currentIndex]);
            console.log(data[currentIndex]);
            currentIndex++;
        }

        currentIndex++;

        console.log("outputs:");
        for(let j=0;j<thisComponent.outputs.length;j++)
        {
            thisComponent.outputs[j] = parseInt(data[currentIndex]);
            console.log(data[currentIndex]);
            currentIndex++;
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

        console.log(thisConnectionLine);

        connectionLines.push(thisConnectionLine);

        currentLineIndex++;
    }



}

  window.saveCircuit = saveCircuit;
  window.loadCircuit = loadCircuit;


