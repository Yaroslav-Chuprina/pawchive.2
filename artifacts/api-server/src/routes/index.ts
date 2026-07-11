import { Router, type IRouter } from "express";
import healthRouter from "./health";
import postsRouter from "./posts";
import mediaRouter from "./media";
import scannerRouter from "./scanner";
import downloadsRouter from "./downloads";
import libraryRouter from "./library";
import settingsRouter from "./settings";

const router: IRouter = Router();

router.use(healthRouter);
router.use(postsRouter);
router.use(mediaRouter);
router.use(scannerRouter);
router.use(downloadsRouter);
router.use(libraryRouter);
router.use(settingsRouter);

export default router;
