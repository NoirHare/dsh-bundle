import z from "@deepseek-ai/schemastery";
import { WebServer } from "@deepseek-ai/dsh-host-webserver";
export default class NRWebServer extends WebServer {
    static Config: z;
}
