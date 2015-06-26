#!/usr/bin/env python 

import sys , os , glob, datetime 

now = datetime.datetime.now()

with open('base.css','r') as f:
    newlines = []
    for line in f.readlines():
        newlines.append(line.replace(".png", ".png?Version=" + str(now.strftime("%Y%m%dT%H%M%S"))))
with open('base.css', 'w') as f:
    for line in newlines:
        f.write(line)