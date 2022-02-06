/**
 * possible data attributes:
 * data-auto-interval
 *  integer ms sets the auto move interval. delete to stop
 * data-auto-duration
 *  integer ms sets the transition duration of auto movemenet
 * data-auto-timing-function
 *  string sets the transition timing function of auto movemenet
 * data-auto-on-hover
 *  if truthy don't stop auto movement on hover
 * data-auto-dir
 *  auto movement direction, 'back'
 */
class CarouselAutoMove {
  /**
   * @param {Carousel} carousel
   */
  constructor(carousel) {
    this.carousel = carousel;
    this.initObserver().initListeners();
    this.start();
  }

  /**
   * initialize observers
   * @returns {Carousel}
   * @private
   */
  initObserver() {
    this.observer = new MutationObserver((mutations) => {
      mutations.forEach((m) => {
        if (m.attributeName === "data-auto-pause") {
          if (typeof this.carousel.el.dataset.autoPause === "undefined") {
            this.start();
          } else {
            this.stop();
          }
        }
      });
    });

    this.observer.observe(this.carousel.el, { attributes: true });
    return this;
  }

  /**
   * initialize event listeners
   * @returns {CarouselAutoMove}
   * @private
   */
  initListeners() {
    this.carousel.el.addEventListener(
      "slider-transitionbefore",
      this.stop.bind(this)
    );
    this.carousel.el.addEventListener("slider-transitionend", () => {
      (!this._hover || this.carousel.el.dataset.autoOnHover) && this.start();
    });
    this.carousel.el.addEventListener(
      "slider-pointerenter",
      this.pointerEnter.bind(this)
    );
    this.carousel.el.addEventListener(
      "slider-pointerleave",
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
    this._hover = true;
    if (!this.carousel.el.dataset.autoOnHover) {
      this.stop();
    }
  }

  /**
   * handle pointer leave events
   * @param {PointerEvent} e
   * @private
   */
  pointerLeave(e) {
    if (!this.carousel.el.dataset.autoOnHover) {
      this.start();
    }
    delete this._hover;
  }

  /**
   * start auto sliding
   * @private
   */
  start() {
    if (this.interval && !this.paused && !this.carousel.moving) {
      this.stop();
      this._autoSlideInterval = setTimeout(() => {
        if (!this.paused && !this.carousel.moving) {
          this.carousel.duration = this.duration;
          this.carousel.timingFunction = this.timingFunction;
          this.carousel.dir =
            this.carousel.el.dataset.autoDir === "back"
              ? Carousel.DIRECTIONS.back
              : Carousel.DIRECTIONS.fwd;
          this.carousel.move();
        }
      }, this.interval);
    }
  }

  /**
   * stop auto sliding
   * @private
   */
  stop() {
    if (typeof this._autoSlideInterval !== "undefined") {
      clearTimeout(this._autoSlideInterval);
      delete this._autoSlideInterval;
    }
  }

  /**
   * obtain auto interval
   * @returns {Number}
   */
  get interval() {
    const i = parseInt(this.carousel.el.dataset.autoInterval);
    return typeof i === "number" && i > 0 ? i : 5000;
  }

  /**
   * obtain auto duration
   * @return {Number}
   */
  get duration() {
    const d = parseInt(this.carousel.el.dataset.autoDuration);
    return typeof d === "number" && d > 0 ? d : 1000;
  }

  /**
   * obtain auto timing function
   * @returns {String}
   */
  get timingFunction() {
    const property = "transition-timing-function";
    let timingFunction = this.carousel.el.dataset.autoTimingFunction;
    const old = this.carousel.el.style.getPropertyValue(property);
    this.carousel.el.style.setProperty(property, timingFunction);
    if (timingFunction !== this.carousel.el.style.getPropertyValue(property)) {
      timingFunction = "ease-in-out";
    }
    this.carousel.el.style.setProperty(property, old);
    return timingFunction;
  }

  get paused() {
    return typeof this.carousel.el.dataset.autoPause !== "undefined";
  }
}
