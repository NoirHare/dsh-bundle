window.__ModuleLoader__.load({ id: "@noirhare/dsh-ui-notification", factory: (require) => {
var module = { exports: {} };
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/client/index.ts
var index_exports = {};
__export(index_exports, {
  apply: () => apply,
  inject: () => inject
});
module.exports = __toCommonJS(index_exports);

// src/client/SidebarNotify.tsx
var import_react = __toESM(require("react"), 1);
var import_dsh_client_ui_primitives = require("@deepseek-ai/dsh-client-ui-primitives");
function SidebarNotify() {
  const [permission, setPermission] = (0, import_react.useState)(Notification.permission);
  function buttonClick(event) {
    event.preventDefault();
    Notification.requestPermission((permission2) => setPermission(permission2));
  }
  return (0, import_react.useMemo)(() => permission === "default" ? /* @__PURE__ */ import_react.default.createElement(import_dsh_client_ui_primitives.Button, { variant: "toolbar", onClick: buttonClick }, "\u542F\u52A8\u901A\u77E5") : null, [permission]);
}
var SidebarNotify_default = SidebarNotify;

// src/client/index.ts
var ID = "@noirhare/dsh-ui-notification";
var inject = ["slots", "sessions"];
async function apply(ctx) {
  if (Notification.permission === "default") {
    ctx.slots.inject(
      "sidebar.footer.action",
      () => ctx.slots.register({
        name: "sidebar.footer.action",
        id: `${ID}:request-permission`
      }, SidebarNotify_default)
    );
  }
  ctx.effect(() => {
    let previous = ctx.sessions.list.getSnapshot().byId;
    return ctx.sessions.list.subscribe(() => {
      const snapshot = ctx.sessions.list.getSnapshot();
      try {
        if (Notification.permission !== "granted") return;
        for (const id of snapshot.ids) {
          const p = previous[id];
          if (!p) continue;
          const c = snapshot.byId[id];
          if (p.running && !c.running) {
            const n = new Notification(c.displayTitle, { body: "\u8FD0\u884C\u7ED3\u675F" });
            n.addEventListener("click", (e) => {
              e.preventDefault();
              ctx.sessions.open(id);
              window.focus();
            });
          }
          if (p.pendingInteraction !== c.pendingInteraction && c.pendingInteraction) {
            const n = new Notification(c.displayTitle, { body: `${c.pendingInteraction} \u7B49\u5F85\u54CD\u5E94` });
            n.addEventListener("click", (e) => {
              e.preventDefault();
              ctx.sessions.open(id);
              window.focus();
            });
          }
        }
      } finally {
        previous = snapshot.byId;
      }
    });
  }, `${ID}:session-update`);
}
return module.exports; } });
