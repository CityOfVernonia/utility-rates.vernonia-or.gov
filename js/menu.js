(function (window, document, $, Stickyfill, anchors) {
  'use strict';
  // sticky polyfill
  // https://github.com/wilddeer/stickyfill
  if (Stickyfill) {
    Stickyfill.add($('.sticky'));
  }
  // generic page menu from h4 anchors
  var pageMenu = document.getElementById('pageMenu');
  function generatePageMenu(els) {
    var text;
    var href;
    for (var i = 0; i < els.length; i++) {
      text = els[i].textContent;
      href = els[i].querySelector('.anchorjs-link').getAttribute('href');
      if (els[i].tagName === 'H2') {
        put(pageMenu, 'a.list-group-item.list-group-item-action[href=' + href + ']', text);
      }
    }
    $('body').scrollspy({ target: '#pageMenu' });
    document.body.style.position = 'relative';
  }

  // add anchors to normal pages
  function addAnchors() {
    anchors.add('.container h2');
    if (pageMenu) {
      generatePageMenu(anchors.elements);
    }
  }
  if (anchors) {
    addAnchors();
  } else {
    setTimeout(addAnchors, 100);
  }
}(this, this.document, this.$, this.Stickyfill, this.anchors));