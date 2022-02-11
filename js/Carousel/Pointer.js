import { Carousel } from "./index.js";

/**
 * possible data attributes:
 * data-snap
 *  range 0,10 movement must be greater than
 *  width divided by 12 - snap (max. 200px)
 *  if not slide bounces back. Default: 4 (25%) 0 disables
 */
export class CarouselPointer {
  /**
   * events thrown
   * @returns {Object.<string, string>}
   */
  static get EVENTS() {
    return {
      enter: "slider-pointerenter",
      leave: "slider-pointerleave",
    };
  }

  /**
   * default snap divisor
   * @returns {Number}
   */
  get defaultSnap() {
    return 4;
  }

  /**
   * add pointer support
   * @param {Carousel} carousel
   */
  constructor(carousel) {
    this.carousel = carousel;
    if (this.carousel.slides.length > 1) {
      this.initSnap().initObserver().initPointer();
    }
  }

  /**
   * initialize snap divisor
   * @returns {CarouselPointer}
   */
  initSnap() {
    const d = parseInt(this.carousel.el.dataset.snap);
    if (!isNaN(d)) {
      this.snap = d === 0 ? 0 : Math.max(2, Math.min(10, d));
    } else {
      this.snap = this.defaultSnap;
    }
    return this;
  }

  /**
   * initialize observers
   * @returns {CarouselPointer}
   * @private
   */
  initObserver() {
    this.observer = new MutationObserver((mutations) => {
      mutations.forEach((m) => {
        if (m.attributeName === "data-snap") {
          this.initSnap();
        }
      });
    });

    this.observer.observe(this.carousel.el, { attributes: true });
    return this;
  }

  /**
   * initialize pointer events
   * @returns {CarouselPointer}
   * @private
   */
  initPointer() {
    this.pointerStart = null;
    this.carousel.slider.addEventListener(
      "pointerdown",
      this.pointerDown.bind(this)
    );
    this.carousel.slider.addEventListener(
      "pointermove",
      this.pointerMove.bind(this)
    );
    this.carousel.slider.addEventListener(
      "pointerup",
      this.pointerUp.bind(this)
    );
    this.carousel.slider.addEventListener(
      "pointerenter",
      this.pointerEnter.bind(this)
    );
    this.carousel.slider.addEventListener(
      "pointerleave",
      this.pointerLeave.bind(this)
    );
    return this;
  }

  /**
   * handle pointer enter events
   * @param {PointerEvent} e
   * @private
   */
  pointerEnter(e) {
    this.dispatchSliderEnter();
  }

  /**
   * handle pointer leave events
   * @param {PointerEvent} e
   * @private
   */
  pointerLeave(e) {
    this.dispatchSliderLeave();
    this.pointerUp(e);
  }

  /**
   * handle pointer down event
   * @param {PointerEvent} e
   * @private
   */
  pointerDown(e) {
    e.preventDefault();
    if (!this.carousel.moving) {
      this.pointerTime = performance.now();
      this.pointerStart = e.pageX;
      this.carousel.transition = false;
    }
  }

  /**
   * handle pointer move event
   * @param {PointerEvent} e
   * @private
   */
  pointerMove(e) {
    e.preventDefault();
    if (!this.carousel.moving && this.pointerStart) {
      const delta = e.pageX - this.pointerStart;
      if (
        Math.abs(delta) > 0 &&
        Math.abs(delta) <= this.carousel.slides[this.carousel.cur].offsetWidth
      ) {
        this.carousel.dir = Carousel.DIRECTIONS[delta > 0 ? "back" : "fwd"];
        this.carousel.setPrev().setVis().setNext();
        this.pxOffset = delta;
      }
    }
  }

  /**
   * handle pointer up event
   * @param {PointerEvent} e
   * @private
   */
  pointerUp(e) {
    e.preventDefault();
    this.carousel.transition = true;
    if (!this.carousel.moving && this.pxOffset) {
      this.carousel.moving = true;
      this.carousel.timingFunction = "ease-out";
      const delta = e.pageX - this.pointerStart;
      // moved at least by minDelta else bounce back
      if (Math.abs(delta) >= this.minDelta) {
        this.setRemainingDuration(e);
        this.carousel.setCur();
      } else {
        // reverse direction and keep current
        this.carousel.dir *= -1;
      }
      this.carousel.setPrev().setVis().setNext();
      this.pxOffset = undefined;
      this.carousel.dispatchTransitionStart();
    }
    this.pointerStart = null;
  }

