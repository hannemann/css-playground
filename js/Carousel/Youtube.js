import { Carousel } from "./index.js";

const src = "https://www.youtube.com/iframe_api";

let apiLoaded = new Promise((resolve, reject) => {
  window.onYouTubeIframeAPIReady = function (e) {
    resolve();
  };
});

const script = document.createElement("script");
script.src = src;
document.querySelector(":root head").appendChild(script);

export class CarouselYoutube {
  /**
   * obtain iframe selector
   * @returns {String}
   * @private
   */
  static get iframeSelector() {
    return 'iframe[src*="//www.youtube.com/embed"]';
  }

  constructor(carousel) {
    this.carousel = carousel;
    this.init();
  }

  /**
   * initialize as soon as api is loaded
   */
  async init() {
    await apiLoaded;
    this.initPlayers().initListeners();
  }

  /**
   * initialize players
   * @returns {CarouselYoutube}
   * @private
   */
  initPlayers() {
    this.players = {};
    this.carousel.slider
      .querySelectorAll(CarouselYoutube.iframeSelector)
      .forEach((s) => {
        const videoId = this.getVideoIdFromSrc(s.src);
        this.players[videoId] = new YT.Player(s, {
          videoId: videoId,
        });
        const idx = this.carousel.slides.findIndex((i) => i.id === s.id);
        this.carousel.slides[idx] = this.carousel.slider.querySelector(
          `#${s.id}`
        );
      });
    return this;
  }

  /**
   * initialize event listeners
   * @returns {CarouselYoutube}
   * @private
   */
  initListeners() {
    this.carousel.el.addEventListener(
      Carousel.EVENTS.end,
      this.handleSlideEnd.bind(this)
    );
  }

  /**
   * pause all players and if current slide is player start
   * @param {Carousel.eventData} e
   */
  handleSlideEnd(e) {
    const cur = this.carousel.slides[e.detail.cur];
    Object.values(this.players).forEach((p) => p.pauseVideo());
    if (cur.matches(CarouselYoutube.iframeSelector)) {
      this.players[this.getVideoIdFromSrc(cur.src)].playVideo();
    }
  }

  /**
   * obtain vieo id from src attribute value
   * @param {String} src
   */
  getVideoIdFromSrc(src) {
    return src.split("?").shift().split("/").pop();
  }
}
