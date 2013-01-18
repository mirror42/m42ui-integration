var Mirror42 = {
  show: function(token, url, height, width) {
    token = token.split('#');
    url = url.replace(/^\s+/g, '');
    if (url.indexOf('http') !== 0) {
      if (url.indexOf('/') !== 0) { url = '/' + url; }
      url = token[0] + url;
    }
    url = url + (url.indexOf('?') === -1 ? "?" : "&");
    url = url + "apptoken=" + encodeURIComponent(token[1]);
    if (!height) { height = "600px"; }
    if (!width) { width = "100%"; }
    var m42 = document.getElementById('mirror42');
    m42.innerHTML = '<iframe class="content_embedded" frameborder="0" src="' + url + '" style="height:' + height + ';width:' + width + ';" frameborder="0" scrolling="no"></iframe>';
   }
};