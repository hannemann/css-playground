const SELECTORS = {
  controls: ".carousel-controls",
  slides: ":scope > *",
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
  constructor(
    el,
    controlsClass,
    options = { timingFunction: "ease-in-out", duration: 250 }
  ) {
    this.el = el;
    this.duration = this.defaultDuration = options.duration;
    this.timingFunction = this.defaultTimingFunction = options.timingFunction;
    this.pointer = null;
    this.initBounds().initSlides();
    if (this.slides.length > 1) {
      this.initListeners().initObserver();
      this.controls = new controlsClass(this);
    }
  }

  /**
   * remember bounds of elements
   * @returns {Carousel}
   */
  initBounds() {
    this.bounds = {
      el: this.el.getBoundingClientRect(),
    };
    return this;
  }

  /**
   * initialize slides
   * @returns {Carousel}
   */
  initSlides() {
    this.slides = Array.from(this.el.querySelectorAll(SELECTORS.slides));
    this.prev = this.slides.findIndex((s) =>
      s.classList.contains(CLASSNAMES.prev)
    );
    this.cur = this.slides.findIndex((s) =>
      s.classList.contains(CLASSNAMES.cur)
    );
    this.next = this.slides.findIndex((s) =>
      s.classList.contains(CLASSNAMES.next)
    );
    this.max = this.slides.length - 1;
    return this;
  }

  initListeners() {
    this.el.addEventListener("pointerdown", (e) => {
      e.preventDefault();
      this.pointerStart = e.pageX;
      this.el.style.setProperty('--transition-property', 'none');
    });

    this.el.addEventListener("pointermove", (e) => {
      if (this.pointerStart) {
        e.preventDefault();
        const delta = e.pageX - this.pointerStart;
        this.dir = delta > 0 ? DIRECTIONS.back : DIRECTIONS.fwd;

        this.slides[this.prev].classList.remove(CLASSNAMES.prev);
        this.slides[this.next].classList.remove(CLASSNAMES.next);
        this.setPrev().setNext();
        this.slides[this.prev].classList.add(CLASSNAMES.prev);
        this.slides[this.next].classList.add(CLASSNAMES.next);
  

        let offset = this.dir === DIRECTIONS.fwd ? -100 : 100;
        this.slides[this.prev].style.transform = `translateX(calc(${offset}% + (${delta}px)))`;
        this.slides[this.cur].style.transform = `translateX(${delta}px)`;
        offset = this.dir === DIRECTIONS.fwd ? 100 : -100;
        this.slides[this.next].style.transform = `translateX(calc(${offset}% + (${delta}px)))`;
      }
    });

    this.el.addEventListener("pointerup", (e) => {
      e.preventDefault();
      this.el.style.setProperty('--transition-property', '');
      this.slides[this.prev].style.transform = '';
      this.slides[this.cur].style.transform = '';
      this.slides[this.next].style.transform = '';
      if (e.pageX - this.pointerStart > 0) {
        this.back();
      } else {
        this.fwd();
      }
      this.pointerStart = null;
    });
    return this;
  }

  /**
   * initialize observers
   * @returns {Carousel}
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
   */
  back() {
    if (this.moving) return;
    this.dir = DIRECTIONS.back;
    this.move();
  }

  /**
   * move forward
   */
  fwd() {
    if (this.moving) return;
    this.dir = DIRECTIONS.fwd;
    this.move();
  }

  /**
   * goto slide with index of n
   * @param {Number} n index of slide to go to
   */
  goto(n) {
    if (n !== this.cur) {
      this.dir = n > this.cur ? DIRECTIONS.fwd : DIRECTIONS.back;
      this.oldDuration = this.duration;
      this.oldTimingFunction = this.timingFunction;
      this.duration = 60;
      this.timingFunction = "linear";
      this.moveRecursive(n);
    }
  }

  /**
   * recursivly move until desired index is reached
   * @param {Number} n goto slide with index of n
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
          this.timingFunction = this.oldTimingFunction;
        },
        { once: true }
      );
      // last slide is next one
      this.timingFunction = "ease-out";
      this.duration = this.oldDuration;
    }
    this.move();
  }

  /**
   * move slides
   */
  move() {
    this.prepare().setCur().setNext().setPrev().apply();
  }

  /**
   * remove classes from slides
   * @returns {Carousel}
   */
  prepare() {
    this.slides[this.prev].classList.remove(CLASSNAMES.prev);
    this.slides[this.cur].classList.remove(CLASSNAMES.cur);
    this.slides[this.next].classList.remove(CLASSNAMES.next);
    return this;
  }

  /**
   * apply classes to slides
   * @returns {Carousel}
   */
  apply() {
    this.moving = true;
    this.slides[this.prev].classList.add(CLASSNAMES.prev);
    this.slides[this.cur].classList.add(CLASSNAMES.cur);
    this.slides[this.next].classList.add(CLASSNAMES.next);
  }

  /**
   * determine the cur slide
   * @returns {Carousel}
   */
  setCur() {
    if (this.dir === DIRECTIONS.fwd) {
      this.cur = this.cur + 1 > this.max ? 0 : this.cur + 1;
    } else {
      this.cur = this.cur - 1 < 0 ? this.max : this.cur - 1;
    }
    return this;
  }

  /**
   * determine the next slide
   * @returns {Carousel}
   */
  setNext() {
    if (this.dir === DIRECTIONS.fwd) {
      this.next = this.cur + 1 > this.max ? 0 : this.cur + 1;
    } else {
      this.next = this.cur - 1 < 0 ? this.max : this.cur - 1;
    }
    return this;
  }

  /**
   * determine the prev slide
   * @returns {Carousel}
   */
  setPrev() {
    if (this.dir === DIRECTIONS.fwd) {
      this.prev = this.cur - 1 < 0 ? this.max : this.cur - 1;
    } else {
      this.prev = this.cur + 1 > this.max ? 0 : this.cur + 1;
    }
    return this;
  }

  /**
   * @param {Number} d 1: fwd, -1: back
   */
  set dir(d) {
    this.el.style.setProperty("--move", d);
  }

  /**
   * @returns {Number}
   */
  get dir() {
    return parseInt(this.el.style.getPropertyValue("--move"));
  }

  /**
   * @param {Boolean} m
   */
  set moving(m) {
    if (m) {
      this.slides[this.cur].addEventListener(
        "transitionend",
        () => (this.moving = false),
        { once: true }
      );
    }
    this.el.classList.toggle(CLASSNAMES.moving, m);
    this.controls.el.classList.toggle(CLASSNAMES.moving, m);
  }

  /**
   * @returns {Boolean}
   */
  get moving() {
    return this.el.classList.contains(CLASSNAMES.moving);
  }

  /**
   * @param {NUmber} d transition duration in ms
   */
  set duration(d) {
    this.el.style.setProperty("--duration", `${parseInt(d, 10)}ms`);
  }

  /**
   * @returns {Number}
   */
  get duration() {
    return parseInt(this.el.style.getPropertyValue("--duration"), 10);
  }

  /**
   * @param {String} fn string representing the timing function
   */
  set timingFunction(fn) {
    this.el.style.setProperty("--timing-function", fn);
  }

  /**
   * @returns {String}
   */
  get timingFunction() {
    return this.el.style.getPropertyValue("--timing-function");
  }
}

class CarouselControls {
  constructor(carousel) {
    this.el = document.querySelector(SELECTORS.controls);
    this.carousel = carousel;
    this.initListeners();
  }

  initListeners() {
    this.el
      .querySelector(SELECTORS.btnBack)
      .addEventListener("click", () => this.carousel.back());
    this.el
      .querySelector(SELECTORS.btnFwd)
      .addEventListener("click", () => this.carousel.fwd());
    this.el.querySelectorAll(SELECTORS.btnGoto).forEach((b) => {
      b.addEventListener("click", (e) => {
        this.carousel.el.dataset.current = b.dataset.slide;
      });
    });
    return this;
  }
}

c = new Carousel(document.querySelector(".carousel"), CarouselControls);
