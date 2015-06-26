#!/usr/bin/env python 

import sys , os , glob 

startDir = '' 
totalFile = sys.argv[2] 

if len(sys.argv) > 1 and os.path.isdir(sys.argv[1]): 
     startDir = sys.argv[1] 
else: 
     print 'Usage: %s <startdir>' % os.path.basename(sys.argv[0]) 
     sys.exit(1) 

tfh = open(totalFile , 'a') 

tfh.write(open(os.path.join(startDir , 'thirdparty.js')).read()) 
tfh.write('\n')
tfh.write(open(os.path.join(startDir , 'compiled.js')).read()) 
tfh.close() 