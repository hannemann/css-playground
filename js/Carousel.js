import { Carousel } from "./Carousel/index.js";
import { CarouselControls } from "./Carousel/Controls.js";
import { CarouselAutoMove } from "./Carousel/AutoMove.js";
import { CarouselPointer } from "./Carousel/Pointer.js";
import { CarouselYoutube } from "./Carousel/Youtube.js";

const cm = new Carousel(document.querySelector(".carousel-multi"));
new CarouselPointer(cm);
new CarouselControls(cm);
// new CarouselYoutube(cm);

const c = new Carousel(document.querySelector(".carousel-standard"));
new CarouselPointer(c);
new CarouselControls(c);
new CarouselYoutube(c);

const ca = new Carousel(document.querySelector(".carousel-auto"));
new CarouselPointer(ca);
new CarouselControls(ca);
new CarouselAutoMove(ca);

const ct = new Carousel(document.querySelector(".carousel-two"));
new CarouselPointer(ct);
new CarouselControls(ct);
new CarouselAutoMove(ct);

const co = new Carousel(document.querySelector(".carousel-one"));
new CarouselPointer(co);
new CarouselControls(co);
new CarouselAutoMove(co);
