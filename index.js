import { GAMES } from "./game-data.js";
import { AccessButton, SvgPlus } from "./utils.js";

let location = "home";
document.body.setAttribute("location", location);
let onupdate = () => {};

const pizzaGame = document.querySelector("make-it-game[pizza]");
pizzaGame.scene = GAMES.pizza;
const fishGame = document.querySelector("make-it-game[fish]");
fishGame.scene = GAMES.fish;

pizzaGame.addEventListener("change", () => {
    onupdate("pizza", JSON.stringify(pizzaGame.state));
});
fishGame.addEventListener("change", () => {
    onupdate("fish", JSON.stringify(fishGame.state));
});

async function setLocation(newLocation) {
    if (location !== newLocation) {
        location = newLocation;
        document.body.setAttribute("location", location);
        // if (location === "home") {
        //     makeItGame.reset();
        // } else {
        //     makeItGame.scene = GAMES[location];
        // }
        onupdate("location", location);
        await new Promise(resolve => setTimeout(resolve, 100));
    }
}

const homeBtnRow = document.querySelector(".home .btn-row");
for (let [key, game] of Object.entries(GAMES)) {
    let btn = new AccessButton("aaa-home");
    btn.createChild("img", {src: game.icon});
    btn.addEventListener("access-click", e => e.waitFor(setLocation(key)));
    homeBtnRow.appendChild(btn);
}

const homeButton = document.querySelector(".home-button");
homeButton.addEventListener("access-click", e => e.waitFor(setLocation("home")));


if (window.SquidlyAPI) {
    onupdate = SquidlyAPI.firebaseSet;

    SquidlyAPI.firebaseOnValue("pizza", (str) => {
        let value = {slots: []}
        try {
            value = JSON.parse(str);
        } catch (e) {}
        pizzaGame.state = value;
    });

    SquidlyAPI.firebaseOnValue("fish", (str) => {
        let value = {slots: []}
        try {
            value = JSON.parse(str);
        } catch (e) {}
        fishGame.state = value;
    });

    SquidlyAPI.firebaseOnValue("location", (loc) => {
        if (loc) setLocation(loc);
        else SquidlyAPI.firebaseSet("location", location);
    });
}

setTimeout(() => {
    console.log("Video can play, starting animation");
    const chefLoader = document.querySelector("chef-walker");
    chefLoader.stop();
    chefLoader.remove();
}, 2000);
// const video = document.querySelector("video");
// video.addEventListener( "loadeddata" , () => {
// });