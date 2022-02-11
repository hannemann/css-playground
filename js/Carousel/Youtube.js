import { Carousel } from "./index.js";

const src = "https://www.youtube.com/iframe_api";
let apiReady = false;

const apiLoaded = new Promise((resolve, reject) => {
  document.addEventListener("carousel-yt-api-loaded", () => {
    apiReady = true;
    resolve();
  });
});

window.onYouTubeIframeAPIReady = function () {
  document.dispatchEvent(new CustomEvent("carousel-yt-api-loaded"));
};
/**
 * possible data attributes:
 * data-autoplay: start video if cur is player
 */
export class CarouselYoutube {
  /**
   * obtain iframe selector
   * @returns {String}
   * @private
   */
  static get iframeSelector() {
    return 'iframe[src*="//www.youtube.com/embed"], iframe[src*="//www.youtube-nocookie.com/embed"]';
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
    this.initAutoplay().initObserver().initPlayers().initListeners();
  }

  /**
   * initialize autoplay
   * @returns {CarouselYoutube}
   */
  initAutoplay() {
    this.autoplay = typeof this.carousel.el.dataset.autoplay !== "undefined";
    return this;
  }

  /**
   * initialize observers
   * @returns {CarouselYoutube}
   * @private
   */
  initObserver() {
    this.observer = new MutationObserver((mutations) => {
      mutations.forEach((m) => {
        if (m.attributeName === "data-autoplay") {
          this.initAutoplay();
        }
      });
    });

    this.observer.observe(this.carousel.el, { attributes: true });
    return this;
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
    this.carousel.slider.addEventListener(
      "pointerdown",
      (e) => (this.pointerStart = e.pageX)
    );
    this.carousel.slider.addEventListener(
      "pointerup",
      this.handleClick.bind(this)
    );
  }

  /**
   * pause all players and if current slide is player start
   * @param {Carousel.eventData} e
   */
  handleSlideEnd(e) {
    const cur = this.carousel.slides[e.detail.cur];
    const p = cur.querySelector(CarouselYoutube.iframeSelector);
    let videoId;
    Object.values(this.players).forEach((p) => p.pauseVideo());
    if (p) {
      videoId = this.getVideoIdFromSrc(p.src);
      if (this.autoplay && videoId) {
        this.players[videoId].playVideo();
      }
    }
  }

  handleClick(e) {
    if (e.pageX !== this.pointerStart) return;
    const data = this.carousel.eventData;
    const cur = this.carousel.slides[data.cur];
    const p = cur.querySelector(CarouselYoutube.iframeSelector);
    let videoId;
    Object.values(this.players).forEach((p) => p.pauseVideo());
    if (p) {
      videoId = this.getVideoIdFromSrc(p.src);
      if (videoId) {
        if (this.players[videoId].getPlayerState() === 1) {
          this.players[videoId].pauseVideo();
        } else {
          this.players[videoId].playVideo();
        }
      }
    }
  }

  /**
   * obtain vieo id from src attribute value
   * @param {String} src
   */
  getVideoIdFromSrc(src) {
    return src.split("?").shift().split("/").pop();
  }

  /**
   * obtain autoplay state
   * @return {Boolean}
   */
  get autoplay() {
    const autoPlay = this.carousel.el.style.getPropertyValue("--autoplay");
    return autoPlay === "1";
  }

  /**
   * set autoplay state
   * @private
   */
  set autoplay(a) {
    this.carousel.el.style.setProperty("--autoplay", a === true ? 1 : 0);
  }
}
