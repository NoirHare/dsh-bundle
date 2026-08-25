import z from "@deepseek-ai/schemastery";
import { WebServer } from "@deepseek-ai/dsh-host-webserver";

export default class NRWebServer extends WebServer {
    static override Config: z = z.object({
        host: z.string().required(),
        port: z.natural().max(65535).required(),
    })
}