import { assetDetectorRegistry } from "../asset-detector-registry";
import { extensionDetector } from "./extension-detector";

assetDetectorRegistry.register(extensionDetector);
