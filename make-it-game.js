import { AccessButton, ShadowElement, SvgPlus } from "./utils.js";



class MakeItGame extends ShadowElement {
  constructor(el) {
    super(el, new SvgPlus("div"));

    this.createChild(AccessButton, {
      class: "reset-button", 
      events: {
        "access-click": e => this.reset(),
    }}, "apps").createChild("div", {
        content: "Reset",
    }).createChild("img", {src: "resources/hat.webp", class: "reset-icon"});

    let main = this.createChild("main", {class: "main"});
    this.sceneContanter = main.createChild("div", {class: "scene-container"});
    this.imageWrapper = this.sceneContanter.createChild("div", {class: "scene-image-wrapper"});
    this.ingredients = main.createChild("div", {class: "ingredients"}).createChild("div");
  }


  set scene(object) {
    this.soundEffectURL = object.soundEffect;
    this.root.styles = {
      "background-color": object.backgroundColor || "transparent",
      "background-image": object.backgroundImage ? `url('${object.backgroundImage}')` : "none",
    }
    this.buildIngredients(object.ingredients);
    this.buildScene(object.imgURL, object.slots);
  }


  buildIngredients(ingredientList) {
    const { ingredients } = this;
    this.ingredientsList = ingredientList;
    ingredients.innerHTML = "";
    this.ingredientButtons = new Map();
    this.variantIndices = new Map();

    for (let entry of ingredientList) {
      const isVariant = Array.isArray(entry);
      if (isVariant) this.variantIndices.set(entry, 0);

      const getCurrentIngredient = () => isVariant ? entry[this.variantIndices.get(entry)] : entry;

      let btn = ingredients.createChild(AccessButton, {class: "ingredient-button", events: {
          "access-click": e => this.selectIngredient(entry, e),
        }}, "aaaa-ingredients");

      const updateBtnImage = () => {
        const ingredient = getCurrentIngredient();
        let src = ingredient.src;
        if (ingredient.svg) src = "data:image/svg+xml;base64," + btoa(ingredient.svg);
        btn.querySelector("img.ingredient").src = src;
      };

      const first = getCurrentIngredient();
      let src = first.src;
      if (first.svg) src = "data:image/svg+xml;base64," + btoa(first.svg);
      btn.createChild("img", {src: src, class: "ingredient"});
      btn._updateImage = updateBtnImage;
      this.ingredientButtons.set(entry, btn);
      btn.addEventListener("pointerdown", e => this.#startDrag(getCurrentIngredient(), e));
    }
  }

  buildScene(imgURL, slots) {
    const { sceneContanter, imageWrapper } = this;
    imageWrapper.innerHTML = "";
    let sceneImage = imageWrapper.createChild("img", {src: imgURL, class: "scene-image"});
    const setupImageWrapper = () => {
      const ratio = sceneImage.naturalWidth / sceneImage.naturalHeight;
      const updateSize = () => {
        const cw = sceneContanter.clientWidth;
        const ch = sceneContanter.clientHeight;
        let w = cw;
        let h = w / ratio;
        if (h > ch) { h = ch; w = h * ratio; }
        imageWrapper.styles = {width: `${w}px`, height: `${h}px`};
      };
      new ResizeObserver(updateSize).observe(sceneContanter);
    };
    if (sceneImage.complete && sceneImage.naturalWidth > 0) {
      setupImageWrapper();
    } else {
      sceneImage.onload = setupImageWrapper;
    }


    this.slotElements = new Map();
    for (let slot of slots) {
      let size = slot.size || 0.2;
      if (typeof slot.size === "number") {
        size = [size, size];
      }
      let rotate = slot.rotate || 0;

      let slotEl = imageWrapper.createChild(AccessButton, {class: "slot-button", events: {
        "access-click": e => this.selectSlot(slot, e),
      }}, "aaab-image-slots");
      slotEl.styles = {
        left: `${slot.x * 100}%`,
        top: `${slot.y * 100}%`,
        width: `${size[0] * 100}%`,
        height: `${size[1] * 100}%`,
        transform: `translate(-50%, -50%) rotate(${rotate}deg)`,
      };
      this.slotElements.set(slot, slotEl);
    }
  }

  reset() {
    this.state = { slots: [] };
    this.dispatchEvent(new Event("change"));
  }

  get state() {
    const slots = [];
    for (const [, slotEl] of this.slotElements) {
      slots.push(slotEl.getAttribute("data-ingredient") || null);
    }
    return { slots };
  }

  set state(value) {
    if (!value) return;
    const newSlots = Array.isArray(value.slots) ? value.slots : [];
    let i = 0;
    for (const [, slotEl] of this.slotElements) {
      const newIngredient = newSlots[i] ?? null;
      const current = slotEl.getAttribute("data-ingredient") || null;
      if (newIngredient !== current) {
        const existing = slotEl.querySelector("img.placed-ingredient");
        if (existing) existing.remove();
        if (newIngredient) {
          const ingredient = this.ingredientsList.flat().find(ing => ing.name === newIngredient);
          if (ingredient) {
            const src = ingredient.svg ? "data:image/svg+xml;base64," + btoa(ingredient.svg) : ingredient.src;
            slotEl.createChild("img", {src: src, class: "placed-ingredient"});
            slotEl.setAttribute("data-ingredient", newIngredient);
          }
        } else {
          slotEl.removeAttribute("data-ingredient");
        }
      }
      i++;
    }
  }

  #startDrag(ingredient, e) {
    e.preventDefault();
    const pointerId = e.pointerId;
    const target = e.currentTarget;
    const startX = e.clientX;
    const startY = e.clientY;
    const DRAG_THRESHOLD = 8;
    let isDragging = false;
    let ghost = null;

    const enterDragMode = (x, y) => {
      isDragging = true;
      ghost = document.createElement("img");
      ghost.src = ingredient.svg ? "data:image/svg+xml;base64," + btoa(ingredient.svg) : ingredient.src;
      Object.assign(ghost.style, {
        position: "fixed",
        pointerEvents: "none",
        width: "80px",
        height: "80px",
        objectFit: "contain",
        transform: "translate(-50%, -50%)",
        zIndex: "9999",
        left: `${x}px`,
        top: `${y}px`,
        opacity: "0.85",
      });
      document.body.appendChild(ghost);
    };

    target.setPointerCapture(pointerId);

    const onMove = ev => {
      if (ev.pointerId !== pointerId) return;
      if (!isDragging) {
        const dx = ev.clientX - startX;
        const dy = ev.clientY - startY;
        if (dx * dx + dy * dy < DRAG_THRESHOLD * DRAG_THRESHOLD) return;
        enterDragMode(ev.clientX, ev.clientY);
      }
      ghost.style.left = `${ev.clientX}px`;
      ghost.style.top = `${ev.clientY}px`;
      for (const [, slotEl] of this.slotElements) {
        const r = slotEl.getBoundingClientRect();
        slotEl.classList.toggle("drag-over",
          ev.clientX >= r.left && ev.clientX <= r.right &&
          ev.clientY >= r.top  && ev.clientY <= r.bottom
        );
      }
    };

    const onEnd = ev => {
      if (ev.pointerId !== pointerId) return;
      target.removeEventListener("pointermove", onMove);
      target.removeEventListener("pointerup", onEnd);
      target.removeEventListener("pointercancel", onEnd);
      if (ghost) ghost.remove();
      if (isDragging) this._suppressVariantCycle = true;
      for (const [, slotEl] of this.slotElements) {
        slotEl.classList.remove("drag-over");
        if (isDragging && ev.type === "pointerup") {
          const r = slotEl.getBoundingClientRect();
          if (ev.clientX >= r.left && ev.clientX <= r.right &&
              ev.clientY >= r.top  && ev.clientY <= r.bottom) {
            const existing = slotEl.querySelector("img.placed-ingredient");
            if (existing) existing.remove();
            const src = ingredient.svg ? "data:image/svg+xml;base64," + btoa(ingredient.svg) : ingredient.src;
            slotEl.createChild("img", {src: src, class: "placed-ingredient"});
            slotEl.setAttribute("data-ingredient", ingredient.name);
            this.playSoundeffect("place");
            this.dispatchEvent(new Event("change"));
          }
        }
      }
    };

    target.addEventListener("pointermove", onMove);
    target.addEventListener("pointerup", onEnd);
    target.addEventListener("pointercancel", onEnd);
  }