  /**
   * caclulate and set the duration of the remaining transition
   * @param {PointerEvent} e
   * @private
   */
  setRemainingDuration(e) {
    const duration = performance.now() - this.pointerTime;
    const delta = Math.abs(this.pointerStart - e.pageX);
    const rest = this.carousel.slides[this.carousel.cur].offsetWidth - delta;
    const speed = delta / duration;
    // must be minimum of 1 animation frame to prevent transitionend event does not fire
    const restDuration = Math.max(1000 / 60, Math.round(rest / speed));
    this.carousel.duration = Math.min(1000, Math.round(restDuration));
    delete this.pointerTime;
  }

  /**
   * dispatch pointer enter event
   */
  dispatchSliderEnter() {
    this.carousel.el.dispatchEvent(
      new CustomEvent(CarouselPointer.EVENTS.enter, {
        detail: this.carousel.eventData,
      })
    );
  }

  /**
   * dispatch pointer leave event
   */
  dispatchSliderLeave() {
    this.carousel.el.dispatchEvent(
      new CustomEvent(CarouselPointer.EVENTS.leave, {
        detail: this.carousel.eventData,
      })
    );
  }

  /**
   * dispatch offset change event
   * @param {Number} offset
   */
  dispatchOffsetChange(offset) {
    this.carousel.el.dispatchEvent(
      new CustomEvent("slider-offsetchange", {
        detail: Object.assign(this.carousel.eventData, { offset }),
      })
    );
  }

  /**
   * set pixel based offset
   * @param {Number} px number of pixels
   * @private
   */
  set pxOffset(px) {
    if (typeof px === "number") {
      // hint: prev and next exchange their position if direction changes
      const offsetPrev =
        this.carousel.dir === Carousel.DIRECTIONS.fwd
          ? -100
          : this.carousel.visible * 100;
      const offsetNext =
        this.carousel.dir === Carousel.DIRECTIONS.fwd
          ? this.carousel.visible * 100
          : -100;
      this.carousel.slides[
        this.carousel.prev
      ].style.transform = `translateX(calc(${offsetPrev}% + (${px}px)))`;
      this.carousel.slides[
        this.carousel.cur
      ].style.transform = `translateX(${px}px)`;
      this.carousel.slides[
        this.carousel.next
      ].style.transform = `translateX(calc(${offsetNext}% + (${px}px)))`;
      this.carousel.slides.forEach((s) => {
        if (s.classList.contains(Carousel.CLASSNAMES.vis)) {
          s.style.transform = `translateX(calc(var(--visible-slide) * 100% + ${px}px))`;
        }
      });
    } else {
      this.carousel.slides.forEach((s) => (s.style.transform = ""));
    }
    this.dispatchOffsetChange(px);
  }

  /**
   * obtain current px offset
   * @private
   */
  get pxOffset() {
    const style = getComputedStyle(this.carousel.slides[this.carousel.cur]);
    return new DOMMatrix(style.getPropertyValue("transform")).m41;
  }

  /**
   * obtain snap divisor
   * @return {Number}
   */
  get snap() {
    const s = parseInt(this.carousel.el.style.getPropertyValue("--snap"));
    if (!isNaN(s)) {
      return Math.max(0, Math.min(10, s));
    }
    return this.defaultSnap;
  }

  /**
   * set snap divisor
   * @private
   */
  set snap(s) {
    this.carousel.el.style.setProperty("--snap", parseInt(s).toString());
  }

  /**
   * obtain min movement to prevent bounce back
   */
  get minDelta() {
    const snap = this.snap;
    const minDelta = snap
      ? this.carousel.slides[this.carousel.cur].offsetWidth / (12 - snap)
      : 0;
    return Math.min(minDelta, 200);
  }
}
