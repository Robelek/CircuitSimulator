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


let cameraPositionDisplay = null;

let keysPressed = {
    "ArrowLeft": false,
    "ArrowRight": false,
    "ArrowUp": false,
    "ArrowDown": false,
}

function drawConnectionLine(positionA, positionB)
{

        context.strokeStyle = "rgba(255, 255, 255, 255)";
        context.beginPath();
        context.moveTo((positionA.x - cameraPosition.x) * zoom, (positionA.y - cameraPosition.y)*zoom);
        context.lineTo((positionB.x - cameraPosition.x)  * zoom, (positionB.y - cameraPosition.y) * zoom);
        context.stroke();
   

   
}

function drawComponents()
{
    for(let i=0;i<components.length;i++)
    {
        let component = components[i];
       // //console.log(component);
        component.draw(context, cameraPosition, zoom);
       
    }

    for(let i=0;i<connectionLines.length;i++)
    {
        let thisLinePositions = connectionLines[i].linePositions;

        if(thisLinePositions.length > 0)
        {
            let firstPos = connectionLines[i].outputComponent.getOutputPositionCenter(connectionLines[i].outputID, cameraPosition, zoom);

            drawConnectionLine(firstPos, thisLinePositions[0]);
            for(let j=0;j<thisLinePositions.length - 1;j++)
            {
                drawConnectionLine(thisLinePositions[j], thisLinePositions[j+1]);
            }

            drawConnectionLine(thisLinePositions[thisLinePositions.length - 1], 
                connectionLines[i].inputComponent.getInputPositionCenter(connectionLines[i].inputID, cameraPosition, zoom));
        }
        else
        {
            drawConnectionLine(connectionLines[i].outputComponent.getOutputPositionCenter(connectionLines[i].outputID, cameraPosition, zoom), 
            connectionLines[i].inputComponent.getInputPositionCenter(connectionLines[i].inputID, cameraPosition, zoom));
        }
      
       
    }

    if(currentMouseMode == "connectOutput" && selectedComponent != null)
    {

            let firstPos = selectedComponent.getOutputPositionCenter(outputID, cameraPosition, zoom);

            if(currentLinePositions.length > 0)
            {
                drawConnectionLine(firstPos, currentLinePositions[0]);
                for(let j=0;j<currentLinePositions.length - 1;j++)
                {
                    drawConnectionLine(currentLinePositions[j], currentLinePositions[j+1]);
                }
                drawConnectionLine(currentLinePositions[currentLinePositions.length - 1], 
                    {x: mousePosition.x - cameraPosition.x, y: mousePosition.y + cameraPosition.y});
            }
            else
            {
                drawConnectionLine(firstPos, {x: mousePosition.x - cameraPosition.x, y: mousePosition.y + cameraPosition.y});
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

    cameraPositionDisplay = document.getElementById("cameraPositionDisplay");
    cameraPositionDisplay.innerText = `Camera position: (${cameraPosition.x}, ${cameraPosition.y} | Zoom: ${zoom})`;

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

        newObject.position = {x: e.offsetX - cameraPosition.x, y: e.offsetY + cameraPosition.y};

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
       console.log(`${e.offsetX} ${e.offsetY}, camera position: ${cameraPosition.x} ${cameraPosition.y}`);
   

       for(let i=0;i<components.length;i++)
       {
              if(components[i].isPointInComponent(point, cameraPosition, zoom))
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
            //currentLinePositions.push(components[i].getOutputPositionCenter(inWhichOutput));
            return;
        }

        if(components[i].isPointInComponent(point, cameraPosition, zoom))
        {
            if(currentMouseMode == "none" && selectedComponent == null)
            {
                currentLinePositions = [];
                selectedComponent = components[i];
                selectedComponentOffset = {x: e.offsetX + cameraPosition.x - components[i].position.x, y: e.offsetY + cameraPosition.y - components[i].position.y};
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
        currentLinePositions.push({x: e.offsetX - cameraPosition.x, y: e.offsetY + cameraPosition.y});
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
            selectedComponent.position = {x: e.offsetX + cameraPosition.x - selectedComponentOffset.x, y: e.offsetY + cameraPosition.y - selectedComponentOffset.y};
        }
        
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
        selectedComponent.position = {x: mousePosition.x - selectedComponentOffset.x + cameraPosition.x,
             y: mousePosition.y - selectedComponentOffset.y + cameraPosition.y};
    }


    cameraPositionDisplay.innerText = `Camera position: (${cameraPosition.x}, ${cameraPosition.y} | Zoom: ${zoom})`;
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
    if(key == "Delete")
    {
        console.log("delete");

        let componentDeleted = null;
        for(let i=0;i<components.length;i++)
        {
            if(components[i].isPointInComponent(mousePosition, cameraPosition, zoom))
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

window.addEventListener("keyup", function(event) {
    let key = event.key;
    if(key=="ArrowRight" || key=="ArrowLeft" || key=="ArrowUp" || key=="ArrowDown")
    {
        keysPressed[key] = false;
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
      components = [];
      connectionLines = []
      selectedComponent = [];
      currentLinePositions = [];
      currentMouseMode = "none";
  
  
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
  
// // the not working mouse zoom in 
//   canvas.addEventListener("wheel", function(event) {
//     //console.log(event.deltaY);

//     let previousMouseWorldPos = {
//         x: (mousePosition.x + cameraPosition.x) / zoom,
//         y: (mousePosition.y + cameraPosition.y) / zoom
//     };

//     zoom -= event.deltaY * zoomAmount;

//     if(zoom < 0.1)
//     {
//         zoom = 0.1;
//     }
//     if(zoom > 2)
//     {
//         zoom = 2;
//     }

//     let newMousePos = {
//         x: (mousePosition.x + cameraPosition.x) / zoom,
//         y: (mousePosition.y + cameraPosition.y) / zoom
//     }; 

//     cameraPosition.x -= (previousMouseWorldPos.x - (newMousePos.x)*zoom);
//     cameraPosition.y -= (previousMouseWorldPos.y - (newMousePos.y)*zoom);

//     cameraPositionDisplay.innerText = `Camera position: (${cameraPosition.x}, ${cameraPosition.y} | Zoom: ${zoom})`;
//     event.preventDefault();

//   });


//the screen center version
canvas.addEventListener("wheel", function(event) {
    const previousZoom = zoom;

    // Calculate the canvas center in world coordinates
    const canvasCenter = {
        x: canvas.width / 2 / zoom + cameraPosition.x,
        y: canvas.height / 2 / zoom + cameraPosition.y
    };

    // Update the zoom level
    zoom -= event.deltaY * zoomAmount;

    // Clamp the zoom level
    if (zoom < 0.1) {
        zoom = 0.1;
    }
    if (zoom > 2) {
        zoom = 2;
    }

    // Calculate the new camera position to keep the canvas center unchanged
    cameraPosition.x = canvasCenter.x - canvas.width / 2 / zoom;
    cameraPosition.y = canvasCenter.y - canvas.height / 2 / zoom;

    // Update the display and prevent default scrolling behavior
    cameraPositionDisplay.innerText = `Camera position: (${cameraPosition.x.toFixed(2)}, ${cameraPosition.y.toFixed(2)} | Zoom: ${zoom.toFixed(2)})`;
    event.preventDefault();
});

  window.saveCircuit = saveCircuit;
  window.loadCircuit = loadCircuit;


