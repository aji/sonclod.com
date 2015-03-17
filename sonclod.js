$(function(){
  var playing = null;
  var picksOnly = false;
  var players = {};

  var volume = 1.0;

  function setPlaying(p) {
    var np = $("#np");
    playing = p;
    if (playing === null) {
      np.empty();
      np.text("(silence)");
    } else {
      var a = $("<a>");
      a.attr("href", p.getAnchor());
      a.text(p.getTitle());
      np.empty();
      np.append(a);
    }
  }

  function setVolume(v) {
    volume = Math.pow(2.0, v) - 1.0;
    if (playing !== null)
      playing.setVolume(volume);
  }

  function timeToText(n) {
    var mins = Math.floor(n / 60);
    var secs = Math.floor(n % 60);
    n = Math.floor(n);
    if (n % 1 !== 0)
      return "?:??";
    secs = "" + secs;
    while (secs.length < 2)
      secs = "0" + secs;
    return mins + ":" + secs;
  }

  function Player(elem, audio) {
    var self = this;
    var next = null;
    var id   = elem.text();
    var text = $("<span>");
    var ts   = $("<span>");

    elem.text("");
    elem.append(text);
    elem.append(ts);

    ts.addClass("timestamp");

    text.text(">> PLAY THIS ONE >> ");
    ts.text("-:--/-:--");

    self.isPick = elem.parent().hasClass("pick");

    self.getTitle = function() { return $("#n"+id).text(); }
    self.getId = function() { return id; }
    self.getAnchor = function() { return "#s"+id; }

    self.setNext = function(e) { next = e; }

    self.isPlaying = function() { return playing == self; }

    self.updateTs = function() {
      ts.text(
        (self.isPlaying() ? timeToText(audio.prop("currentTime"))
                          : "-:--")
        + "/" +
        timeToText(audio.prop("duration"))
        );
    }

    self.stopPlayback = function(){
      var audio = $("#"+id);

      audio.trigger("pause");
      audio.prop("currentTime",0);
      if (playing == self)
        setPlaying(null);
      text.text(">> PLAY THIS ONE >> ");
      elem.removeClass("playing");
    }

    self.setVolume = function(v) {
      var audio = $("#"+id);

      audio.prop("volume", v);
    }

    self.play = function(auto){
      var audio = $("#"+id);

      if (!self.isPick && picksOnly && auto) {
        next.play(true);
        return;
      }

      if (playing !== null)
        playing.stopPlayback();
      setPlaying(self);
      audio.trigger("play");
      audio.prop("volume", volume);
      text.text("!!! PLAYING :DD !!! ");
      elem.addClass("playing");
    }

    audio.on("ended",function(e){
      self.stopPlayback();
      if (next !== null)
        next.play(true);
    });

    elem.on("click",function(e){
      if (playing == self)
        self.stopPlayback();
      else
        self.play(false);
    });

    audio.on("timeupdate",function(e){
      self.updateTs();
    });
    audio.on("loadedmetadata",function(e){
      self.updateTs();
    });
  }

  function initPlayers() {
    var last = null;
    $(".player").each(function(i,e){
      e = $(e);
      var p = new Player(e, $("#"+e.text()));
      if (last !== null)
        last.setNext(p);
      last = p;
      players[p.getId()] = p;
    });
  }

  $("#picksonly").click(function(e){
    picksOnly = !picksOnly;
    if (picksOnly) {
      $(".nopick").fadeOut();
    } else {
      $(".nopick").fadeIn();
    }
    return false;
  });

  initPlayers();
  if (window.location.hash.length > 2) {
    players[window.location.hash.substr(2)].play();
  }

  $(".volnotch").click(function(e){
    var idx = $(this).index();
    $(".volnotch").each(function(i,e){
      if (i <= idx)
        $(this).addClass("activated");
      else
        $(this).removeClass("activated");
    });
    setVolume(idx/($(".volnotch").size()-1));
  });
  $(".volnotch").addClass("activated");
});

function genEntry(id, name, page, path, pick) {
  var anchor =       $("<a>").attr("id","s"+id);

  var entry  =     $("<div>").addClass("entry")
                             .addClass(pick?"pick":"nopick");
  var title  =     $("<div>").addClass("title");
  var tlink  =       $("<a>").addClass("permalink")
                             .attr("href","#s"+id)
                             .html("&#x1f517;");
  var star   =    $("<span>").addClass("pick")
                             .html("&#x2605; aji's pick &#x2605;");
  var ttext  =    $("<span>").attr("id","n"+id)
                             .text(name);
  var botb   =       $("<a>").attr("href",page)
                             .attr("target","_blank")
                             .text("(on BotB)");
  var audio  =   $("<audio>").attr("id",id)
                             .attr("preload","none")
                             .text("no <audio> support bro :(");
  var source =  $("<source>").attr("src",path)
                             .attr("type","audio/mpeg");
  var player =     $("<div>").addClass("player")
                             .text(id);
  var dl     =       $("<a>").attr("href",path)
                             .addClass("download")
                             .text("vvv DOWNLOAD IT vvv");

  title.append(tlink);
  title.append(' ')
  if (pick) title.append(star);
  title.append(ttext);
  title.append(' ')
  title.append(botb);

  audio.append(source);

  entry.append(title);
  entry.append(audio);
  entry.append(player);
  entry.append(dl);

  var container = $("<div>");
  container.append(anchor);
  container.append(entry);

  document.write(container.html());
}
