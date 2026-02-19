;****************************************************************************
; ltrOne.JSH 
; Header file for ltrOne.jss
; File name ltrOne.jsh 
;****************************************************************************
; updated       Description of change
; 2026-02-11 - removed unsed const & vars 
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
	cLogStopped="ltrOne Logging Stopped",
	cLogBasic="ltrOne Basic Logging Is active",
	cLogAdvanced="ltrOne Advanced Logging Is active",
	cLogAdvancedCpy="ltrOne Advanced Logging and Screen Capture Is active",
;Constants for finding possition on screen
	cACF2msgPrefix = "  ACF",
;
;constants for INI file handling 
	cltrOneAdminFile = "ltrOneAdmin.INI",
	cltrOneScrnFile = "ltrOnescrn.ini",
	cltrOneFldFile = "ltrOneflds.ini",
	cltrOneColFile = "ltrOneClms.INI",
	cAdmin = "Admin",
	cWinClasskey = "WinClass",
	cCompName = "CompName",
	cT3SerKey = "ltrOneSer",
	cJFWSerKey = "JawsSer",
	cScrnDelayKey ="ScrnDelay",
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
  cMenuItem1="Display ltrOne information windows+Alt+S|",
  cMenuItem2="Screen data CONTROL+/|",
  cMenuItem3="Auto read fields Control+Windows+/|",
  cMenuItem4="Screen title & messages Control+Windows+I|",
  cMenuItem5="Page or screen number Control+Windows+N|",
  cMenuItem6="Active cursor position Control+Delete|",
  cMenuItem7="Display ltrOne hotkey JawsKey+H|",
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
  CMenuItem19="Rebuild ltrOne Hot Keys Alt+Control+K|",
  CMenuItem20="Turn off ltrOne Logging|",

; constants for logging loging select
  clogItem0="Stop logging|",
  clogItem1="Basic logging|",
  clogItem2="Advanced Logging|",
  clogItem3="Advanced Logging and screen capture|"
  
globals 
	Int nAAqPointer, 
	string s3270Window,
	string sAdminCompName,
	string sAdminltrOneSerNo,
	string sFullScreen,
	string sJSetDirectory,
	string sAppFileName,
	string sKeyMapFIle,
	string sAdmFile,
	string sFldFile,
	string sScrnFile,
	string sColFile,
	string sScreenList ,
	string sScreenID,
	string sBufferText,
	string sHoldScrnMsg,
	string sMenuList,
	string cUserJfwSerNo, 
	int nLogCnt,
	string sLogDate,
	string sLogFile,
;	
	int nLineHeight,  
	int nCharWidth,
	int nLeftMargin,  
	int nTopOfScreen,
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
	int nColLinePtr
