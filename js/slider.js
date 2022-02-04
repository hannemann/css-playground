class Slider {

    constructor(el) {
        this.el = el;
        this.btnBack = document.querySelector(".buttons *:first-child");
        this.btnFwd = document.querySelector(".buttons *:last-child");
        this.current = 0;
        this.max = this.el.querySelectorAll('.slides > *').length - 2;
        this.btnBack.addEventListener('click', e => this.current = Math.max(this.current - 1, 0));
        this.btnFwd.addEventListener('click', e => this.current = Math.min(this.current + 1, this.max));
    }

    set current(c) {
        this.el.style.setProperty("--current", c);
    }

    get current() {
        return parseInt(this.el.style.getPropertyValue("--current"));
    }

}

const s = new Slider(document.querySelector('.slider'));