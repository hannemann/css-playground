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

class Carousel {
  constructor(el, options = { timingFunction: "ease-in-out", duration: 250 }) {
    this.el = el;
    this.slider = this.el.querySelector(SELECTORS.slider);
    this.duration = this.defaultDuration = options.duration;
    this.timingFunction = this.defaultTimingFunction = options.timingFunction;
    this.initSlides();
    if (this.slides.length > 1) {
      this.dir = DIRECTIONS.fwd;
      this.initPointer().initObserver();
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
    this.prev = this.slides.findIndex((s) =>
      s.classList.contains(CLASSNAMES.prev)
    );
    this.cur = this.slides.findIndex((s) =>
      s.classList.contains(CLASSNAMES.cur)
    );
    this.next = this.slides.findIndex((s) =>
      s.classList.contains(CLASSNAMES.next)
    );
    return this;
  }

  /**
   * initialize pointer events
   * @returns {Carousel}
   * @private
   */
  initPointer() {
    this.pointerStart = null;
    this.slider.addEventListener("pointerdown", this.pointerDown.bind(this));
    this.slider.addEventListener("pointermove", this.pointerMove.bind(this));
    this.slider.addEventListener("pointerup", this.pointerUp.bind(this));
    this.slider.addEventListener("pointerleave", this.pointerUp.bind(this));
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
   * handle pointerdown event
   * @param {PointerEvent} e
   * @private
   */
  pointerDown(e) {
    e.preventDefault();
    this.pointerStart = e.pageX;
    this.transition = false;
  }

  /**
   * handle pointer move event
   * @param {PonterEvent} e
   * @private
   */
  pointerMove(e) {
    if (this.pointerStart) {
      e.preventDefault();
      const delta = e.pageX - this.pointerStart;
      if (Math.abs(delta) > 0) {
        this.dir = delta > 0 ? DIRECTIONS.back : DIRECTIONS.fwd;
        this.setPrev().setNext();
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
    this.transition = true;
    if (this.slides[this.cur].style.transform !== "") {
      this.slides[this.prev].style.transform = "";
      this.slides[this.cur].style.transform = "";
      this.slides[this.next].style.transform = "";
      if (e.pageX - this.pointerStart > 0) {
        this.back();
      } else {
        this.fwd();
      }
    }
    this.pointerStart = null;
  }

  /**
   * move backward
   * @public
   */
  back() {
    if (this.moving) return;
    this.dir = DIRECTIONS.back;
    this.move();
  }

  /**
   * move forward
   * @public
   */
  fwd() {
    if (this.moving) return;
    this.dir = DIRECTIONS.fwd;
    this.move();
  }

  /**
   * goto slide with index of n
   * @param {Number} n index of slide to go to
   * @public
   */
  goto(n) {
    if (n !== this.cur) {
      this.dir = n > this.cur ? DIRECTIONS.fwd : DIRECTIONS.back;
      this.duration = 60;
      this.timingFunction = "linear";
      this.moveRecursive(n);
    }
  }

  /**
   * recursivly move until desired index is reached
   * @param {Number} n goto slide with index of n
   * @private
   */
  moveRecursive(n) {
    const next = this.dir === DIRECTIONS.fwd ? this.cur + 1 : this.cur - 1;
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
    this.moving = true;
    this.setCur().setNext().setPrev();
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
   * @param {Number} offset
   */
  dispatchTransitionChange() {
    this.el.dispatchEvent(
      new CustomEvent("slider-transitionchange", {
        detail: this.eventData,
      })
    );
  }

  /**
   * dispatch transition end event
   * @param {Number} offset
   */
  dispatchTransitionEnd() {
    this.el.dispatchEvent(
      new CustomEvent("slider-transitionend", {
        detail: this.eventData,
      })
    );
  }

  /**
   * dispatch offset change event
   * @param {Number} offset
   */
  dispatchOffsetChange(offset) {
    this.el.dispatchEvent(
      new CustomEvent("slider-offsetchange", {
        detail: Object.assign(this.eventData, { offset }),
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
   * @property {Number} transitionduration
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
      transitionduration: this.duration,
      transitionTimingFunction: this.timingFunction,
      transitionProperty: this.el.style.getPropertyValue(
        "--transition-property"
      ),
    };
  }

  /**
   * @returns {Number}
   */
  get prev() {
    return parseInt(this.el.style.getPropertyValue("--previous"));
  }

  /**
   * @param {Number} c
   */
  set prev(c) {
    this.el.style.setProperty("--previous", c);
  }

  /**
   * @returns {Number}
   */
  get cur() {
    return parseInt(this.el.style.getPropertyValue("--current"));
  }

  /**
   * @param {Number} c
   */
  set cur(c) {
    this.el.style.setProperty("--current", c);
  }

  /**
   * @returns {Number}
   */
  get next() {
    return parseInt(this.el.style.getPropertyValue("--next"));
  }

  /**
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
   * @returns {Number}
   * @private
   */
  get dir() {
    return parseInt(this.el.style.getPropertyValue("--move"));
  }

  /**
   * @param {Boolean} m
   * @private
   */
  set moving(m) {
    if (m) {
      this.slides[this.cur].addEventListener(
        "transitionend",
        () => {
          this.moving = false;
          this.dispatchTransitionEnd();
        },
        { once: true }
      );
    }
    this.el.classList.toggle(CLASSNAMES.moving, m);
  }

  /**
   * @returns {Boolean}
   * @private
   */
  get moving() {
    return this.el.classList.contains(CLASSNAMES.moving);
  }

  /**
   * @param {NUmber} d transition duration in ms
   * @private
   */
  set duration(d) {
    this.el.style.setProperty("--duration", `${parseInt(d, 10)}ms`);
    this.dispatchTransitionChange();
  }

  /**
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
   * @returns {String}
   * @private
   */
  get timingFunction() {
    return this.el.style.getPropertyValue("--timing-function");
  }

  /**
   * @param {Boolean} t
   * @private
   */
  set transition(t) {
    t = typeof t === "boolean" && t;
    this.el.style.setProperty("--transition-property", t ? "" : "none");
    this.dispatchTransitionChange();
  }

  /**
   * @returns {Boolean}
   * @private
   */
  get transition() {
    return (
      this.el.style.getPropertyValue("--transition-property") !== "none"
    );
  }

  /**
   * set pixel based offset
   * @param {Number} px number of pixels
   * @private
   */
  set pxOffset(px) {
    // hint: prev and next exchange their position if direction changes
    const offsetPrev = this.dir === DIRECTIONS.fwd ? -100 : 100;
    const offsetNext = this.dir === DIRECTIONS.fwd ? 100 : -100;
    this.slides[
      this.prev
    ].style.transform = `translateX(calc(${offsetPrev}% + (${px}px)))`;
    this.slides[this.cur].style.transform = `translateX(${px}px)`;
    this.slides[
      this.next
    ].style.transform = `translateX(calc(${offsetNext}% + (${px}px)))`;
    this.dispatchOffsetChange(px);
  }
}

class CarouselControls {
  constructor(carousel) {
    this.el = document.querySelector(SELECTORS.controls);
    this.carousel = carousel;
    this.initListeners();

    // this.carousel.el.addEventListener("slider-offsetchange", console.log);
    // this.carousel.el.addEventListener("slider-transitionchange", console.log);
    // this.carousel.el.addEventListener("slider-transitionend", (e) => {
    //   this.el.querySelector(".cur").classList.remove("cur");
    //   this.el
    //     .querySelector(`[data-slide="${e.detail.cur}"]`)
    //     .classList.add("cur");
    // });
  }

  initListeners() {
    this.el
      .querySelector(SELECTORS.btnBack)
      .addEventListener("click", () => this.carousel.back());
    this.el
      .querySelector(SELECTORS.btnFwd)
      .addEventListener("click", () => this.carousel.fwd());
    this.el.querySelectorAll(SELECTORS.btnGoto).forEach((b) => {
      b.addEventListener("click", () => {
        this.carousel.goto(parseInt(b.dataset.slide));
      });
    });
    return this;
  }
}

s = new Carousel(document.querySelector(".carousel"));
c = new CarouselControls(s);
