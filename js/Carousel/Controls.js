import { SELECTORS } from "./index.js";

export class CarouselControls {
  constructor(carousel) {
    this.carousel = carousel;
    this.el = carousel.el.querySelector(SELECTORS.controls);
    this.indicator = this.el.querySelector(SELECTORS.controlsIndicator);
    this.initListeners();
  }

  initListeners() {
    this.back = this.el.querySelector(SELECTORS.btnBack);
    this.back.addEventListener("click", () => this.carousel.back());
    this.fwd = this.el.querySelector(SELECTORS.btnFwd);
    this.fwd.addEventListener("click", () => this.carousel.fwd());
    this.el.querySelectorAll(SELECTORS.btnGoto).forEach((b) => {
      b.addEventListener("click", () => {
        this.carousel.goto(parseInt(b.dataset.slide));
      });
    });
    return this;
  }
}
