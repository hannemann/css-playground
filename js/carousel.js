const SELECTORS = {
  controls: ".carousel-controls",
  slides: ":scope > *",
  btnBack: ":scope > span:first-of-type",
  btnFwd: ":scope > span:last-of-type",
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
    this.duration = options.duration;
    this.timingFuntion = options.timingFunction;
    this.initSlides();
    if (this.slides.length > 1) {
      this.initObserver();
      this.controls = new controlsClass(this);
    }
  }

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

  back() {
    if (this.moving) return;
    this.dir = DIRECTIONS.back;
    this.move();
  }

  fwd() {
    if (this.moving) return;
    this.dir = DIRECTIONS.fwd;
    this.move();
  }

  move() {
    this.prepare().setCur().setNext().setPrev().apply();
  }

  prepare() {
    this.slides[this.prev].classList.remove(CLASSNAMES.prev);
    this.slides[this.cur].classList.remove(CLASSNAMES.cur);
    this.slides[this.next].classList.remove(CLASSNAMES.next);
    return this;
  }

  apply() {
    this.moving = true;
    this.slides[this.prev].classList.add(CLASSNAMES.prev);
    this.slides[this.cur].classList.add(CLASSNAMES.cur);
    this.slides[this.next].classList.add(CLASSNAMES.next);
  }

  setCur(n) {
    if (this.dir === DIRECTIONS.fwd) {
      this.cur = this.cur + 1 > this.max ? 0 : this.cur + 1;
    } else {
      this.cur = this.cur - 1 < 0 ? this.max : this.cur - 1;
    }
    return this;
  }

  setNext() {
    if (this.dir === DIRECTIONS.fwd) {
      this.next = this.cur + 1 > this.max ? 0 : this.cur + 1;
    } else {
      this.next = this.cur - 1 < 0 ? this.max : this.cur - 1;
    }
    return this;
  }

  setPrev() {
    if (this.dir === DIRECTIONS.fwd) {
      this.prev = this.cur - 1 < 0 ? this.max : this.cur - 1;
    } else {
      this.prev = this.cur + 1 > this.max ? 0 : this.cur + 1;
    }
    return this;
  }

  set dir(d) {
    this.el.style.setProperty("--move", d);
  }

  get dir() {
    return parseInt(this.el.style.getPropertyValue("--move"));
  }

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

  get moving() {
    return this.el.classList.contains(CLASSNAMES.moving);
  }

  set duration(d) {
    this.el.style.setProperty("--duration", `${parseInt(d, 10)}ms`);
  }

  get duration() {
    return parseInt(this.el.style.getPropertyValue("--duration"), 10);
  }

  set timingFuntion(fn) {
    this.el.style.setProperty("--timing-function", fn);
  }

  get timingFuntion() {
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
    return this;
  }
}

new Carousel(document.querySelector(".carousel"), CarouselControls);
