import { Carousel, DEFAULT_TIMING_FUNCTION } from "./index.js";
import { CarouselPointer } from "./Pointer.js";

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
 * data-auto-pause
 *  if truthy pause auto movement
 */
export class CarouselAutoMove {
  /**
   * @param {Carousel} carousel
   */
  constructor(carousel) {
    this.carousel = carousel;
    if (carousel.slides.length > carousel.visible) {
      this.initObserver().initListeners();
      this.start();
    }
  }

  /**
   * initialize observers
   * @returns {CarouselAutoMove}
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
      Carousel.EVENTS.before,
      this.stop.bind(this)
    );
    this.carousel.el.addEventListener(Carousel.EVENTS.end, () => {
      (!this._hover || this.carousel.el.dataset.autoOnHover) && this.start();
    });
    this.carousel.el.addEventListener(
      CarouselPointer.EVENTS.enter,
      this.pointerEnter.bind(this)
    );
    this.carousel.el.addEventListener(
      CarouselPointer.EVENTS.leave,
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
    if (!this.paused && !this.carousel.moving) {
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
    return i > 0 ? i : 5000;
  }

  /**
   * obtain auto duration
   * @return {Number}
   */
  get duration() {
    const d = parseInt(this.carousel.el.dataset.autoDuration);
    return d > 0 ? d : 1000;
  }

  /**
   * obtain auto timing function
   * @returns {String}
   */
  get timingFunction() {
    let timingFunction = this.carousel.el.dataset.autoTimingFunction;
    const old = this.carousel.el.style.getPropertyValue(
      DEFAULT_TIMING_FUNCTION
    );
    this.carousel.el.style.setProperty(DEFAULT_TIMING_FUNCTION, timingFunction);
    if (
      timingFunction !==
      this.carousel.el.style.getPropertyValue(DEFAULT_TIMING_FUNCTION)
    ) {
      timingFunction = "ease-in-out";
    }
    this.carousel.el.style.setProperty(DEFAULT_TIMING_FUNCTION, old);
    return timingFunction;
  }

  /**
   * obtain paused status
   */
  get paused() {
    return typeof this.carousel.el.dataset.autoPause !== "undefined";
  }
}
