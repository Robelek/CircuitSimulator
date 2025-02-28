# Circuit Simulator
A simple application that allows the user to make simple circuits with logic gates, as well as create custom components.

## Basic controls
Panning the screen - arrow keys
Zooming in/out - mouse wheel

You can select multiple components by dragging the mouse from an empty space.
You add components by dragging them from the sidebar onto the circuit display.

Right mouse button toggles most components or allows you to modify them in some way.
Pressing right mouse button on other components will display a context menu. 

You can display a context menu by pressing right mouse button anywhere on the circuit display.

To connect two components, press left mouse button on one of the outputs, then click left mouse button on an input of another component.
You can also bend the line by pressing left mouse button in any empty spot.

To disconnect a component, press the line at its output end.

Pressing right mouse button when making a connection will undo the last placed point, allowing you to delete the line or its parts.



## Descriptions of some components
Most components have a descriptive name and work similarly to how you would expect them to work. Further clarification is provided below.

**INPUT** - holds a value from 0 to 1, pressing right mouse button flips the bit

**AND** - two input version, if all inputs are 1 then the result is 1, otherwise it is 0.

**ANDx3** - three input version, works the same as AND

**LED** - has one input, if the input is 1 then the led glows a red light

**NOT** - flips the input: if the input is 1, the result is 0, and vice versa.

**OR** - two input version, if any of the inputs is true, the result is true

**NOR** - the result of OR but flipped

**NAND** - the result of NAND but flipped

**BUFFER** - simply passes the input further forward

**CLOCK** - when the CLOCK is on, the value flips from 0 to 1 at a 1 second interval.

**XOR** - exclusive or, the result is 1 if only one of the inputs is true.

**LABEL** - unrelated to any logic, pressing right mouse button allows you to edit its text

Other components are more advanced to simplify more advanced circuits, for example MUX16 (which can be realised using the logic gates provided).


