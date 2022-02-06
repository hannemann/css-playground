import { Carousel } from "./index.js";

export class CarouselPointer {
  /**
   * events thrown
   */
  static get EVENTS() {
    return {
      enter: "slider-pointerenter",
      leave: "slider-pointerleave",
    };
  }

  /**
   * add pointer support
   * @param {Carousel} carousel
   */
  constructor(carousel) {
    this.carousel = carousel;
    this.initPointer();
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
      if (Math.abs(delta) > 0) {
        this.carousel.dir =
          delta > 0 ? Carousel.DIRECTIONS.back : Carousel.DIRECTIONS.fwd;
        this.carousel.setPrev().setNext();
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
    if (
      !this.carousel.moving &&
      this.carousel.slides[this.carousel.cur].style.transform !== ""
    ) {
      this.carousel.moving = true;

      const duration = performance.now() - this.pointerTime;
      delete this.pointerTime;
      const delta = Math.abs(this.pointerStart - e.pageX);
      const rest = this.carousel.slides[this.carousel.cur].offsetWidth - delta;
      const speed = delta / duration;
      const restDuration = rest / speed;
      this.carousel.duration = Math.min(1000, Math.round(restDuration));
      this.carousel.timingFunction = "ease-out";

      if (e.pageX - this.pointerStart > 0) {
        this.carousel.dir = Carousel.DIRECTIONS.back;
      } else {
        this.carousel.dir = Carousel.DIRECTIONS.fwd;
      }
      if (this.carousel.max === 1) {
        this.carousel.slides[this.carousel.next].classList.remove(
          Carousel.CLASSNAMES.next
        );
      }
      this.carousel.slides[this.carousel.prev].style.transform = "";
      this.carousel.slides[this.carousel.cur].style.transform = "";
      this.carousel.slides[this.carousel.next].style.transform = "";
      this.carousel.setCur();
      this.carousel.max > 1 && this.carousel.setNext();
      this.carousel.setPrev();
      this.carousel.dispatchTransitionStart();
    }
    this.pointerStart = null;
    this.carousel.transition = true;
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
    // hint: prev and next exchange their position if direction changes
    const offsetPrev =
      this.carousel.dir === Carousel.DIRECTIONS.fwd ? -100 : 100;
    const offsetNext =
      this.carousel.dir === Carousel.DIRECTIONS.fwd ? 100 : -100;
    this.carousel.slides[
      this.carousel.prev
    ].style.transform = `translateX(calc(${offsetPrev}% + (${px}px)))`;
    this.carousel.slides[
      this.carousel.cur
    ].style.transform = `translateX(${px}px)`;
    this.carousel.slides[
      this.carousel.next
    ].style.transform = `translateX(calc(${offsetNext}% + (${px}px)))`;
    this.dispatchOffsetChange(px);
  }
}
