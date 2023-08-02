import AND from "./components/AND.js";

let components = [
    new AND()
];

// console.log(components[0]);
// console.log(components[0].getName);

function toggleSidebar()
{
    let sidebarDiv = document.getElementsByClassName("sidebar")[0];
    sidebarDiv.classList.toggle("hidden");

    let arrow = sidebarDiv.getElementsByClassName("arrow")[0];
    arrow.classList.toggle("hidden");
}