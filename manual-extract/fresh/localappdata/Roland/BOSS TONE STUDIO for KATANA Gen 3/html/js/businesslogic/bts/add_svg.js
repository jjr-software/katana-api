(function() {
  var DIAL_CLASS_NAMES = ['.item-dial-style', '.bts--dial-style', '.bts-dial-2ctrl-style', '.bts-dial-dialog-style'];
  var N_PATH = 4;
  var SVG_WIDTH = 400;

  var hasAdded = false;

  window.svgController = {
    // item_logic.js内で呼び出し
    add2Dial: function() {
      if (hasAdded) {
        return;
      }
      hasAdded = true;

      var svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
      svg.setAttribute('width', '100%');
      svg.setAttribute('height', '100%');
      svg.setAttribute('viewBox', [-SVG_WIDTH / 2, -SVG_WIDTH / 2, SVG_WIDTH, SVG_WIDTH].join(' '));
      for (var i = 0; i < N_PATH; i++) {
        var path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        path.setAttribute('fill', 'none');
        svg.appendChild(path);
      }
      $(DIAL_CLASS_NAMES.join(',')).prepend(svg);
    }
  };
})();
