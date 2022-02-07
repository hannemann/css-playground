import { Carousel } from "./Carousel/index.js";
import { CarouselControls } from "./Carousel/Controls.js";
import { CarouselAutoMove } from "./Carousel/AutoMove.js";
import { CarouselPointer } from "./Carousel/Pointer.js";

const c = new Carousel(document.querySelector(".carousel"));
new CarouselPointer(c);
new CarouselControls(c);

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
