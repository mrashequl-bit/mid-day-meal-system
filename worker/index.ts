/** Cloudflare Worker entry point for the vinext-starter template. */
import { handleImageOptimization, DEFAULT_DEVICE_SIZES, DEFAULT_IMAGE_SIZES } from "vinext/server/image-optimization";
import handler from "vinext/server/app-router-entry";
import { deliverDailyDistributionReport, getDhakaReportDate } from "../app/lib/daily-distribution-delivery";
import { autoConfirmDistributionReports } from "../app/lib/distribution-adjustments";

type WorkerEnv = Env & {
  ASSETS: Fetcher;
  BROWSER?: BrowserRun;
  EMAIL?: SendEmail;
  INITIAL_ADMIN_PASSWORD?: string;
  SETTINGS_ENCRYPTION_KEY?: string;
  IMAGES: ImagesBinding;
};

function secureResponse(response: Response, apiRequest: boolean) {
  const headers = new Headers(response.headers);
  headers.set("X-Content-Type-Options", "nosniff");
  headers.set("X-Frame-Options", "DENY");
  headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  headers.set("Permissions-Policy", "camera=(), microphone=(), geolocation=()");
  if (apiRequest) headers.set("Cache-Control", "no-store");
  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
}

// Image security config. SVG sources with .svg extension auto-skip the
// optimization endpoint on the client side (served directly, no proxy).
// To route SVGs through the optimizer (with security headers), set
// dangerouslyAllowSVG: true in next.config.js and uncomment below:
// const imageConfig: ImageConfig = { dangerouslyAllowSVG: true };

const worker = {
  async fetch(request: Request, env: WorkerEnv, ctx: ExecutionContext): Promise<Response> {
    const url = new URL(request.url);

    if (url.pathname === "/_vinext/image") {
      const allowedWidths = [...DEFAULT_DEVICE_SIZES, ...DEFAULT_IMAGE_SIZES];
      const response = await handleImageOptimization(request, {
        fetchAsset: (path) => env.ASSETS.fetch(new Request(new URL(path, request.url))),
        transformImage: async (body, { width, format, quality }) => {
          const outputFormat = format as ImageOutputOptions["format"];
          const result = await env.IMAGES.input(body).transform(width > 0 ? { width } : {}).output({ format: outputFormat, quality });
          return result.response();
        },
      }, allowedWidths);
      return secureResponse(response, false);
    }

    return secureResponse(
      await handler.fetch(request, env, ctx),
      url.pathname.startsWith("/api/"),
    );
  },
  async scheduled(controller: ScheduledController, env: WorkerEnv, ctx: ExecutionContext): Promise<void> {
    const date = getDhakaReportDate(controller.scheduledTime);
    if (controller.cron === "0 8 * * *") {
      ctx.waitUntil(autoConfirmDistributionReports(date).then((result) => {
        console.log(JSON.stringify({ event: "distribution_auto_confirm", ...result }));
      }).catch((error) => {
        console.error(JSON.stringify({ event: "distribution_auto_confirm_failed", message: String(error) }));
        throw error;
      }));
      return;
    }
    ctx.waitUntil(deliverDailyDistributionReport(env, { date }).then((result) => {
      console.log(JSON.stringify({ event: "daily_distribution_report_delivery", result }));
    }).catch((error) => {
      console.error(JSON.stringify({ event: "daily_distribution_report_delivery_failed", message: String(error) }));
      throw error;
    }));
  },
} satisfies ExportedHandler<WorkerEnv>;

export default worker;
