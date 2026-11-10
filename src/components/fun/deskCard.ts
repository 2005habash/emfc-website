import { IMAGES } from "@/lib/site";
import { drawCard, INK, loadImage, SANS, SERIF, spaced, wrap } from "./cards";

/** The quiz result as a picture to post: the desk, in big type, on navy. */
export async function drawDeskCard(desk: string, department: string, line: string) {
  const bull = await loadImage(IMAGES.bullMark).catch(() => null);
  return drawCard(1080, 1350, (ctx) => {
    ctx.fillStyle = INK.night;
    ctx.fillRect(0, 0, 1080, 1350);
    // A faint bull, large, in the corner.
    if (bull) {
      ctx.globalAlpha = 0.12;
      ctx.drawImage(bull, 470, 640, 780, 710);
      ctx.globalAlpha = 1;
      ctx.drawImage(bull, 96, 96, 99, 90);
    }
    ctx.fillStyle = "#ffffff";
    ctx.font = `600 58px ${SERIF}`;
    ctx.textAlign = "left";
    ctx.fillText("EMFC", 212, 162);
    ctx.fillStyle = INK.bullLight;
    ctx.font = `500 24px ${SANS}`;
    spaced(ctx, "MY DESK AT EMFC", 96, 380, 6);
    ctx.fillStyle = "#ffffff";
    const size = desk.length > 16 ? 120 : desk.length > 9 ? 150 : 190;
    ctx.font = `500 ${size}px ${SERIF}`;
    let y = wrap(ctx, desk, 92, 380 + size, 900, size * 0.95);
    ctx.fillStyle = INK.mist;
    ctx.font = `500 26px ${SANS}`;
    spaced(ctx, department.toUpperCase(), 96, y + 30, 5);
    ctx.font = `italic 400 44px ${SERIF}`;
    ctx.fillStyle = INK.bullLight;
    y = wrap(ctx, line, 96, y + 130, 820, 56);
    ctx.fillStyle = INK.mist;
    ctx.font = `400 28px ${SANS}`;
    ctx.fillText("Which desk are you? emfc.es/arcade", 96, 1262);
  });
}
