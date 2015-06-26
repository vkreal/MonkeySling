d:
cd D:\SkyDrive\dev\monkeysling\build
DEL /Q compiled.js
DEL /Q temp-prod.js
DEL /Q thirdparty.js
DEL /Q temp-thirdparty.js
DEL /Q a.js

::z.py "D:\SkyDrive\dev\monkeysling\js" "temp-prod.js" "N"

z.py "C:\MonkeySlingRT\MonkeySlingRT\a\js" "temp-prod.js"
java -jar compiler.jar --compilation_level SIMPLE_OPTIMIZATIONS --js temp-prod.js > compiled.js --language_in ECMASCRIPT5 --externs externs\jquery-1.6.externs.js --externs externs\externs.js

z.py "C:\MonkeySlingRT\MonkeySlingRT\a\thirdparty" "temp-thirdparty.js"
java -jar compiler.jar --compilation_level SIMPLE_OPTIMIZATIONS --js temp-thirdparty.js > thirdparty.js

:: combine thirdparty.js and compiled.js
c.py "C:\MonkeySlingRT\MonkeySlingRT\a\build" "a.js"

::SIMPLE_OPTIMIZATIONS
::ADVANCED_OPTIMIZATIONS
::DEL /Q temp-prod.js