const CLASSNAMES = {
  prev: "prev",
  cur: "cur",
  next: "next",
  moving: "moving",
};

class Carousel {
  constructor(el, controls, duration) {
    this.el = el;
    this.controls = controls;
    if (duration) {
      this.el.style.setProperty("--duration", `${parseInt(duration, 10)}ms`);
    }
    this.initControls().initSlides();
  }

  initSlides() {
    this.slides = Array.from(this.el.querySelectorAll(":scope > *"));
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

  initControls() {
    this.controls
      .querySelector("span:first-of-type")
      .addEventListener("click", this.back.bind(this));
    this.controls
      .querySelector("span:last-of-type")
      .addEventListener("click", this.fwd.bind(this));
    return this;
  }

  back() {
    if (this.moving) return;
    this.el.style.setProperty("--move", -1);
    this.prepare();
    this.cur = this.cur - 1 < 0 ? this.max : this.cur - 1;
    this.prev = this.cur + 1 > this.max ? 0 : this.cur + 1;
    this.next = this.cur - 1 < 0 ? this.max : this.cur - 1;
    this.apply();
  }

  fwd() {
    if (this.moving) return;
    this.el.style.setProperty("--move", 1);
    this.prepare();
    this.cur = this.cur + 1 > this.max ? 0 : this.cur + 1;
    this.prev = this.cur - 1 < 0 ? this.max : this.cur - 1;
    this.next = this.cur + 1 > this.max ? 0 : this.cur + 1;
    this.apply();
  }

  prepare() {
    this.moving = true;
    this.slides[this.prev].classList.remove(CLASSNAMES.prev);
    this.slides[this.cur].classList.remove(CLASSNAMES.cur);
    this.slides[this.next].classList.remove(CLASSNAMES.next);
  }

  apply() {
    this.slides[this.cur].addEventListener(
      "transitionend",
      () => (this.moving = false),
      { once: true }
    );
    this.slides[this.prev].classList.add(CLASSNAMES.prev);
    this.slides[this.cur].classList.add(CLASSNAMES.cur);
    this.slides[this.next].classList.add(CLASSNAMES.next);
  }

  set moving(m) {
    this.el.classList.toggle(CLASSNAMES.moving, m);
    this.controls.classList.toggle(CLASSNAMES.moving, m);
  }

  get moving() {
    return this.el.classList.contains(CLASSNAMES.moving);
  }
}

new Carousel(
  document.querySelector(".carousel"),
  document.querySelector(".carousel-controls"),
  250
);
