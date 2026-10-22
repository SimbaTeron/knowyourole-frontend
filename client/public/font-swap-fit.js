(function () {
  var ROOTS = ".workday-content-page, .workday-simple-page, .kyr-home-page";
  var TEXT = "h1, h2, h3, p, li, a, button, summary, label, small, strong, em, span";
  var WEB_FONTS = [
    '500 16px "Space Grotesk"',
    '600 16px "Space Grotesk"',
    '700 16px "Space Grotesk"',
    '400 16px "IBM Plex Sans"',
    '500 16px "IBM Plex Sans"',
    '600 16px "IBM Plex Sans"',
    '700 16px "IBM Plex Sans"',
  ];

  function selectorFor(el) {
    var parts = [];
    var node = el;
    while (node && node !== document.body && node !== document.documentElement) {
      var parent = node.parentElement;
      var index = parent ? Array.prototype.indexOf.call(parent.children, node) + 1 : 1;
      parts.unshift(node.tagName.toLowerCase() + ":nth-child(" + index + ")");
      node = parent;
    }
    return parts.join(" > ");
  }

  function blockHost(el) {
    var node = el;
    while (node && node !== document.body) {
      var display = getComputedStyle(node).display;
      if (display !== "inline" && display !== "contents") return node;
      node = node.parentElement;
    }
    return el;
  }

  function depth(el) {
    var count = 0;
    var node = el;
    while (node) {
      count += 1;
      node = node.parentElement;
    }
    return count;
  }

  function candidates() {
    var seen = new Set();
    var out = [];
    var roots = document.querySelectorAll(ROOTS);
    for (var r = 0; r < roots.length; r += 1) {
      var nodes = roots[r].querySelectorAll(TEXT);
      for (var i = 0; i < nodes.length; i += 1) {
        var node = nodes[i];
        if (seen.has(node)) continue;
        var direct = false;
        for (var c = 0; c < node.childNodes.length; c += 1) {
          var child = node.childNodes[c];
          if (child.nodeType === 3 && child.textContent.trim()) direct = true;
        }
        if (!direct) continue;
        var box = node.getBoundingClientRect();
        if (box.height < 1) continue;
        var whiteSpace = getComputedStyle(node).whiteSpace;
        if (whiteSpace === "nowrap" || whiteSpace === "pre") continue;
        seen.add(node);
        out.push(node);
      }
    }
    return out;
  }

  function fitTo(el, target) {
    var base = parseFloat(getComputedStyle(el).fontSize);
    if (!isFinite(base) || base <= 0) return 0;
    var lo = base * 0.72;
    var hi = base * 1.18;
    var best = lo;
    for (var step = 0; step < 14; step += 1) {
      var mid = (lo + hi) / 2;
      el.style.fontSize = mid + "px";
      if (el.getBoundingClientRect().height > target + 0.5) hi = mid;
      else {
        best = mid;
        lo = mid;
      }
    }
    // Stay a hair under the wrap boundary so the next layout cannot flip a line.
    var chosen = best * 0.985;
    var guard = 0;
    el.style.fontSize = chosen + "px";
    while (el.getBoundingClientRect().height > target + 0.5 && guard < 6) {
      chosen *= 0.975;
      el.style.fontSize = chosen + "px";
      guard += 1;
    }
    el.style.fontSize = "";
    return chosen;
  }

  function stabilize() {
    var root = document.documentElement;
    var previous = document.getElementById("font-swap-fit");
    if (previous) previous.textContent = "";
    root.classList.add("font-lock");
    var nodes = candidates().map(function (el) {
      var host = blockHost(el);
      return { el: el, height: el.getBoundingClientRect().height, host: host, hostHeight: host.getBoundingClientRect().height };
    });
    root.classList.remove("font-lock");
    var rules = [];
    nodes.sort(function (a, b) { return depth(b.el) - depth(a.el); });
    for (var i = 0; i < nodes.length; i += 1) {
      var item = nodes[i];
      var hostNow = item.host.getBoundingClientRect().height;
      if (Math.abs(hostNow - item.hostHeight) < 1) continue;
      var size = fitTo(item.el, item.height);
      if (size) rules.push(selectorFor(item.el) + "{font-size:" + size.toFixed(2) + "px !important;}");
      rules.push(selectorFor(item.host) + "{min-height:" + item.hostHeight + "px !important;}");
    }
    var style = document.getElementById("font-swap-fit");
    if (!rules.length) {
      if (style) style.remove();
      return;
    }
    if (!style) {
      style = document.createElement("style");
      style.id = "font-swap-fit";
      document.head.appendChild(style);
    }
    style.textContent = rules.join("\n");
  }

  window.__kyrStabilizeFonts = stabilize;

  function whenReady() {
    var pending = WEB_FONTS.map(function (spec) {
      return document.fonts.load(spec).catch(function () { return []; });
    });
    Promise.all(pending).then(function () { stabilize(); }).catch(function () { stabilize(); });
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", whenReady);
  else whenReady();
  var lastWidth = window.innerWidth;
  window.addEventListener("resize", function () {
    if (Math.abs(window.innerWidth - lastWidth) < 2) return;
    lastWidth = window.innerWidth;
    if (document.fonts.status === "loaded") stabilize();
  });
})();