  selectIngredient(entry, e) {
    const isVariant = Array.isArray(entry);
    if (isVariant && this._selectedEntry === entry && !this._suppressVariantCycle) {
      const idx = this.variantIndices.get(entry);
      this.variantIndices.set(entry, (idx + 1) % entry.length);
      const btn = this.ingredientButtons.get(entry);
      if (btn && btn._updateImage) btn._updateImage();
    }
    this._suppressVariantCycle = false;
    if (this._selectedIngredientBtn) {
      this._selectedIngredientBtn.classList.remove("selected");
    }
    this._selectedEntry = entry;
    this.selectedIngredient = isVariant ? entry[this.variantIndices.get(entry)] : entry;
    const btn = this.ingredientButtons.get(entry);
    if (btn) {
      btn.classList.add("selected");
      this._selectedIngredientBtn = btn;
    }
  }

  selectSlot(slot, e) {
    if (!this.selectedIngredient) return;
    const slotEl = this.slotElements.get(slot);
    if (!slotEl) return;
    const existing = slotEl.querySelector("img.placed-ingredient");
    if (existing) existing.remove();
    const src = this.selectedIngredient.svg ? "data:image/svg+xml;base64," + btoa(this.selectedIngredient.svg) : this.selectedIngredient.src;
    slotEl.createChild("img", {src: src, class: "placed-ingredient"});
    slotEl.setAttribute("data-ingredient", this.selectedIngredient.name);
    this.playSoundeffect("place");
    this.dispatchEvent(new Event("change"));
  }

  playSoundeffect(name) {
    if (this.soundEffectURL) {
      const audio = new Audio(this.soundEffectURL);
      audio.play();
    }
  }

  static get usedStyleSheets() {
    return [
       new URL("./make-it-game.css", import.meta.url),
    ]
  }
}

SvgPlus.defineHTMLElement(MakeItGame, "make-it-game");
