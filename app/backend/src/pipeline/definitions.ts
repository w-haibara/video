import { definePipeline } from "./registry";

definePipeline("video", ["probe", "thumbnail", "proxy"]);
definePipeline("image", ["probe", "thumbnail", "image-convert"]);
definePipeline("audio", ["probe"]);
