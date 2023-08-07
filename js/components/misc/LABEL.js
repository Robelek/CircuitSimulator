import Component from "../Component.js";

class LABEL extends Component
{
    constructor()
    {
        super("LABEL", [], [], 60, "rgba(0, 100, 0, 255)");
        this.size.y = 30;
    }

    handleRightClick()
    {
        this.name = prompt("Enter label text", this.name);
        if(typeof  this.name  !== "string")
        {
            this.name = "";
        }
        this.width = this.name.length * 8 +20;

        return true;
        
    }

    getDataToSave(components)
    {
        let result = super.getDataToSave(components);
        result+= " " + this.name;
        return result;
    }
}

export default LABEL;