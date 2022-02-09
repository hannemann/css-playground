import { Carousel } from "./index.js";

const src = "https://www.youtube.com/iframe_api";
let apiReady = false;

const apiLoaded = new Promise((resolve, reject) => {
  document.addEventListener("carousel-yt-api-loaded", () => {
    apiReady = true;
    console.log("Api Loaded");
    resolve();
  });
});

window.onYouTubeIframeAPIReady = function () {
  document.dispatchEvent(new CustomEvent("carousel-yt-api-loaded"));
};

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
    this.initApi().init();
  }

  initApi() {
    if (!apiReady) {
      const script = document.createElement("script");
      script.src = src;
      document.querySelector(":root head").appendChild(script);
    }
    return this;
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
    const tag = cur.tagName;
    let videoId;
    Object.values(this.players).forEach((p) => p.pauseVideo());
    if (tag === "IFRAME" && cur.matches(CarouselYoutube.iframeSelector)) {
      videoId = this.getVideoIdFromSrc(cur.src);
    } else {
      const p = cur.querySelector(CarouselYoutube.iframeSelector);
      if (p) {
        videoId = this.getVideoIdFromSrc(p.src);
      }
    }
    if (videoId) {
      this.players[videoId].playVideo();
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