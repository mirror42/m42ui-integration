var Mirror42 = Mirror42 || {};
Mirror42.show = function(token, url, height, width) {
  if (!height) { height = "600px"; }
  if (!width) { width = "100%"; }
  if (/^\d+$/.test(height+'')) { height = height + 'px'; }
  if (/^\d+$/.test(width+'')) { width = width + 'px'; }
  token = token.split('#');
  var home_url = token[0];
  home_url = home_url.replace(/^\s+/g, '');
  home_url = home_url.replace(/\/$/, '');
  url = url.replace(/^\s+/g, '');
  if (url.indexOf('http') !== 0) {
    if (url.indexOf('/') !== 0) { url = '/' + url; }
    url = home_url + url;
  }
  url = url + (url.indexOf('?') === -1 ? "?" : "&");
  url = url + "apptoken=" + encodeURIComponent(token[1]);
  url = url + "&h=" + encodeURIComponent(height);
  // url = url + "&embed=1";
  url = url + "&embedinframe=1";
  var m42 = document.getElementById('mirror42');
  if (url.indexOf('/dashboards') === -1) {
    m42.innerHTML = '<iframe class="content_embedded" src="' + url + '" style="height:' + height + ';width:' + width + ';" frameborder="0" scrolling="no"></iframe>';
  } else {
    m42.innerHTML = '<div id="m42embed" style="width:' + width + ';height:' + height + ';margin:0 auto;"></div>';
    window.M42Embed = {container:'m42embed', home: home_url, path: url};
    var embed_js = document.createElement("script");
    embed_js.type = "text/javascript";
    embed_js.async = true;
    embed_js.src = home_url + '/a/embed.js';
    (document.getElementsByTagName("head")[0] || document.getElementsByTagName("body")[0]).appendChild(embed_js);
  }
};