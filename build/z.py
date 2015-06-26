#!/usr/bin/env python 

import sys , os , glob, datetime 
debug_mode = 'N'
sharedMode = 'N'
startDir = '' 
totalFile = sys.argv[2] 

if len(sys.argv) > 3: 
     debug_mode = sys.argv[3] 

if len(sys.argv) > 4:
	sharedMode = sys.argv[4]

if len(sys.argv) > 1 and os.path.isdir(sys.argv[1]): 
     startDir = sys.argv[1] 
else: 
     print 'Usage: %s <startdir>' % os.path.basename(sys.argv[0]) 
     sys.exit(1) 
	 
now = datetime.datetime.now()
tfh = open(totalFile , 'a') 
for f in glob.glob(os.path.join(startDir , '*.js')):
	whole_file_content = open(f).read()
	whole_file_content = whole_file_content.replace("{{DEBUG_MODE}}", debug_mode)
	whole_file_content = whole_file_content.replace("{{BUST_CACHE}}", str(now.strftime("%Y%m%dT%H%M%S")))
	whole_file_content = whole_file_content.replace("{{COMPILED}}", "Y")
	whole_file_content = whole_file_content.replace("{{WEB_SHARED_MODE}}", sharedMode)
	
	tfh.write(whole_file_content)
	tfh.write('\n') 
tfh.close() 