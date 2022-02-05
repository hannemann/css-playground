class CarouselAutoMove {
  /**
   * @param {Carousel} carousel
   */
  constructor(carousel) {
    this.carousel = carousel;
    this.init();
  }

  /**
   * initialize auto slide
   */
  init() {
    this.initObserver().initListeners();
    if (this.interval) {
      this.carousel.el.addEventListener(
        "slider-transitionbefore",
        this.stop.bind(this)
      );
      this.carousel.el.addEventListener("slider-transitionend", () => {
        (!this._hover || this.carousel.el.dataset.autoOnHover) && this.start();
      });
      this.start();
    }
    return this;
  }

  /**
   * initialize observers
   * @returns {CarouselAutoMove}
   * @private
   */
  initObserver() {
    this.observer = new MutationObserver((mutations) => {
      mutations.forEach((m) => {
        if (m.attributeName === "data-auto-interval") {
          this.interval = parseInt(this.carousel.el.dataset.autoInterval);
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
    if (this.interval) {
      this._autoSlideInterval = setTimeout(() => {
        if (!this.carousel.moving) {
          const duration = parseInt(this.carousel.el.dataset.autoDuration);
          const timingFunction = this.carousel.el.dataset.autoTimingFunction;
          if (typeof duration === "number" && duration > 0) {
            this.duration = duration;
          }
          if (timingFunction) {
            this.timingFunction = timingFunction;
          }
          this.carousel.dir = DIRECTIONS.fwd;
          this.carousel.move();
          this.carousel.slides[this.carousel.cur].addEventListener(
            "transitionend",
            () => {
              this.duration = this.carousel.defaultDuration;
              this.timingFunction = this.carousel.defaultTimingFunction;
            },
            { once: true }
          );
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
   * @returns {Number}
   */
  get interval() {
    const i = parseInt(this.carousel.el.dataset.autoInterval);
    return typeof i === "number" && i > 0 ? i : undefined;
  }

  /**
   * @param {Number} i
   */
  set interval(i) {
    if (typeof i === "number" && i > 0) {
      if (this.interval !== i) {
        this.carousel.el.dataset.autoInterval = i.toString();
      } else if (this.interval) {
        this.stop();
        this.start();
      }
    } else {
      delete this.carousel.el.dataset.autoInterval;
      this.stop();
    }
  }

  /**
   * obtain transition duration
   */
  get duration() {
    return this.carousel.duration;
  }

  /**
   * set transition duration
   * @param {Number} d
   */
  set duration(d) {
    this.carousel.duration = d;
  }

  /**
   * obtain transition timing function
   */
  get timingFunction() {
    return this.carousel.timingFunction;
  }

  /**
   * set transition timing function
   * @param {String} t
   */
  set timingFunction(t) {
    this.carousel.timingFunction = t;
  }
}
