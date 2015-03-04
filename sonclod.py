#!/usr/bin/env python3

import shutil
import os
import re
import json

INTRO_PARAGRAPH = '''
<p>Welcome to sonclod.com! This is a collection of various MP3s rendered from
aji's BotB OHC entries. The tracks are chronologically ordered.  I've also
marked a couple as "aji's pick", which are songs I either am proud of, or enjoy
for some reason, or whatever. There's also an "on BotB" link if you want to go
visit the OHC entry's page on BotB.</p>

<p>I hope you enjoy my tunes!</p>
'''

class Entry(object):
    def __init__(self, name, id, path, page, obj):
        self.name = name
        self.id   = id
        self.path = path
        self.page = page
        self.obj  = obj
    def gen(self, f):
        f.write('<a id="s{}"></a>'.format(self.id))
        f.write('<div class="entry {}">\n'.format(
            'pick' if 'pick' in self.obj else 'nopick'))
        f.write('<div class="title">')
        f.write('<a class="permalink" href="#s{}">&para;</a>'.format(self.id))
        if 'pick' in self.obj:
            f.write('<span class="pick">&#x2605; aji\'s pick &#x2605;</span>')
        f.write(' {} <a href="{}" target="_blank">(on BotB)</a>'
                .format(self.name, self.page))
        f.write('</div>\n')
        f.write('<audio id="{}" preload="none">\n'.format(self.id))
        f.write('<source src="'+self.path+'" type="audio/mpeg"/>\n')
        f.write('YOUR BROWSER DOES NOT SUPPORT &lt;AUDIO/> LMAO')
        f.write('</audio>\n')
        f.write('<div class="player">{}</div>\n'.format(self.id))
        f.write('<a href="{}" class="download">vvv DOWNLOAD IT vvv</a>\n'
                .format(self.path));
        f.write('</div>\n')

def gen_index(f, ents):
    f.write('<!DOCTYPE html>\n')
    f.write('<html><head><title>aji\'s Sonclod</title>\n')
    f.write('<meta charset="UTF-8">\n')
    f.write('<script src="https://code.jquery.com/jquery-2.1.3.min.js"></script>\n')
    with open('sonclod.js') as js:
        f.write('<script>{}</script>\n'.format(js.read()))
    with open('style.css') as css:
        f.write('<style>{}</style>\n'.format(css.read()))
    f.write('</head><body>\n')
    f.write('<h1>aji\'s Sonclod</h1>\n')
    f.write('<div class="intro">{}</div>\n'.format(INTRO_PARAGRAPH))
    f.write('<a href="#" id="picksonly">Toggle Picks Only</a>\n')
    for e in ents:
        e.gen(f)
    f.write('</body></html>\n')

def page_name(ent):
    m = re.match('BotB ([0-9]*) (.*)\\.(.*)', ent)
    num, name, ext = m.groups()
    name += '.' + ext.split('.')[0]
    name = name.replace(' ', '+')
    return 'http://battleofthebits.org/arena/Entry/-/{}'.format(num)

def path_name(name, num):
    def f(c):
        if c.isalnum():
            return c
        if c == ' ':
            return '-'
        return '_'
    return 'a/aji_{}.mp3'.format(''.join(f(c) for c in name))

with open('sonclod.json', 'r') as f:
    objs = json.load(f)

ents = []
for ent in reversed(sorted(os.listdir('s'))):
    m = re.match('BotB ([0-9]*) (.*)\\.mp3', ent)
    if not m:
        continue
    num, name = m.groups()
    e = Entry(name, num, path_name(name, num),
              page_name(ent), objs.get(name, dict()))
    print(e.path)
    if not os.path.exists(e.path):
        shutil.copy('s/'+ent, e.path)
    ents.append(e)

with open('index.html', 'w') as f:
    gen_index(f, ents)
