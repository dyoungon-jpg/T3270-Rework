;****************************************************************************
;  talk3270.JSH 
; Header file for Talk3270 
;***************************************************************************************
; 	Developed by
;	C.F. Drake 
; 	902 300-8511
;	cfdrake@gmail.com
; ****************************** Revision log **************************************
; updated by    Description of change
;10/29/05 - Created Initial Version 1.0
;04/15/09 - added column vars and Admin file 
;04/21/09 - Added const cTabChar which has a value of ascii 09 
;								  			used in Next and Prior Word functions 
;04/23/09 - added global vars for row and Col offsets and Flag
;06/16/09 -added const for UseScrnOffSet for INI read 
;2014-07-27 - Add msg vars for last modifyed date handling
;2017-07-29 - added menu for most hotkey mainly for testing using VM
;2021-07-06 - updated version & build
;2025-05-04 v3.7 #1 move var cUserJfwSerNo from license file 
;2025-05-04 v3.7 #2 new const for MaxTermWindow 
;2025-05-17 v3.7.1 Added vars vors logging 
;                  - moved var cT3Ver version and Build number to main script 
;                       to make it easy to update when modifying main script 
;                  - added Logging menu item to turn off 
;****************************** Revision log **************************************
Const
; General 
;	2025-05-17 v3.7.1 moved var cT3Ver version and Build number to main script 
;	cT3Ver="3.7.1 Build 20250505", move to main script 
	cDefalutAutoReadDelay=5,
	cDefalutScreenDelay=3,
	cLetterRowTable = "A|B|C|D|E|F|G|H|I|J|K|L|M|N|O|P|Q|R|S|T|U|V|W|X|Y|",
	cNotFound = "NotFound",
	cNotDefined = "Not defined",
	cLF = "\r\n",
	cNoLF = " ",
	;The follwing line Inside the quotes is ASCII code 009
	cTabChar = "	", 
	cBlank=" ",
	cNull="",
	cYes="Y",
	cNo="N",
	cTabKey="TAB",
	cBackTabKey="BACKTAB",
	;2025-05-17 logging 
	cJfwUsrdDir="AppData\\Roaming\Freedom Scientific\\JAWS\\2025\\Settings\\enu",
	cLogStopped="Talk3270 Logging Stopped",
	cLogBasic="Talk3270 Basic Logging Is active",
	cLogAdvanced="Talk3270 Advanced Logging Is active",
	cLogAdvancedCpy="Talk3270 Advanced Logging and Screen Capture Is active",
;Constants for finding possition on screen
	cACF2msgPrefix = "  ACF",
;
;constants for INI file handling 
	cTalk3270AdminFile = "Talk3270Admin.INI",
	cTalk3270ScrnFile = "talk3270scrn.ini",
	cTalk3270FldFile = "talk3270flds.ini",
	cTalk3270ColFile = "Talk3270Clms.INI",
	cLastMod = "LastModification",
	cLastModKey = "ModDate",
	cNoDate = "No Date",
	cAdmin = "Admin",
	cWinClasskey = "WinClass",
	cCompName = "CompName",
	cT3SerKey = "Talk3270Ser",
	cJFWSerKey = "JawsSer",
	cScrnDelayKey ="ScrnDelay",
	cTPerGoal = "TABGJ90",
	cAutoReadDelayKey ="AutoReadDelay",
	cMaxTermWinKey="MaxTermWindow", ;2025-05-04 v3.7 #2 
	cLogKey="Logging", ;2025-05-04 v3.7 #2 
	cHotKey "Hotkeys", ; section name in admin files 
	cScrnAttribKey ="ScrnAttrib",
	cScrnTitleKey = "ScrnTitle",
	cScrnIdKey = "ScrnId",
	cScrnMsgKey1 = "ScrnMsg1",
	cScrnMsgKey2 = "ScrnMsg2",
	cPageNumKey = "PageNum",
	cPerfIndxKey= "T3PerfIndx",
	cPerfIndx="80|24|0|2|0|0|TABGJ90|80X24|80X25|EEI1L|3JIl7|I12|T327X",
	cDeskTopKeys = "DESKTOP Keys",
	cColumnKey = "Clmn",
	cVbar = "|",
	cUp="U",
	cDown="D",
	cRight="R",
	cLeft="L",
	cHome="H",
	cEnd="E",
	cView="V",

; constants for menu 
  cMenuItem1="Display Talk3270 information windows+Alt+S|",
  cMenuItem2="Screen data CONTROL+/|",
  cMenuItem3="Auto read fields Control+Windows+/|",
  cMenuItem4="Screen title & messages Control+Windows+I|",
  cMenuItem5="Page or screen number Control+Windows+N|",
  cMenuItem6="Active cursor position Control+Delete|",
  cMenuItem7="Display Talk3270 hotkey JawsKey+H|",
  cMenuItem8="Say field Windows+TAB|",
  cMenuItem9="Copy field to clipboard Windows+C|",
  cMenuItem10="Copy current line to clipboard Windows+Alt+C|",
  cMenuItem11="Copy selected text to clipboard Windows+Control+C|",
  cMenuItem12="Paste from clipboard Windows+V|",
  cMenuItem13="Next column Alt+Control+RightArrow|",
  cMenuItem14="Previous column Alt+Control+LeftArrow|",
  cMenuItem15="Next line in column Alt+Control+DownArrow|",
  cMenuItem16="Previous line in column Alt+Control+UpArrow|",
  cMenuItem17="Move to top of Column Alt+Control+Home|",
  cMenuItem18="Move to bottom of column Alt+Control+End|",
  CMenuItem19="Rebuild Talk3270 Hot Keys Alt+Control+K|",
  CMenuItem20="Turn off Talk3270 Logging|",

; constants for logging loging select
  clogItem0="Stop logging|",
  clogItem1="Basic logging|",
  clogItem2="Advanced Logging|",
  clogItem3="Advanced Logging and screen capture|"
  
globals 
	Int nAAqPointer, 
	handle hWind,
	string s3270Window,
	string sAdminCompName,
	string sAdminT3270SerNo,
	string sFullScreen,
	string sJSetDirectory,
	string sAppFileName,
	string sKeyMapFIle,
	string sAdmFile,
	string sFldFile,
	string sScrnFile,
	string sColFile,
	string sCommonText, 
	string sScreenList ,
	string sScreenID,
	string sScreenTitle,
	string sAuthMsg,
	string sBufferText,
	string sHoldText,
	string sScrnMsg,
	string sHoldScrnMsg,
	string sAdminJfwSerNo,
	string sMenuList,
	string cUserJfwSerNo, 
	string sgT3Ver, 
	int nLogCnt,
	int nScrnAttrib,
	string sLogDate,
	string sLogFile,
;	
	int nLineHeight,  
	int nCharWidth,
	int nLeftMargin,  
	int nTopOfScreen,
	int nUseOffset, 
	int nTopScrnOffSet,
	int nLeftScrnOffSet,
	int nScreenDelay,
	int nAutoReadDelay,
	int nMaxTermWin, ;2025-05-04 v3.7 #2 
	int nLogging, ;v3.7. 2026-05-16
	int nErrors,
	int nFirstTime,
	int n3270Key,
	int nDoAutoRead,
	int nScheduledFunction,
	int nScreenNotDefined,
	int nColNum,
	int nColLinePtr,
	int nRunJfwSerNo,
	int nDemoModeCntr,
	int nT3270DemoDone
