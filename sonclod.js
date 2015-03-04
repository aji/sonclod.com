$(function(){
  var playing = null;

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
    var text = $("<span>");
    var ts   = $("<span>");

    elem.text("");
    elem.append(text);
    elem.append(ts);

    ts.addClass("timestamp");

    text.text(">> PLAY THIS ONE >> ");
    ts.text("-:--/-:--");

    self.setNext = function(e){
      next = e;
    }

    self.isPlaying = function() {
      return playing == self;
    }

    self.updateTs = function() {
      ts.text(
        (self.isPlaying() ? timeToText(audio.prop("currentTime"))
                          : "-:--")
        + "/" +
        timeToText(audio.prop("duration"))
        );
    }

    self.stop = function stop(){
      audio.trigger("pause");
      audio.prop("currentTime",0);
      if (playing == self)
        playing = null;
      text.text(">> PLAY THIS ONE >> ");
      elem.removeClass("playing");
    }

    self.play = function play(){
      if (playing !== null)
        playing.stop();

      playing = self;
      audio.trigger("play");
      text.text("!!! PLAYING :DD !!! ");
      elem.addClass("playing");
    }

    audio.on("ended",function(e){
      self.stop();
      if (next !== null)
        next.play();
    });

    elem.on("click",function(e){
      if (playing == self)
        self.stop();
      else
        self.play();
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
    });
  }

  initPlayers();
});
