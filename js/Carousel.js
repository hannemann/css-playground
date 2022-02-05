const SELECTORS = {
  slider: ":scope > .slides",
  slides: ":scope > .slides > *",
  controls: ".carousel-controls",
  btnBack: ":scope > span:first-of-type",
  btnFwd: ":scope > span:last-of-type",
  btnGoto: ":scope > span.goto",
};

const CLASSNAMES = {
  prev: "prev",
  cur: "cur",
  next: "next",
  moving: "moving",
};

const DIRECTIONS = {
  back: -1,
  fwd: 1,
};

/**
 * possible data attributes:
 * data-current: set index of slide to move to
 *
 * Minimal Structure:
 *
 * .carousel>.slides>.slide*n
 */
class Carousel {
  /**
   *
   * @param {HTMLElement} el The carousel wrapper element
   */
  constructor(el) {
    this.el = el;
    this.slider = this.el.querySelector(SELECTORS.slider);
    this.duration = this.defaultDuration = this.el.dataset.duration || 250;
    this.timingFunction = this.defaultTimingFunction =
      this.el.dataset.timingFunction || "ease-in-out";
    this.initSlides();
    if (this.slides.length > 1) {
      this.dir = DIRECTIONS.fwd;
      this.initObserver();
    }
  }

  /**
   * initialize slides
   * @returns {Carousel}
   * @private
   */
  initSlides() {
    this.slides = Array.from(this.el.querySelectorAll(SELECTORS.slides));
    this.max = this.slides.length - 1;
    this.el.style.setProperty("--item-count", this.slides.length);
    this.prev = this.max;
    this.cur = 0;
    this.next = 1;
    this.slides[this.prev].classList.add(CLASSNAMES.prev);
    this.slides[this.cur].classList.add(CLASSNAMES.cur);
    this.max > 1 && this.slides[this.next].classList.add(CLASSNAMES.next);
    return this;
  }

  /**
   * initialize observers
   * @returns {Carousel}
   * @private
   */
  initObserver() {
    this.observer = new MutationObserver((mutations) => {
      mutations.forEach((m) => {
        if (m.attributeName === "data-current") {
          this.goto(parseInt(this.el.dataset.current, 10));
        }
      });
    });

    this.observer.observe(this.el, { attributes: true });
    return this;
  }

  /**
   * move backward
   * @public
   */
  back() {
    if (this.moving || this.count === 1) return;
    this.dir = DIRECTIONS.back;
    this.move();
  }

  /**
   * move forward
   * @public
   */
  fwd() {
    if (this.moving || this.count === 1) return;
    this.dir = DIRECTIONS.fwd;
    this.move();
  }

  /**
   * goto slide with index of n
   * @param {Number} n index of slide to go to
   * @public
   */
  goto(n) {
    if (this.moving || this.count === 1) return;
    if (n !== this.cur) {
      this.dir = n > this.cur ? DIRECTIONS.fwd : DIRECTIONS.back;
      this.moveRecursive(n);
    }
  }

  /**
   * recursively move until desired index is reached
   * @param {Number} n goto slide with index of n
   * @private
   */
  moveRecursive(n) {
    const next = this.dir === DIRECTIONS.fwd ? this.cur + 1 : this.cur - 1;
    this.duration = 60;
    this.timingFunction = "linear";
    if (next !== n) {
      this.slides[this.cur].addEventListener(
        "transitionend",
        () => {
          requestAnimationFrame(() => this.moveRecursive(n));
        },
        { once: true }
      );
    } else {
      this.slides[this.cur].addEventListener(
        "transitionend",
        () => {
          this.timingFunction = this.defaultTimingFunction;
        },
        { once: true }
      );
      // this.step ist the last one so we ease-out the transition and reset the duration
      this.timingFunction = "ease-out";
      this.duration = this.defaultDuration;
    }
    this.move();
  }

  /**
   * move slides
   * @private
   */
  move() {
    this.dispatchTransitionBefore();
    this.moving = true;
    if (this.max === 1) {
      this.transition = false;
      requestAnimationFrame(() => {
        this.slides[this.next].classList.remove(CLASSNAMES.next);
        requestAnimationFrame(() => {
          this.transition = true;
          this.setCur().setNext().setPrev();
          this.dispatchTransitionStart();
        });
      });
    } else {
      this.setCur().setNext().setPrev();
      this.dispatchTransitionStart();
    }
  }

  /**
   * determine the cur slide
   * @returns {Carousel}
   * @private
   */
  setCur() {
    this.slides[this.cur].classList.remove(CLASSNAMES.cur);
    if (this.dir === DIRECTIONS.fwd) {
      this.cur = this.cur + 1 > this.max ? 0 : this.cur + 1;
    } else {
      this.cur = this.cur - 1 < 0 ? this.max : this.cur - 1;
    }
    this.slides[this.cur].classList.add(CLASSNAMES.cur);
    return this;
  }

  /**
   * determine the next slide
   * @returns {Carousel}
   * @private
   */
  setNext() {
    this.slides[this.next].classList.remove(CLASSNAMES.next);
    if (this.dir === DIRECTIONS.fwd) {
      this.next = this.cur + 1 > this.max ? 0 : this.cur + 1;
    } else {
      this.next = this.cur - 1 < 0 ? this.max : this.cur - 1;
    }
    this.slides[this.next].classList.add(CLASSNAMES.next);
    return this;
  }

  /**
   * determine the prev slide
   * @returns {Carousel}
   * @private
   */
  setPrev() {
    this.slides[this.prev].classList.remove(CLASSNAMES.prev);
    if (this.dir === DIRECTIONS.fwd) {
      this.prev = this.cur - 1 < 0 ? this.max : this.cur - 1;
    } else {
      this.prev = this.cur + 1 > this.max ? 0 : this.cur + 1;
    }
    this.slides[this.prev].classList.add(CLASSNAMES.prev);
    return this;
  }

