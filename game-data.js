import "./make-it-game.js";

import { FISHASSETS } from "./resources/fishbowl/fish-assets.js";

const colorThemes = [
    ["fish", [
        ["#ffe600"],
        ["#ff7918"],
        ["#ff6b6b"],
        ["#4ade80"],
        ["#60a5fa"],
    ]],
    ["seaweed", [
        ["#febe10", "#ffe543"],
        ["#22c55e", "#86efac"],
        ["#14b8a6", "#5eead4"],
        ["#a855f7", "#e9d5ff"],
        ["#ee6c0f", "#ff9142"],
    ]],
    ["star", [
        ["#f98423"],
        ["#3b82f6"],
        ["#facc15"],
        ["#ef4444"],
    ]],
    ["shell", [
        ["#b555c9", "#863699"],
        ["#2dd4bf", "#0f766e"],
        ["#fb923c", "#ea580c"],
        ["#60a5fa", "#2563eb"],
    ]], 
]

function circPoints(incs, r, otherData) {
let circs = []
for (let i = 0; i < incs; i++) {
    let angle = (i / incs) * 2 * Math.PI;
    circs.push({
    x: 0.5 + Math.cos(angle)*r,
    y: 0.5 + Math.sin(angle)*r,
    ...otherData
    })
}
return circs;
}

export const PIZZA_GAME = {
    icon: "resources/pizza/icon.png",
    backgroundColor: "white",
    backgroundImage: "./resources/pizza/background.png",
    slots: [
        {
        x: 0.5,
        y: 0.5,
        size: 0.26
        },
        ...circPoints(6, .28, {size: 0.26})
    ],
    imgURL: "resources/pizza/pizza.png",
    soundEffect: "resources/pizza/place.mp3",
    ingredients: [
        {name: "pepper", src: "resources/pizza/pepper.png"},
        {name: "tomato", src: "resources/pizza/tomato.png"},
        {name: "mushroom", src: "resources/pizza/mushroom.png"},
        {name: "pepperoni", src: "resources/pizza/pepperoni.png"},
    ],
}

export const FISH_GAME = {
    icon: "resources/fishbowl/icon.png",
    backgroundColor: "white",
    backgroundImage: "./resources/fishbowl/background.png",
    slots: [
        { x: 0.36, y: 0.88, size: [0.3, 0.15], rotate: 10, },
        { x: 0.66, y: 0.88, size: [0.3, 0.15], rotate: -10 },
        { x: 0.2, y: 0.69, size: 0.25 },
        { x: 0.5, y: 0.69, size: 0.25 },
        { x: 0.8, y: 0.69, size: 0.25 },
        { x: 0.18, y: 0.43, size: 0.25 },
        { x: 0.5, y: 0.4, size: 0.25 },
        { x: 0.82, y: 0.43,size: 0.25 },
        { x: 0.35, y: 0.55,size: 0.15 },
        { x: 0.65, y: 0.55,size: 0.15 }
    ],
    imgURL: "resources/fishbowl/fishbowl.svg",
    soundEffect: "resources/fishbowl/place.mp3",
    ingredients: [
        {name: "fishball", src: "resources/fishbowl/bubble.svg"},
        [
            {name: "pebble", src: "resources/fishbowl/pebble.svg"},
            {name: "stones", src: "resources/fishbowl/sand.svg"},
            {name: "sand", src: "resources/fishbowl/stones.svg"},
        ],
        ...colorThemes.map(([name, colors]) => colors.map(c => {
            return {
                svg: FISHASSETS[name](...c),
                name: `${name}-${c.join("-")}`,
            }})
        ),
    ],
}

export const GAMES = {
    pizza: PIZZA_GAME,
    fish: FISH_GAME,
}