  /**
   * dispatch transition change event
   */
  dispatchTransitionChange() {
    this.el.dispatchEvent(
      new CustomEvent("slider-transitionchange", {
        detail: this.eventData,
      })
    );
  }

  /**
   * dispatch transition start event
   */
  dispatchTransitionBefore() {
    this.el.dispatchEvent(
      new CustomEvent("slider-transitionbefore", {
        detail: this.eventData,
      })
    );
  }

  /**
   * dispatch transition start event
   */
  dispatchTransitionStart() {
    this.el.dispatchEvent(
      new CustomEvent("slider-transitionstart", {
        detail: this.eventData,
      })
    );
  }

  /**
   * dispatch transition end event
   */
  dispatchTransitionEnd() {
    this.el.dispatchEvent(
      new CustomEvent("slider-transitionend", {
        detail: this.eventData,
      })
    );
  }

  /**
   * @typedef {Object} SliderEventData
   * @property {Number} prev
   * @property {Number} cur
   * @property {Number} next
   * @property {Number} dir
   * @property {Number} offset
   * @property {Number} transitionDuration
   * @property {String} transitionTimingFunction
   * @property {String} transitionProperty
   *
   * obtain event details object
   * @returns {SliderEventData}
   */
  get eventData() {
    return {
      prev: this.prev,
      cur: this.cur,
      next: this.next,
      dir: this.dir,
      offset: 0,
      transitionDuration: this.duration,
      transitionTimingFunction: this.timingFunction,
      transitionProperty: this.el.style.getPropertyValue(
        "--transition-property"
      ),
    };
  }

  /**
   * obtain index of previous slide
   * @returns {Number}
   */
  get prev() {
    return parseInt(this.el.style.getPropertyValue("--previous"));
  }

  /**
   * set index of previous slide
   * @param {Number} c
   */
  set prev(c) {
    this.el.style.setProperty("--previous", c);
  }

  /**
   * obtain index of current slide
   * @returns {Number}
   */
  get cur() {
    return parseInt(this.el.style.getPropertyValue("--current"));
  }

  /**
   * set index of current slide
   * @param {Number} c
   */
  set cur(c) {
    this.el.style.setProperty("--current", c);
  }

  /**
   * obtain index of next slide
   * @returns {Number}
   */
  get next() {
    return parseInt(this.el.style.getPropertyValue("--next"));
  }

  /**
   * set index of next slide
   * @param {Number} c
   */
  set next(c) {
    this.el.style.setProperty("--next", c);
  }

  /**
   * @param {Number} d 1: fwd, -1: back
   * @private
   */
  set dir(d) {
    this.el.style.setProperty("--move", d);
  }

  /**
   * obtain direction (-1 = back, 1 = fwd)
   * @returns {Number}
   * @private
   */
  get dir() {
    return parseInt(this.el.style.getPropertyValue("--move"));
  }

  /**
   * indicate slider is moving or not
   * @param {Boolean} m
   * @private
   */
  set moving(m) {
    if (m) {
      const reset = () => {
        this.duration = this.defaultDuration;
        this.timingFunction = this.defaultTimingFunction;
        this.moving = false;
        this.dispatchTransitionEnd();
      };
      this.slides[this.cur].addEventListener(
        "transitionend",
        () => {
          if (this.max === 1) {
            this.transition = false;
            requestAnimationFrame(() => {
              this.slides[this.next].classList.remove(CLASSNAMES.next);
              requestAnimationFrame(() => {
                this.transition = true;
                reset();
              });
            });
          } else {
            reset();
          }
        },
        { once: true }
      );
    }
    this.el.classList.toggle(CLASSNAMES.moving, m);
  }

  /**
   * is slider moving?
   * @returns {Boolean}
   * @private
   */
  get moving() {
    return this.el.classList.contains(CLASSNAMES.moving);
  }

  /**
   * @param {Number} d transition duration in ms
   * @private
   */
  set duration(d) {
    this.el.style.setProperty("--duration", `${d}ms`);
    this.dispatchTransitionChange();
  }

  /**
   * obtain current duration
   * @returns {Number}
   * @private
   */
  get duration() {
    return parseInt(this.el.style.getPropertyValue("--duration"), 10);
  }

  /**
   * @param {String} fn string representing the timing function
   * @private
   */
  set timingFunction(fn) {
    this.el.style.setProperty("--timing-function", fn);
    this.dispatchTransitionChange();
  }

  /**
   * obtain current timing function
   * @returns {String}
   * @private
   */
  get timingFunction() {
    return this.el.style.getPropertyValue("--timing-function");
  }

  /**
   * en-/disable transition
   * @param {Boolean} t
   * @private
   */
  set transition(t) {
    t = typeof t === "boolean" && t;
    this.el.style.setProperty("--transition-property", t ? "" : "none");
    this.dispatchTransitionChange();
  }

  /**
   * is transition enabled?
   * @returns {Boolean}
   * @private
   */
  get transition() {
    return this.el.style.getPropertyValue("--transition-property") !== "none";
  }
}

class CarouselControls {
  constructor(carousel) {
    this.el = document.querySelector(SELECTORS.controls);
    this.indicator = this.el.querySelector(SELECTORS.controlsIndicator);
    this.carousel = carousel;
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

s = new Carousel(document.querySelector(".carousel"));
a = new CarouselPointer(s);
a = new CarouselAutoMove(s);
c = new CarouselControls(s);
