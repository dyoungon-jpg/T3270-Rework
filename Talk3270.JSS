;Scripts for 3270 terminal emulator
Const cT3Ver="3.7.1 Build 20250523"
;
;File Name : TALK3270.JSS
;
;******************************************************************************************
;This script provides speech output for the 3270 terminal emulator
;This is the main speech software engine for this application.
;*********************************** Revision log ******************************************
;	2026-1-31 DY: Removed dates, commented code, logging comments
;				  Made minor editing changes to Script Information for some scripts.
;				  Making a change to the GetScreenFields script resulted in a compile
;				  error when saving. Press Ctrl+Z twice then press Ctrl+S to save and
;				  compile. The changes to the Script Information will be retained.
;				  Repeat for other compile errors due to Script Information changes.
;
;*********************************** version and Build **************************************
;
Include "HjGlobal.jsh" ; default HJ global variables
Include "hjconst.jsh" ; default HJ constants
Include "talk3270.jsh" ;  header file
Include "common.jsm" ; message file
Include "talk3270.jsm" ;  Message file
include "Talk3270help.jsm" ; Talk3270Help messages
;   include for exit
include "Talk3270Exit.jss" ; Generic stub exit routines
;
;*********************** Functions start here *******************************
;
;****************************************************************************
;Setup screen locate vars and
;****************************************************************************
Function AutoStartEvent ()
	var string lText,
	string lKey,
	string slPerGoal,
	int liPos ; 2025-05-17 logging
	if SpeechInUse () then
		StopSpeech ()
	endif
	
	If nFirstTime == 0  then
		nFirstTime = 1
		sJSetDirectory = GetJawsSettingsDirectory ()+"\\"
		sAppFileName = SubString (GetAppFileName (),1, StringContains (GetAppFileName (), ".")-1)
		sAdmFile = sJSetDirectory+ cTalk3270AdminFile
		sScrnFile = sJSetDirectory+ cTalk3270ScrnFile
		sFldFile = sJSetDirectory+ cTalk3270fldFile
		sColFile = sJSetDirectory+ cTalk3270colFile
		sAdminCompName = IniReadString (cAdmin, cCompName, cNotFound, sAdmFile )
		sAdminT3270SerNo = IniReadString (cAdmin, cT3SerKey, cNotFound, sAdmFile )
		
		;	build log file name dir
		sLogDate = SysGetDate ("yyyy-MM-dd") 
		liPos = StringContains (sJSetDirectory, "AppData")
		lText = StringLeft (sJSetDirectory,liPos-1)
		sLogFile = lText + "desktop" + "\\talk3270-trace-" + sLogDate + ".log"
		nLogging = IniReadInteger (cAdmin, cLogKey,  0, sAdmFile)
		;	v3.7.1 see if logging  should be used
		if nLogging > 0 then
			;	set logging  in Admin.INI file to 0 so it won't start the next time
			IniWriteInteger (cAdmin, cLogKey, 0, sAdmFile,True)
			utillogToggle(nLogging)
			utilLogWrite("AutoStartEvent Logging Started by Admin INI file inside FirstTime ############## " )
		else 
			nLogging = 0
		endif
		;	v3.7.1 1. added logging
		
		PerformScript VerifyHotKeys ()
		
		;	v3.7 #1
		cUserJfwSerNo = IniReadString (cAdmin, cJFWSerKey, cNotFound, sAdmFile )
		
		;	v3.7 #2
		if IniReadString (cAdmin, cMaxTermWinKey, cNotFound, sAdmFile) == cNo then
			nMaxTermWin=0
		else
			nMaxTermWin=1
		endif
	endif ; If nFirstTime == 0
	
	;load screen list into memory
	sScreenList = IniReadSectionNames (sScrnFile)
	
	;	v3.7 #2
	if nMaxTermWin then
		{alt+space} {x}
	endif
	
	if nLogging then
		utilLogWrite("AutoStartEvent - Talk3270 Scripts have focus # # # # # # # # # # # #")
	endif
	
	if  ScreenAttribError () then
		utilGetSreenProperties ()
	endif
	Pause ()
	SpeechOn ()
	if  ScreenAttribError () then
		utilGetSreenProperties ()
	endif
	Pause ()
	Say(msgTalk3270,0)
	AutoReadNewText (True)
EndFunction

;************************************************************
;	Add text to the var sBufferText; 2 parms are required
;	1 the text to add and
;	2 whether to keep text on the same line or on a new line
;************************************************************
Void Function AddTextToBuffer (string pText, string pAddLF)
	pText = StringTrimTrailingBlanks (pText)
	sBufferText = sBufferText + pText + pAddLF
	if nLogging > 1 then
		utilLogWrite("AddTextToBuffer - ScrnId:" +  sScreenID + " TextLen:" + IntToString(StringLength(pText)) + " Text:" + pText)
	endif
EndFunction

Function AutoReadTrigger ()
	if nDoAutoRead then
		AutoReadNewText (True)
	endif
	if nLogging then
		utilLogWrite("AutoReadTrigger - ScrnId:" +  sScreenID + " nDoAutoRead:" + IntToString (nDoAutoRead))
	endif
EndFunction

;***********************************************************************
;	Read new text as it it written to the screen and
;	determine weather it should be read.
;	If pAutoRead is true then speak the sBufferText
;	else pass the text back to the calling functions
;***********************************************************************
Void Function AutoReadNewText (int pAutoRead)
	var string lFldString,
	string lText,
	string lSection,
	string lFieldList,
	string lFieldKey,
	string lPrompt,
	string ltrigger,
	string lNewLine,
	string lAutoread,
	string lScrnMsg,
	int lLineNum,
	int lRow,
	int lCol,
	int lLen,
	int lIndex,
	INT iAutoReadCnt
	
	nDoAutoRead = False
	if SpeechInUse () then
		StopSpeech ()
	endif
	Delay (nScreenDelay, 0)
	RefreshScreenImage()
	sScreenID = GetScreenId()
	sBufferText = cNull
	;
	;	look for a password message
	lLIneNum = LocateText(cACF2msgPrefix)
	if lLIneNum > 0 then
		lText = GetTextFromScreen (lLIneNum,1,75)
		say(ltext,OT_MESSAGE)
	endif
	if ! Is3270ScreenFocus() then
		return
	EndIf
	
	if nScreenNotDefined then
		Return
	endif
	
	if GetVerbosity () == Beginner then
		AddTextToBuffer(GetScreenTitle (),cLF)
	endif
	lScrnMsg = GetScreenMessage ()
	if ! StringIsBlank (lScrnMsg) then
		if lScrnMsg != sHoldScrnMsg then
			if nLogging > 1 then ;advanced
				utilLogWrite("AutoReadNewText - ScrnId:" +  sScreenID + " Hold:" + sHoldScrnMsg + cLF + " current:" + lScrnMsg)
			endif
			AddTextToBuffer(lScrnMsg,cLF)
			sHoldScrnMsg = lScrnMsg
		EndIF
	endif
	if GetVerbosity () == Beginner then
		AddTextToBuffer(GetScreenPageNumber (),cLF)
	endif
	;	get the auto read fields
	lFieldList = IniReadSectionKeys (sScreenId, sFldFile)
	lIndex = 1
	lFieldKey = cNotFound
	iAutoReadCnt = 0
	while lFieldKey
		lFieldKey = StringSegment (lFieldList, cVbar,lIndex)
		lFldString = IniReadString (sScreenId, lFieldKey, cNotFound, sFldFile)
		;	is it an auto read field
		if lFldString != cNotFound then
			if StringSegment (lFldString , cVbar, 7) == cYes then
				iAutoReadCnt = iAutoReadCnt + 1
				if nLogging > 1 then ;advanced
					utilLogWrite("AutoReadNewText - ScrnId:" +  sScreenID + " Def:" + StringSegment (ltext, cVbar, 8))
				endif
				GetScreenFieldData (lFldString)
			endif
		endif
		lIndex = lIndex + 1
	endwhile

	if nLogging then
		utilLogWrite("AutoReadNewText - ScrnId:" +  sScreenID + " Fields:" + IntToString (iAutoReadCnt))
	endif
	
	exitAutoReadNewText ()
	if pAutoRead Then
		say(sBufferText,OT_String)
	endIF
EndFunction

;***********************************************************
;	Get the cursor position in terms of the 3270
;	terminal layout IE line and Column 25by80
;	2016-06-18 bug fix not using nLeftMargin in below calculation
;	2024-04-06 JAWS changed the functions GetCursorRow & GetCursorCol to return the edit cursor
;				in row and columns
;	2025-05-17 Fixed JAWS cursor location to display in Col & Row instead of pixels
;***********************************************************
String Function GetCurrentPosition ()
	var int nRow,
	int nCol,
	string sCurrentCursorPosition
	;	 2024-04-07 changed order of col and rol to be the same as JAWS
	if IsPCCursor () then
		nRow = GetCursorRow ()
		nCol = GetCursorCol ()
		sCurrentCursorPosition = StringTrimLeadingBlanks (msgSI15)
		+ cVbar + IntToString (nCol) + cVbar + IntToString (nRow	)
	else
		nRow = GetCursorRow ()
		nCol = GetCursorCol ()
		sCurrentCursorPosition =  StringTrimLeadingBlanks (msgSI16)
		+ cVbar + IntToString (nCol) + cVbar + IntToString (nRow)
	endif
	if nLogging then
		utilLogWrite("GetCurrentPosition - ScrnId:" +  sScreenID + " " + sCurrentCursorPosition)
	endif
	return sCurrentCursorPosition
EndFunction

;****************************************************************************
;	Retrieve predefined fields from the screen
;****************************************************************************
Function GetScreenFields ()
	var string lFldString,
	string lFieldList,
	string lFieldKey,
	int lIndex,
	int lFieldsFound
	lFieldList = IniReadSectionKeys (sScreenId, sFldFile)
	lIndex = 1
	lFieldsFound = false
	lFieldKey = cNotFound
	while lFieldKey
		lFieldKey = StringSegment (lFieldList, cVbar,lIndex)
		lFldString = IniReadString (sScreenId, lFieldKey, cNotFound, sFldFile)
		if lFldString != cNotFound then
			if nLogging > 1 then
				utilLogWrite("GetScreenFields - ScrnId:" +  sScreenID + " lIndx:" + IntToString (lIndex) 
				+ " found "  + lFieldKey + " - " + lFldString)
			endif
			GetScreenFieldData (lFldString)
			lFieldsFound = True
		endif
		lIndex = lIndex + 1
	endwhile
	if nLogging then
		utilLogWrite("GetScreenFields - ScrnId:" +  sScreenID + " Flds processed:" + IntToString (lIndex))
	endif
	
	if ! lFieldsFound then
		exitGetScreenFields ()
	endif
EndFunction

;****************************************************************************
;	Parse the string and get the actual data from the screen
;	10-08-15 changed CopyToClipboard to AppendToClipBoard
;****************************************************************************
String Function GetScreenFieldData (string pFieldString)
	var string lFldString,
	string ltrigger,
	string lPrompt,
	string lFieldData,
	string lNewLine,
	string lCopyText,
	int lLineNum,
	int lRow,
	int lCol,
	int lLen,
	INT lFieldOk
	
	lRow = StringToInt (StringSegment (pFieldString, cVbar, 1))
	lcol = StringToInt (StringSegment (pFieldString, cVbar, 2))
	llen = StringToInt (StringSegment (pFieldString, cVbar, 3))
	lPrompt = StringSegment (pFieldString, cVbar, 4) + cBlank
	lTrigger = StringSegment (pFieldString, cVbar, 5)
	if StringSegment (pFieldString, cVbar, 6) == cYes then
		lNewline = cLF
	else
		lNewline = cNoLF
	endif
	;	if trigger is blank then just add field data
	if StringIsBlank (lTrigger) then
		lFieldOk = True
	else
		;	if the trigger is present then locate it
		lFieldOk = False
		lLineNum = LocateText (Ltrigger)
		if lLineNum then
			if  ! lRow then
				lRow = lLineNum
			endif
			lFieldOk = True
		endif
	endif
	if nLogging > 1 then
		utilLogWrite("GetScreenFieldData - ScrId:" + sScreenId + " Def:" + pFieldString + " lFieldOk:" + IntToString(lFieldOk))
	endif
	
	;	is there a field ?
	if lFieldOk then
		lFieldData = GetTextFromScreen (lRow,lCol,lLen)
		AddTextToBuffer(StringTrimLeadingBlanks (lPrompt + lFieldData), lNewLine)
		;	auto copy to clipboard
		if StringSegment (pFieldString, cVbar, 8) == cYes then
			AppendToClipboard (lFieldData, 1)
		endif
	endif
EndFunction

;**********************************************************************
; 	Get the name of the screen being displayed
;	2010-08-15 - Added cmd to clear clipboard on new screen
;			   - Corrected bug "if ScreenAttribError' removed not "!""
;**********************************************************************
String Function GetScreenId ()
	var string lScrnName,
	string lSection,
	string lListid,
	string lText,
	string sScrnLine, ;2025-05-17 logging
	int lIndex,
	int lLineNum,
	int lRow,
	int lCol,
	int lLen,
	int lNotFound,
	int lScrnCol ;2025-05-17 logging
	
	if ScreenAttribError () then
		utilGetSreenProperties ()
	endif
	lNotFound = 1
	lIndex = 1
	lListid = cNotFound
	while lNotFound && lListid
		lListid = StringSegment (sScreenList , cVbar,lIndex)
		lLineNum = LocateText(lListid)
		if lLineNum then
			lSection = lListid
			lText= IniReadString (lSection, cScrnIdKey, cNotFound, sScrnFile)
			if ltext != cNotFound then
				lRow = StringToInt (StringSegment (lText, cVbar, 1))
				lcol = StringToInt (StringSegment (lText, cVbar, 2))
				llen = StringToInt (StringSegment (lText, cVbar, 3))
				lScrnName = GetTextFromScreen (lRow,lCol,lLen)
				;	 logging
				sScrnLine = StringSegment (sFullScreen, cLF, lLineNum)
				lScrnCol = StringContains (sScrnLine, lListid)
				if nLogging then
					utilLogWrite("GetScreenId - ScrnId:" + lListid + " R:" + IntToString (lLineNum)
					+ " C:" + intToString (lScrnCol) + " Def:" + lText)
				endif
			endif
			if lLineNum == lRow then
				lNotFound = 0
			endif
		endif
		lIndex = lIndex + 1
	endwhile
	if lNotFound then
		nScreenNotDefined = True
		sHoldScrnMsg = cNull
		sScreenID = cNotDefined
	else
		nScreenNotDefined = false
		if sScreenID != lScrnName then
			nColNum = 0
			nColLinePtr = 0
		endif
		sScreenID = lScrnName
	endif
	
	CopyToClipboard (cNull)
	return lScrnName
EndFunction

;****************************************************************************
;	Retrieve the current screen message lines up to 2 msg
;****************************************************************************
String Function GetScreenMessage ()
	var string lText,
	String lMsg1,
	String lMsg2,
	String lMsgFull,
	int lRow,
	int lCol,
	int lLen
	ltext = IniReadString (sScreenID, cScrnMsgKey1 , cNotFound, sScrnFile)
	if ltext != cNotFound then
		lRow = StringToInt (StringSegment (ltext, cVbar, 1))
		lcol = StringToInt (StringSegment (ltext, cVbar, 2))
		llen = StringToInt (StringSegment (ltext, cVbar, 3))
		lMsg1 = GetTextFromScreen (lRow,lCol,lLen) + cLF
	else
		lMsg1 = cBlank
	endif
	ltext = IniReadString (sScreenID, cScrnMsgKey2 , cNotFound, sScrnFile)
	if ltext != cNotFound then
		lRow = StringToInt (StringSegment (ltext, cVbar, 1))
		lcol = StringToInt (StringSegment (ltext, cVbar, 2))
		llen = StringToInt (StringSegment (ltext, cVbar, 3))
		lMsg2 = GetTextFromScreen (lRow,lCol,lLen)
	else
		lMsg2 = cBlank
	endif
	lMsgFull = StringTrimLeadingBlanks (lMsg1) + StringTrimLeadingBlanks (lMsg2)
	if StringIsBlank (lMsgFull) then
		lMsgFull = cBlank
		sHoldScrnMsg = cBlank
	endif
	
	;	 2025-05-17 logging
	if nLogging then
		utilLogWrite("GetScreenMessage - ScrnId:" +  sScreenID + " Def:" + ltext
		+ " TextLen:" +  IntToString (StringLength(lMsgFull)))
	endif
	
	return lMsgFull
EndFunction

;****************************************************************************
;	Read the message Page/Screen nn of nn
;****************************************************************************
String Function GetScreenPageNumber ()
	var string lText,
	string lPageNum,
	int lRow,
	int lCol,
	int lLen
	ltext = IniReadString (sScreenId, cPageNumKey, cNotFound, sScrnFile)
	if ltext != cNotFound then
		lRow = StringToInt (StringSegment (ltext, cVbar, 1))
		lcol = StringToInt (StringSegment (ltext, cVbar, 2))
		llen = StringToInt (StringSegment (ltext, cVbar, 3))
		lPageNum = GetTextFromScreen (lRow,lCol,lLen)
	endif
	
	if nLogging then
		utilLogWrite("GetScreenPageNumber - ScrnId:" +  sScreenID + " Def:" + ltext 
				+ " TextLen:" +  IntToString (StringLength(lText)))
	endif
	
	return lPageNum
EndFunction

;****************************************************************************
;	Retrieve the current screen title
;****************************************************************************
String Function GetScreenTitle ()
	var string lText,
	String lTitle,
	int lRow,
	int lCol,
	int lLen
	ltext = IniReadString (sScreenID, cScrnTitleKey, cNotFound, sScrnFile)
	if ltext != cNotFound then
		lRow = StringToInt (StringSegment (ltext, cVbar, 1))
		lcol = StringToInt (StringSegment (ltext, cVbar, 2))
		llen = StringToInt (StringSegment (ltext, cVbar, 3))
		lTitle = GetTextFromScreen (lRow,lCol,lLen)
	endif
	if nLogging then
		utilLogWrite("GetScreenTitle - ScrnId:" +  sScreenID + " Def:" + ltext 
				+  " TextLen:" +  IntToString (StringLength(lText)))
	endif
	
	return lTitle
EndFunction

;****************************************************************************
;	Speak a field with both label and field data
;	If the tab or BackTab is pressed move the cursor first
;****************************************************************************
String Function GetTabField (string pKey)
	var string lLabel,
	string lFieldData,
	string lField
	if ! Is3270ScreenFocus() then
		if pKey == cTabKey then
			{Tab}
		elif pKey == cBackTabKey then
			{Shift+Tab}
		endif
		return
	EndIf
	PCCursor ()
	if pKey == cTabKey then
		{Tab}
	elif pKey == cBackTabKey then
		{Shift+Tab}
	endif
	delay(nScreenDelay)
	lFieldData = GetChunk ()
	SaveCursor ()
	RouteInvisibleToPC()
	InvisibleCursor ()
	PriorWord ()
	pause ()
	lLabel = GetChunk ()
	RestoreCursor ()
	lField = lLabel + "." + lFieldData
	
	if nLogging then
		utilLogWrite("GetTabField - ScrnId:" + sScreenID + " TextLen:" +IntToString(StringLength (lField)))
	endif
	
	return lField
EndFunction

;******************************************************************************
;	Retrieves a text element from the virtual sFullScreen
;	3 parms are required as follows:
;	1 Line number 1 - 24
;	2 Starting column on the screen 1 - 80
;	3 Length of the text
;******************************************************************************
String Function GetTextFromScreen (int pLineNumber, int pCol, int pLen)
	var string lLine,
	string lText
	lLIne = StringSegment (sFullScreen, cLF, pLineNumber)
	lText = StringTrimLeadingBlanks (SubString (lLine, pCol, Plen))
	if nLogging > 1 then
		utilLogWrite("GetTextFromScreen - ScrnId:" +  sScreenID + " R:" + IntToString (pLineNumber)
		+ " C:" + IntToString(pCol) + " L:" + IntToString(pLen) )
	endif
	return lText
EndFunction

;****************************************************************************
;	Make sure that the 3270 screen is in focus
;	2021-07-07 Remove auth check
;			   Added check for demo version
;****************************************************************************
Int Function Is3270ScreenFocus ()
	var handle lWinHandle,
	string lWinClass

	if DialogActive ()
		|| MenusActive () then
		return false
	endif
	lWinHandle = GetFocus ()
	lWinClass = GetWindowClass (lWinhandle)
	if lWinClass == S3270Window then

		if nLogging then
			utilLogWrite("Is3270ScreenFocus:YES, Talk3270IniWindow:" + S3270Window + " JFWWinclass:" + lWinClass)
		endif
		return true
	else

		if nLogging then
			utilLogWrite("Is3270ScreenFocus:NO, Talk3270IniWindow:" + S3270Window + " JFWWinclass:" + lWinClass)
		endif
		return false
	endif
EndFunction

;**************************************************************************
;	Trap for 3270 keys only
;***************************************************************************
Void Function KeyPressedEvent (int nKey, string strKeyName, int nIsBrailleKey, int nIsScriptKey)
	n3270Key = false
	if (nKey == 28) ;Enter Key
		| (nKey >= 59 && nKey <= 68); PF1 - PF10
		| (nKey == 87 | nKey == 88) ; PF11 - PF12
		| (nKey >= 2097211 && nKey <= 2097220) ;PF13 - PF22
		| (nKey == 2097239 | nKey == 2097240 ) then ; PF23 - PF24

		if Is3270ScreenFocus() then
			n3270Key = True
			nDoAutoRead = True
			nScheduledFunction = ScheduleFunction ("AutoReadTrigger", nAutoReadDelay)
			if nLogging then
				utilLogWrite("KeyPressedEvent - ScrnId:" +  sScreenID 
						+ " heduleFunction (AutoReadTrigger) Delay:" + IntToString (nAutoReadDelay))
			endif
		EndIf
	EndIf
	
	if (nKey == 1)   then ; Escape Key
		if ! (DialogActive ()
			|| MenusActive ())	then
			n3270Key = True
			;SayString ("3270 flag set to on")  ; logging
			;		 2025-05-17 logging
			if nLogging then
				utilLogWrite("KeyPressedEvent - ScrnId:" +  sScreenID + " 3270 flag set to True")
			endif
		EndIf
	EndIf
	KeyPressedEvent (nKey, strKeyName, nIsBrailleKey, nIsScriptKey)
EndFunction

;**********************************************************************
;	Find any text within the full virtual screen and pass
;	back the line number which contains the text
;**********************************************************************
Function LocateText (string pText)
	var int lLinePTR
	lLinePTR = StringSegmentIndex (sFullScreen ,cLF, pText)

	if nLogging == 3 then
		utilLogWrite("LocateText - ScrnId:" +  sScreenID + " Locate:" + pText + " LinePtr:" + IntToString(lLinePTR))
	endif
	return lLinePTR
EndFunction

;**********************************************************************
;	Find any text within a restricted area of the virtual screen
;	and pass back the line number which contins the text
;**********************************************************************
Function LocateTextRestricted (int pStartLine, int pEndLine, string pText)
	var int lLinePTR,
	int lNdx,
	string lText
	lNdx = pStartLine
	While (lNdx <= pEndLine)
		lText = StringSegment(sFullScreen, cLF, lNdx)
		if StringContains(lText, pText) then
			lLinePTR = lNdx
			lNdx = 99
		else
			lNdx = lNdx+ 1
		endif
	endwhile
	
	if nLogging then
		utilLogWrite("LocateTextRestricted - ScrnId:" +  sScreenID + " Pointer:" + IntToString (lLinePTR))
	endif
	return lLinePTR
EndFunction

;**********************************************************
;	Move the active cursor to any line on the
;	screen where lines are lettered "a" through "y".
;	2016-11-23 Reverted v1.0 code for MoveTo
;			   Change cursor from Invisible to PC prior to MoveTo
;	2017-10-09 Change method to use NextLine
;**********************************************************
String Function MoveToLine ()
	var string sLetter,
	string sRow,
	string sLetterRowTable,
	string sLineNumber,
	string sLineText,
	int nRow,
	int nIndex,
	int nVertPos
	sLetter = SubString (GetCurrentScriptKeyName (),StringLength (GetCurrentScriptKeyName()) , 1)
	nRow = StringSegmentIndex (cLetterRowTable, cVbar, sLetter, false)
	nVertPos = (nVertPos * nLineHeight) + nTopOfScreen
	InvisibleCursor ()
	;	move the cursor to top of screen
	MoveTo (nLeftMargin,nTopOfScreen)
	nIndex = 1
	while nIndex < nRow
		NextLine ()
		nIndex = nIndex + 1
	endwhile
	RoutePcToInvisible ()
	{tab}
	if GetVerbosity () == Beginner then
		sLineNumber = "line "  + IntToString (nRow)
		sLineText = sLineNumber + cBlank + GetTextFromScreen (nRow,1,80)
	else
		sLineText = GetTextFromScreen (nRow,1,80)
	endif

	if nLogging then
		utilLogWrite("MoveToLine - ScrnId:" +  sScreenID + " KeyPress:" + GetCurrentScriptKeyName()
		+ "R=:" + IntToString (nRow))
	endif
	return sLineText
EndFunction

;**************************************************************
;	PriorWord & NextWord are defined here because the 3270
;	MAINFRAME does not support such CURSOR MOVEMENT FUNCTIONS.
;**************************************************************
Script SayPriorWord ()
	var string lsWord,
	string lsRestOfLine
	if Is3270ScreenFocus () then
		PriorWord()
		lsRestOfLine = StringTrimLeadingBlanks (GetToEndOfLine ()) + cBlank
		lsRestOfLine = StringReplaceChars (lsRestOfline, cTabChar , cBlank)
		lsWord = StringSegment (lsRestOfLine, cBlank, 1 )

		if nLogging then
			utilLogWrite("SayPriorWord - ScrnId:" +  sScreenID + "Next Word " + lsWord + "Rest of Line" + lsRestOfLine )
		endif
		say(lsWord,OT_String)
	else
		PriorWord()
		SayWord()
	endif
EndScript

Script SayNextWord ()
	var string lsWord,
	string lsRestOfLine
	if Is3270ScreenFocus () then
		NextWord()
		lsRestOfLine = StringTrimLeadingBlanks (GetToEndOfLine ()) + cBlank
		lsRestOfLine = StringReplaceChars (lsRestOfline, cTabChar , cBlank)
		lsWord = StringSegment (lsRestOfLine, cBlank, 1 )

		if nLogging then
			utilLogWrite("SayNextWord - ScrnId:" +  sScreenID + "Next Word " + lsWord + "Rest of Line" + lsRestOfLine )
		endif
		say(lsWord,OT_String)
	else
		NextWord()
		SayWord()
	endif
EndScript

;***************************************************************************
;	Check to see if the window being written to is the 3270 terminal screen
;	if so, then refresh the screen image in memory then trigger the
;	AutoReadNewText Script
;***************************************************************************
Void Function ScreenStabilizedEvent  (handle hwndLastScreenWrite)
	;	if not a 3270 key and the 3270 screen being written to then exit
	if GetWindowClass (hwndLastScreenWrite) == s3270Window then

		if nLogging > 1 then
			utilLogWrite("ScreenStabilizedEvent - ScrnId:" +  sScreenID +  " window Class:" + GetWindowClass (hwndLastScreenWrite))
		endif
		return
	EndIf
	if UnScheduleFunction (nScheduledFunction)
		&& n3270Key  then
		AutoReadNewText (True)
	EndIf

	if nLogging > 1 then
		utilLogWrite("ScreenStabilizedEvent - ScrnId:" +  sScreenID)
	endif
	
EndFunction

;****************************************************************************
;	Grabs the full 3270 window in places it into the virtual sFullScreen
;	var for processing
;	2024-04-07 - Added newer function GetTextInWindow after check to see if we got the screen
;	2025-05-17 - Function RefreshScreenImage GetTextInRect change attribute flag from 1 to 0,
;				 new 9th parm COORDSYS_xx that must be set
;****************************************************************************
Function RefreshScreenImage ()
	var	int lRight,
		int lBottom
		
	if ! Is3270ScreenFocus() then
		return
	EndIf
	lRight = GetWindowRight (GetFocus ())
	lBottom = GetWindowBottom (GetFocus ())
	sFullScreen = GetTextInRect (nLeftMargin, nTopOfScreen,
					lRight , lBottom, 0, IgnoreColor, IgnoreColor, True, 0)

	if nLogging then
		utilLogWrite("RefreshScreenImage - Len:" + IntToString(StringLength(sFullScreen)) + " GetTextInRect:" 
				+ " L:" + IntToString(nLeftMargin) + " T:" + IntToString(nTopOfScreen)
				+ " R:" + IntToString(lRight) + " B:" + IntToString(lBottom))
	endif 
	if StringLength (sFullScreen) == 0 then
		sFullScreen = GetTextInWindow (GetCurrentWindow ())

		if nLogging then
			utilLogWrite("RefreshScreenImage - Len:" + IntToString(StringLength(sFullScreen)) + " GetTextInWindow:")
		endif
	endif

	if nLogging == 3 then
		CopyToClipboard (sFullScreen)
		utilLogWrite("Copy screen to clipboard: Len:" + IntToString(StringLength(sFullScreen)))
	endif
EndFunction

;*******************************************************************************
;	Check screen top, bottom, left, CharWidh, LineHeight to make
;	sure they are greater than zero
;*******************************************************************************
Function ScreenAttribError ()
	var int nScreenError
	if  nTopOfScreen <= 0 then
		nScreenError = true
	elif nLeftMargin <= 0 then
		nScreenError = true
	elif nLineHeight <= 0 then
		nScreenError = true
	elif nCharWidth <= 0 then
		nScreenError = true
	else
		nScreenError = false
	endif

	if nLogging then
		utilLogWrite("ScreenAttribError - ScrnId:" +  sScreenID + " ScrnErr:" + IntToString (nScreenError)
				+ " Top:" + IntToString(nTopOfScreen) + cBlank
				+ " Left:" + IntToString(nLeftMargin) + cBlank
				+ " Line-H:" + IntToString(nLineHeight) + cBlank
				+ " Char-W:" + IntToString(nCharWidth))
	endif
	return nScreenError
EndFunction


;****************************************************************************
;	Get line height and character width, left margin and
;	top of screens possitions for this Workstation
;	2017-06-19 1. Added checking to make sure talk3270admin.ini
;				  params has the correct data. If not put out msg.
;			   2. Force reading attribs from INI if using in test mode
;				  i.e. PsPad, Notepad, etc
;****************************************************************************
Function utilGetSreenProperties ()
	var int llineTop,
	int llineBottom,
	int nBottomOfScreen,
	int nRightMargin,
	int nErr,
	handle lWindHandle,
	string lwinClass,
	string lKey,
	string lScrnAttribs,
	string lText,
	string lScreenInfo
	SpeechOff(True)
	;	Read the WinClass and Screen Delay from the INI File
	nScreenDelay = IniReadInteger(cAdmin, cScrnDelayKey, cDefalutScreenDelay, sAdmFile )
	delay(nScreenDelay)
	nAutoReadDelay = IniReadInteger(cAdmin, cAutoReadDelayKey, cDefalutAutoReadDelay, sAdmFile )
	s3270Window = IniReadString (cAdmin, cWinClasskey, cNotFound, sAdmFile )
	lWindHandle = GetCurrentWindow ()
	RefreshWindow (lWindHandle)
	nTopOfScreen = GetWindowTop (lWindHandle )
	nBottomOfScreen = GetWindowBottom (lWindHandle )
	nRightMargin = GetWindowRight (lWindHandle )
	nLeftMargin = GetWindowLeft (lWindHandle)
	SaveCursor ()
	;	get the line hight and Character width
	InvisibleCursor ()
	MoveTo (nLeftMargin+100, nTopOfScreen-100 )
	MoveToNextWord ()
	NextCharacter ()
	;	Get character width
	NextCharacter ()
	nCharWidth = GetCharacterWidth ()
	;	Get line height
	lLineTop = GetLineTop()
	lLineBottom = GetLineBottom ()
	nLineHeight = lLineBottom - lLineTop
	RestoreCursor ()
	
	if ScreenAttribError () then
		lScrnAttribs = IniReadString (cAdmin, cScrnAttribKey, cNotFound, sAdmFile )
		if lScrnAttribs == cNotFound
			lScrnAttribs == "70|1|18|10"

			if nLogging then
				utilLogWrite("utilGetSreenProperties - ScrnId:" +  sScreenID 
							+ "Read attrib ***ERROR*** Using AdmIni default Attributes " + lScrnAttribs)
			endif
		else
			nTopOfScreen = StringToInt (StringSegment (lScrnAttribs , cVbar, 1))
			nLeftMargin = StringToInt (StringSegment (lScrnAttribs , cVbar, 2))
			nLineHeight = StringToInt (StringSegment (lScrnAttribs , cVbar, 3))
			nCharWidth = StringToInt (StringSegment (lScrnAttribs , cVbar, 4))

			if nLogging then
				utilLogWrite("utilGetSreenProperties - ScrnId:" +  sScreenID + "Using terminal Attributes"
				+ " Top:" + IntToString(nTopOfScreen) + cBlank
				+ " Left:" + IntToString(nLeftMargin) + cBlank
				+ " Line-H:" + IntToString(nLineHeight) + cBlank
				+ " Char-W:" + IntToString(nCharWidth))
			endif
		endif
	endif
	SpeechOn(True)
EndFunction

;************************************************************************************************
;	Displays Screen Name, Title, Line Height, Character width,
;	and location of the cursors
;	09-10-11 - Corrected possible issue with getCharWidth
;			 - Add message to status screen to indicate if using default
;				 attributes for Char Width and Line Height
;	2014-07-27 - Add code for last modified date handling and
;				 displaying on info screen
;	2024-04-07 - Changed position due to changes in JAWS function GetCurrentCol & GetCurrentCRow
;************************************************************************************************
Script UtilGetScreenInfo ()
	var handle lWinHand,
	string lpRow,
	string lpCol,
	string ljRow,
	string ljCol,
	string lText,
	string lWinClass,
	string lScreenInfo,
	string laMsg,
	string lsAtribMsg,
	string lsColMod,
	string lsFileMod,
	string lsScrnMod,
	string sJSetDirectory,
	string lsMode,
	string lsMaxTermWin
	
	SpeechOff(True)

	if nLogging then
		utilLogWrite("UtilGetScreenInfo - ScrnId:" +  sScreenID)
	endif
	
	;	v3.7 #1 always authorized
	laMsg = msgAuth
	
	RefreshScreenImage ()
	utilGetSreenProperties ()
	SaveCursor ()
	JAWSCursor ()
	lText = GetCurrentPosition ()
	ljCol = StringSegment (ltext, cVbar, 2)
	ljRow = StringSegment (ltext, cVbar, 3)
	RestoreCursor ()
	PCCursor ()
	lText = GetCurrentPosition ()
	lpCol = StringSegment (ltext, cVbar, 2)
	lpRow = StringSegment (ltext, cVbar, 3)
	lWinClass = GetWindowClass (GetCurrentWindow ())
	if s3270Window == cNotFound
		|| s3270Window  == cBlank then
		s3270Window  = lWinClass
		IniWriteString (cAdmin, cWinClasskey, s3270Window, sAdmFile,True)
	elif StringCompare (s3270Window, lWinClass, false) then
		lWinClass = lWinClass + msgWinClassErr
	endif
	if ScreenAttribError () then
		lsAtribMsg = MsgSI17 ;Using Admin.ini scr attrib 
	else
		lsAtribMsg = MsgSI18 ;got from terminal scrn  
	endif
	if nLogging == 1 then
		lsMode = cLogBasic
	elif nLogging == 2 then
		lsMode = cLogAdvanced
	elif nLogging == 3 then
		lsMode = cLogAdvancedCpy
	else
		lsMode = cNull
	endif
	
	;	get Setting Directory
	lText = GetJawsSettingsDirectory ()
	sJSetDirectory = StringRight (lText, 23)
	
	;	Get Last modified dates for INI files 
	;	change to get the actual file date not from the INI file for better support 
	lsScrnMod = IntToString (GetFileDate(sScrnFile))
	lsFileMod = IntToString (GetFileDate(sFldFile))
	lsColMod = IntToString (GetFileDate(sColFile))
	
	;	v3.7 #1 removed extra blanks lines to make box smaller
	;	changed to get JAWS Serial # here than from var at autoStartEvent
	;	changed to get Talk3270 Serial # and Company name from admin.ini
	sAdminCompName = IniReadString (cAdmin, cCompName, cNotFound, sAdmFile )
	cUserJfwSerNo = IniReadString (cAdmin, cJFWSerKey, cNotFound, sAdmFile )
	sAdminT3270SerNo = IniReadString (cAdmin, cT3SerKey, cNotFound, sAdmFile )
	
	;	v3.7 #2 max term window
	;	if set in ini file to n then turn off
	if IniReadString (cAdmin, cMaxTermWinKey, cNotFound, sAdmFile) == cNo then
		nMaxTermWin=0
		lsMaxTermWin=msgsI29n
	else
		nMaxTermWin=1
		lsMaxTermWin=msgsI29y
	endif
	
	lScreenInfo = "            TALK3270 V" + cT3Ver + cLF + cLF +
	MsgSI1 + sAdminCompName + cBlank + msgAuth2a + cUserJfwSerNo + cLF +
	msgSI2 + sAdminT3270SerNo + cLF +
	msgSI26 + IntToString (GetJFWSerialNumber())  + cLF +
	"    " + GetJAWSVersionInfo ()  + cLF +
	MsgSI4 + GetAppFileName () + cLf +
	MsgSI5 + s3270Window  + cLF +
	MsgSI6 + lWinClass + cLF + cLf +
	msgSI25 + sJSetDirectory + cLf + cLf +
	;	INI FIle modification dates
	msgSI20 + cLF +
	MsgSI21 + lsScrnMod + cLF +
	MsgSI22 + lsFileMod + cLF +
	MsgSI23 + lsColMod + cLF + cLF +
	msgSI3  + cLF +
	MsgSI7 + GetScreenId () + cLF +
	MsgSI8 + GetScreenTitle () + cLF + cLf +
	MsgSI9 + IntToString (nScreenDelay) + "ms" + cLF +
	MsgSI10 + IntToString (nAutoReadDelay) + "ms" + cLF +
	lsMaxTermWin + clf  +
	lsAtribMsg + clf  +
	MsgSI11 + IntToString(nTopOfScreen) + cLF +
	MsgSI12 + IntToString(nLeftMargin) + cLF +
	MsgSI13 + IntToString(nLineHeight) + cLF +
	MsgSI14 + IntToString(nCharWidth) + cLF +  cLf +
	MsgSI15 + " C" + lpCol + " R" + lpRow +  cLF +
	;	change to read correctly from JAWS instead of calculating
	MsgSI16 + " C" + ljCol + " R" + ljRow + " pixels" + cLF  + cLF +
	lsMode + cLF  + cLF +
	;	added for info box to display date 
	msgsI30 + SysGetDate ("yyyy-MMM-dd") + cBlank + SysGetTime ("hh:mm tt")
	SpeechOn(True)
	ExMessageBox (lScreenInfo, sAdminCompName + " - " + msgTalk3270, mb_DefButton1)
EndScript

;***************************************************************************
;	See if the TALK3270 Hot-Keys need rebuilding
;	2010-03-25 - Added hotkey for CopyField3270 and PasteField3270
;	2017-10-09 - Change hotkeys for move to line function
;***************************************************************************
Void Function UtilBuildHotkeys ()
	var string sKey,
	string sScriptName,
	int nCounter
	sKeyMapFile = sJSetDirectory+ sAppFileName  + ".jkm"
	nErrors = false
	UserBufferClear ()
	sBufferText = msgKeayAssignError
	;
	Say (msgPleaseWait, 1, 0)
	sScriptName = "ShowMenu "
	sKey = "`"
	utilAddHotKey (sKey,sScriptName)
	;
	sScriptName = "VerifyHotKeys"
	sKey = "ALT+Control+K";
	utilAddHotKey (sKey,sScriptName)
	;
	sScriptName = "SayAutoReadText"
	sKey = "Control+Windows+/"
	utilAddHotKey (sKey,sScriptName)
	;
	sScriptName = "SayScreenFields "
	sKey = "CONTROL+/"
	utilAddHotKey (sKey,sScriptName)
	;
	sScriptName = "ViewScreenFields "
	sKey = "CONTROL+SHIFT+/"
	utilAddHotKey (sKey,sScriptName)
	;
	sScriptName = "SayScreenTitleAndMessage"
	sKey = "Control+Windows+I"
	utilAddHotKey (sKey,sScriptName)
	;
	sScriptName = "SayScreenPageNumber "
	sKey = "Control+Windows+N"
	utilAddHotKey (sKey,sScriptName)
	;
	sScriptName = "SayTabField"
	sKey = "Windows+TAB"
	utilAddHotKey (sKey,sScriptName)
	;
	sScriptName = "SayCurrentPosition"
	sKey = "Control+Delete"
	utilAddHotKey (sKey,sScriptName)
	;
	sScriptName = "TabForWardSpeak"
	sKey = "Tab"
	utilAddHotKey (sKey,sScriptName)
	;
	sScriptName = "TabBackSpeak"
	sKey = "Shift+Tab"
	utilAddHotKey (sKey,sScriptName)
	;
	sScriptName = "SayPriorWord"
	sKey = "Control+LeftArrow"
	utilAddHotKey (sKey,sScriptName)
	;
	sScriptName = "SayNextWord"
	sKey = "Control+RightArrow"
	utilAddHotKey (sKey,sScriptName)
	;
	sScriptName = "CopyField3270"
	sKey = "Windows+C"
	utilAddHotKey (sKey,sScriptName)
	;
	sScriptName = "CopyLine3270"
	sKey = "Alt+Windows+C"
	utilAddHotKey (sKey,sScriptName)
	;
	sScriptName = "CopySelected3270"
	sKey = "Windows+Control+C"
	utilAddHotKey (sKey,sScriptName)
	;
	sScriptName = "PasteField3270"
	sKey = "Windows+V"
	utilAddHotKey (sKey,sScriptName)
	;
	sScriptName = "SayHelpKeys"
	sKey = "JAWSKey+H"
	utilAddHotKey (sKey,sScriptName)
	;
	sScriptName = "UtilGetScreenInfo"
	sKey = "Alt+Windows+S"
	utilAddHotKey (sKey,sScriptName)
	;
	; Add Column navagation Keys
	sScriptName = "NextColumn"
	sKey = "Alt+Control+RightArrow"
	utilAddHotKey (sKey,sScriptName)
	;
	sScriptName = "PreviousColumn"
	sKey = "Alt+Control+LeftArrow"
	utilAddHotKey (sKey,sScriptName)
	;
	sScriptName = "SayNextLineInColumn"
	sKey = "Alt+Control+DownArrow"
	utilAddHotKey (sKey,sScriptName)
	;
	sScriptName = "SayPreviousLineInColumn"
	sKey = "Alt+Control+UpArrow"
	utilAddHotKey (sKey,sScriptName)
	;
	sScriptName = "MoveToTopOfColumn"
	sKey = "Alt+Control+Home"
	utilAddHotKey (sKey,sScriptName)
	;
	sScriptName = "MoveToBottomOfColumn"
	sKey = "Alt+Control+End"
	utilAddHotKey (sKey,sScriptName)
	;
	;add the MoveToLine keys CONTROL+SHIFT+letter
	sScriptName = "MoveCursorToRow"
	nCounter = 0
	WHILE (nCounter < 25)
		nCounter = nCounter + 1
		sKey = "Shift+Windows+" + StringSegment (cLetterRowTable, cVbar, nCounter)
		utilAddHotKey (sKey,sScriptName)
	endwhile
	;
	sScriptName = "MoveCursorToRow"
	sKey = "WINDOWS+SHIFT+Y"
	utilAddHotKey (sKey,sScriptName)
	
	;	 2025-05-17 logging
	sScriptName = "LoggingSelect"
	sKey = "ALT+Control+WINDOWS+L"
	utilAddHotKey (sKey,sScriptName)
	if nLogging then 
		utilLogWrite("UtilBuildHotkeys - Err= ") + IntToString (nErrors)
	endif
	
	exitVerifyHotKeys ()
	
	if nErrors then
		sBufferText = sBufferText + msgErrorTotal + IntToString(nErrors)
		+ msgErrorChanges + cLF
		CopyToClipboard (sBufferText)
		sBufferText = sBufferText + msgErrorCopy
		RedirectToUserBuffer (sBufferText)
	else
		sBufferText = cNull
		Say (msgKeyUpdated, 1, 0)
	endif
	
EndFunction


;***************************************************************************
;	Read the application name JKM file and makes sure the keys
;	are present. If not defined then adde key and script
;	capture any key conflict where key was attached to a frame.
;***************************************************************************
Function UtilAddHotKey (string pKey, string pScriptName)
	var string lReturnText,
	int lFrameFound
	lFrameFound = false
	lReturnText = StringLower(IniReadString(cDeskTopKeys,pKey,cNotFound,sKeyMapFIle))
	;	is the key currently associated to a frame
	if StringContains (lReturnText, "sayframe") then
		sBufferText = sBufferText  + pKey + ":" + lReturnText + cLF
		nErrors = nErrors + 1
		lFrameFound = true
	endif
	;	did we find the key
	if lReturnText != cNotFound then
		IniRemoveKey (cDeskTopKeys, pKey, sKeyMapFIle)
	endif
	IniWriteString (cDeskTopKeys, pKey, pScriptName, sKeyMapFIle,True)

	if nLogging then 
		utilLogWrite("UtilAddHotKey - " + pScriptName + "hKey:" + pKey)
	endif
	
EndFunction

;***************************************************************************
;	All column processing is handeled by this function including
;	both moving and reading
;***************************************************************************
Function ProcessColumns (string pMove)
	var string lColString,
	string lsColKey,
	string lsColData,
	int lnColTop,
	int lnColBtm,
	int lnColLeft,
	int lnColLen,
	int lnViewPtr
	
	if ! Is3270ScreenFocus () then
		return
	endif
	;	is there columns defined for this screen
	lsColKey = cColumnKey  + "1"
	lColString = IniReadString (sScreenId, lsColKey, cNotFound, sColFile)
	
	if lColString == cNotFound then
		Say(msgColNone,OT_String)
		return
	endif
	
	if pMove == cRight then
		nColNum = nColNum + 1
	elif pMove == cLeft then
		nColNum = nColNum - 1
	endif
	
	if nColNum < 1 then
		nColNum = 1
		say (msgColFirst,OT_String)
	endif
	
	;	Get the column definition
	lsColKey = cColumnKey  + StringTrimLeadingBlanks (IntToString (nColNum))
	lColString = IniReadString (sScreenId, lsColKey, cNotFound, sColFile)
	
	if lColString == cNotFound then
		; try previous column
		nColNum = nColNum - 1
		nColLinePtr = 0
		say (msgColLast ,OT_String)
		lsColKey = cColumnKey  + StringTrimLeadingBlanks (IntToString (nColNum))
		lColString = IniReadString (sScreenId, lsColKey, cNotFound, sColFile)
	endif
	
	;	get column position
	lnColTop = StringToInt (StringSegment (lColString , cVbar, 1))
	lnColBtm = StringToInt (StringSegment (lColString , cVbar, 2))
	lnColLeft = StringToInt (StringSegment (lColString , cVbar, 3))
	lnColLen = StringToInt (StringSegment (lColString , cVbar, 4))
	
	if pMove == cView then
		;
	elif nColLinePtr == 0 then
		nColLinePtr =  lnColTop
	elif pMove == cHome then
		nColLinePtr = lnColTop
	elif pMove == cEnd then
		nColLinePtr = lnColBtm
	elif pMove == cDown then
		nColLinePtr = nColLinePtr + 1
	elif pMove == cUp then
		nColLinePtr = nColLinePtr - 1
	endif
	
	if nColLinePtr < lnColTop then
		say(msgColTop, OT_String)
		say(msgColTop + IntToString (nColNum),OT_String)
		nColLinePtr =  lnColTop
	elif nColLinePtr > lnColBtm then
		say(msgColBtm + IntToString (nColNum),OT_String)
		nColLinePtr =  lnColBtm
	elif pMove == cRight
		|| pMove == cLeft then
		Say(msgColPos + IntToString (nColNum), OT_string)
	endif
	
	if pMove == cView then
		;	place the entire column in the virtual viwer
		sBufferText = msgColPos + cBlank + IntToString (nColNum) + cLF
		lnViewPtr = lnColTop
		While lnViewPtr  <= lnColBtm && ! IsKeyWaiting ()
			lsColData = GetTextFromScreen (lnViewPtr ,lnColLeft ,lnColLen )
			AddTextToBuffer(lsColData, cLF)
			lnViewPtr  = lnViewPtr  + 1
		endwhile
		AddTextToBuffer(msgCloseWindow, cLF)
		UserBufferClear ()
		UserBufferAddText (sBufferText)
		UserBufferActivate (False)
		SayAll (0)
	else
		;	Read the column line data for current PTR
		lsColData = GetTextFromScreen (nColLinePtr ,lnColLeft ,lnColLen )
		say(lsColData, OT_String)
	endif

	if nLogging then
		utilLogWrite("ProcessColumns - ScrnId:" +  sScreenId + " Def:" + lColString
		+ " Len:" +  IntToString (StringLength(lsColData)))
	endif
EndFunction

;***************************************************************************
;	Start Stop logging 
;***************************************************************************
Function utilLogToggle (int pnLogging)
	var string sLogStamp,
		string lText,
		string lMsg,
		;	for admin ini file reads 
		string lsJawsSer,
		string lsScrnAttrib,
		string lsWinClass,
		string lsUserJFWSerNo,
		string lsMaxTermWindow,
		int lnAutoReadDelay,
		int lnScrnDelay,
		int lnLogging,
		int liPos 
	
	nLogging = pnLogging 
	if nLogging == 0
		Say(cLogStopped,OT_Message)
		utilLogWrite(cLogStopped + cBlank + SysGetDate ("yyyy-MM-dd") + cBlank + SysGetTime ("HH:mm:ss" ))
		return
	endif
	
	if nLogging == 1 then
		lMsg = cLogBasic
	elif nLogging == 2 then
		lMsg = cLogAdvanced
	elif nLogging == 3 then
		lMsg = cLogAdvancedCpy
	endif

	nLogCnt = 999

	utilLogWrite(lMsg + "-----------------------------------------------------------------")
	utilLogWrite(sAdminCompName + " Talk3270 Ver:" + cT3Ver)
	utilLogWrite("JAWS Setting directory: " + GetJawsSettingsDirectory())
	utilLogWrite(GetJAWSVersionInfo () + ", JAWS Serial No. " + IntToString (GetJFWSerialNumber()) )
	;	get Admin ini data 
	lnScrnDelay = IniReadInteger(cAdmin, cScrnDelayKey, cDefalutScreenDelay, sAdmFile )
	lnAutoReadDelay = IniReadInteger(cAdmin, cAutoReadDelayKey, cDefalutAutoReadDelay, sAdmFile )
	lsScrnAttrib = IniReadString (cAdmin, cScrnAttribKey, cNotFound, sAdmFile )
	lsWinClass = IniReadString (cAdmin, cWinClasskey, cNotFound, sAdmFile )
	lsMaxTermWindow = IniReadString (cAdmin, cMaxTermWinKey, cNotFound, sAdmFile)
	lsUserJFWSerNo = IniReadString (cAdmin, cJFWSerKey, cNotFound, sAdmFile )
	utilLogWrite("Talk3270Admin file Parms: " + cScrnDelayKey + ":" + IntToString(lnScrnDelay) + cBlank
				+ cAutoReadDelayKey + ":" + IntToString(lnAutoReadDelay) + cBlank
				+ cScrnAttribKey + ":" + lsScrnAttrib + cBlank
				+ cJFWSerKey + ":" + lsUserJFWSerNo + cBlank
				+ cWinClasskey + ":" + lsWinClass + cBlank
				+ cMaxTermWinKey + ":" + lsMaxTermWindow + cBlank
				+ cLogKey + ":" + IntToString(lnLogging))
	say(lMsg,OT_Message)
EndFunction


;***************************************************************************
;	Write out log data
;***************************************************************************
Function utilLogWrite (string psMSG)
	var string sLogStamp
		
	;	need to add counter in fromt of time as time won't be unique
	nLogCnt = nLogCnt + 1
	sLogDate = SysGetDate ("yyyy-MM-dd")
	sLogStamp = SysGetTime ("HH:mm:ss" ) +  "." + IntToString (nLogCnt) 
	IniWriteString (sLogDate, sLogStamp,  StringTrimLeadingAndTrailingBlanks(psMSG), sLogFIle, True, wdUser )

EndFunction


;******************************** Scripts with hotkeys ***************
;
;****************************************************************************
; Copy and paste scripts
;	10-03-25 - Added
;	11-05-25 - added copy line and copy pre-selected text
;                        Window+C 			Copy Field
;                        Shift+Windows+C	Copy Line
;                        Ctrl+Windows+C		Copy Selected
;****************************************************************************
Script CopyField3270 ()
	var  string ltext
	
	if ! Is3270ScreenFocus() then
		return
	EndIf
	ltext = getword()
		if StringIsBlank (ltext) then say (msgNoClipboard, ot_string) else
		CopyToClipboard (ltext)
		say (ltext + msgDataCopied, ot_string)
	endif

	if nLogging then
		utilLogWrite("CopyField3270 - ScrnId:" +  sScreenId +  msgDataCopied +
		" Len:" +  IntToString (StringLength(ltext)))
	endif
EndScript

Script CopyLine3270 ()
	var  string ltext
	if ! Is3270ScreenFocus() then
		return
	EndIf
	ltext = GetLine ()
	if StringIsBlank (ltext) then
		say (msgNoClipboard, ot_string)
	else
		CopyToClipboard (ltext)
		say (ltext + msgDataCopied, ot_string)
	endif

	if nLogging then
		utilLogWrite("CopyLine3270 - ScrnId:" +  sScreenId +  msgDataCopied +
		" Len:" +  IntToString (StringLength(ltext)))
	endif
EndScript

Script CopySelected3270 ()
	if ! Is3270ScreenFocus() then
		return
	EndIf
	{alt+e} {c}
	say (msgDataCopied, ot_string)
EndScript

Script PasteField3270 ()
	if ! Is3270ScreenFocus() then
		return
	EndIf
	{alt+e} {p}
	say (msgDataPasted, ot_string)
EndScript

;****************************************************************************
;	Make sure that the required JAWS application
;	hotkeys are present in the file. If they are not then the
;	keys are added to the JKM file.  The viewer will pop up
;	showing all changes.
;	The hotkey for this script is Alt+Control+K
;	10-03-05 - Added logic to see if the hotkeys need building
;****************************************************************************
Script VerifyHotKeys ()
	var string sKey,
	string lReturnText

	if nLogging then
		utilLogWrite("VerifyHotKeys - ScrnId:" +  sScreenId)
	endif

	if 	GetCurrentScriptKeyName () == "Alt+Control+K" then
		UtilBuildHotkeys ()
	else
		sKeyMapFile = sJSetDirectory+ sAppFileName  + ".jkm"
		sKey = "Alt+Control+K"
		lReturnText = StringLower(IniReadString(cDeskTopKeys,sKey ,cNotFound,sKeyMapFIle))
		if lReturnText == cNotFound then
			UtilBuildHotkeys ()
		else
			Say (msgHotKeysOK, 1, 0)
		endif
	endif
EndScript

;****************************************************************************
;	Retrieve predefined fields and speak then
;****************************************************************************
Script SayScreenFields ()

	if nLogging then
		utilLogWrite("SayScreenFields - ScrnId:" +  sScreenID)
	endif

	if ! Is3270ScreenFocus() then
		return
	EndIf
	RefreshScreenImage()
	sBufferText = cNull
	GetScreenId ()
	
	if nScreenNotDefined then
		return
	endif
	GetScreenFields ()
	if IsSameScript () then
		sBufferText = sBufferText + msgCloseWindow
		UserBufferClear ()
		UserBufferAddText (sBufferText)
		UserBufferActivate (False)
		SayAll (0)
	else
		say(sBufferText ,OT_STRING)
	endif
EndScript

;****************************************************************************
;	Retrieve predefined fields place then in the virtual viewer
;****************************************************************************
Script ViewScreenFields ()

	if nLogging then
		utilLogWrite("ViewScreenFields - ScreenID:" + sScreenID)
	endif

	if ! Is3270ScreenFocus() then
		return
	EndIf
	RefreshScreenImage()
	sBufferText = cNull
	GetScreenId ()
	
	if nScreenNotDefined then
		return
	endif
	GetScreenFields ()
	sBufferText = sBufferText + msgCloseWindow
	UserBufferClear ()
	UserBufferAddText (sBufferText)
	UserBufferActivate (False)
	SayAll (0)
EndScript

;****************************************************************************
;	Read Page/Screen nn of nn
;****************************************************************************
Script SayScreenPageNumber ()
	var string lPageNum

	if nLogging then
		utilLogWrite("SayScreenPageNumber - ScreenID:" + sScreenID)
	endif
	
	if ! Is3270ScreenFocus() then
		return
	EndIf
	sBufferText= cNull
	RefreshScreenImage ()
	GetScreenId ()
	
	if nScreenNotDefined then
		return
	endif
	lPageNum = GetScreenPageNumber ()
	if StringIsBlank (lPageNum) then
		return
	endif
	if IsSameScript () then
		sBufferText = lPageNum + cLF + msgCloseWindow
		UserBufferClear ()
		UserBufferAddText (sBufferText)
		UserBufferActivate (False)
		SayAll (0)
	else
		say(lPageNum,OT_String)
	endIF

EndScript

;--------------------------------------------------------------------------
;	Re say all text which was automatically spoken
;	when the screen was first displayed
;--------------------------------------------------------------------------
Script SayAutoReadText ()

	if nLogging then
		utilLogWrite("SayAutoReadText - ScrnId:" + sScreenID + " TextLen:" + IntToString(StringLength(sBufferText)))
	endif

	nDoAutoRead = True
	AutoReadNewText (False)
	
	if IsSameScript () then
		sBufferText = sBufferText + msgCloseWindow
		UserBufferClear ()
		UserBufferAddText (sBufferText)
		UserBufferActivate (False)
		SayAll (0)
	else
		say(sBufferText,OT_String)
	endIF
EndScript

;****************************************************************************
;	Must define the tab so that the label and field data are
;	spoken as you tab or back-tab.
;****************************************************************************
Script TabForwardSpeak ()
	Say (GetTabField(cTabKey),OT_STRING)
EndScript

Script TabBackSpeak ()
	Say (GetTabField(cBackTabKey),OT_STRING)
EndScript

Script SayTabField ()
	var string lText
	lText = GetTabField(cNull)
	if IsSameScript () then
		sBufferText = lText+ cLF + msgCloseWindow
		UserBufferClear ()
		UserBufferAddText (sBufferText)
		UserBufferActivate (False)
		SayAll (0)
	else
		say(lText,1)
	endIF

	if nLogging then
		utilLogWrite("TabForwardSpeak - ScrnId:" + sScreenID + " TextLen:" + IntToString(StringLength(lText)))
	endif
EndScript

;***********************************************************
;	Say the cursor position in terms of the 3270 terminal
;	layout IE Row and Column 25x80
;***********************************************************
Script SayCurrentPosition ()
	var string sRow,
	string sCol,
	string sCursor,
	string lText

	if nLogging then
		utilLogWrite("SayCurrentPosition - ScrnId:" + sScreenID)
	endif
	
	lText = GetCurrentPosition ()
	sCursor = StringSegment (ltext, cVbar, 1)
	sCol = StringSegment (ltext, cVbar, 2)
	sRow = StringSegment (ltext, cVbar, 3)
	if IsPCCursor () then
		lText = sCursor + msgsI27 + sCol + msgsI28 + sRow
	else
		lText = sCursor + sCol + cBlank + sRow
	endif
	if IsSameScript () then
		sBufferText = lText+ cLF + msgCloseWindow
		UserBufferClear ()
		UserBufferAddText (sBufferText)
		UserBufferActivate (False)
		SayAll (0)
	else
		say(lText,OT_String)
	endif
EndScript

;**********************************************************
;	Move the active cursor to any line on the screen where
;	the 24 lines are lettered "a" through "x".
;**********************************************************
Script MoveCursorToRow ()
	var string sLineText
	sLineText = MoveToLine ()
	if IsSameScript () then
		sBufferText = sLineText +cLF + msgCloseWindow
		UserBufferClear ()
		UserBufferAddText (sBufferText)
		UserBufferActivate (False)
		SayAll (0)
	else
		say (sLineText ,OT_STRING)
	endIF

	if nLogging then
		utilLogWrite("MoveCursorToRow - ScrnId:" + sScreenID + " TextLen:" + IntToString(StringLength(sLineText)))
	endif
EndScript

;****************************************************************************
;	Read the Screen title and Message line
;****************************************************************************
Script SayScreenTitleAndMessage ()

	if nLogging then
		utilLogWrite("SayScreenTitleAndMessage - ScrId:" + sScreenID)
	endif

	if ! Is3270ScreenFocus() then
		return
	EndIf
	sBufferText = cNull
	RefreshScreenImage ()
	GetScreenId ()
	
	if nScreenNotDefined then
		return
	endif
	
	AddTextToBuffer(GetScreenTitle(),cLF)
	AddTextToBuffer(GetScreenMessage(),cLF)
	if IsSameScript () then
		AddTextToBuffer(msgCloseWindow,cLF)
		UserBufferClear ()
		UserBufferAddText (sBufferText)
		UserBufferActivate (False)
		SayAll (0)
	else
		say(sBufferText ,1)
	endIF
EndScript

;***********************************************************
;	Display the list of hot keys used by this application
;	in the virtual viewer
;***********************************************************
Script SayHelpKeys ()
	If UserBufferIsActive () then
		UserBufferDeactivate ()
	EndIf
	UserBufferClear ()
	UserBufferAddText (msgTalk3270Help)
	UserBufferActivate (False)
	SayAll (0)

	if nLogging then
		utilLogWrite("SayHelpKeys - ScrId:" + sScreenID)
	endif
EndScript

;******************************************************************
;	The following scripts are for Columns Handling
;******************************************************************
Script NextColumn ()
	ProcessColumns (cRight)
EndScript

Script PreviousColumn ()
	ProcessColumns (cLeft)
EndScript

Script SayNextLineInColumn ()
	ProcessColumns (cDown)
EndScript

Script SayPreviousLineInColumn ()
	ProcessColumns (cUp)
EndScript

Script MoveToTopOfColumn ()
	if IsSameScript () then
		ProcessColumns (cView)
	else
		ProcessColumns (cHome)
	endif
EndScript

Script MoveToBottomOfColumn ()
	if IsSameScript () then
		ProcessColumns (cView)
	else
		ProcessColumns (cEnd)
	endif
EndScript

;	Provides a list of commonly used Talk3270 function in a menu list
Script ShowMenu ()
	Var
	Int IMenuItem,
	string FuncName
	
	sMenuList = cMenuItem1 + cMenuItem2 + cMenuItem3 + cMenuItem4 + cMenuItem5 +
	cMenuItem6 + cMenuItem7 + cMenuItem8 + cMenuItem9 + cMenuItem10 +
	cMenuItem11 + cMenuItem12 + cMenuItem13 + cMenuItem14 + cMenuItem15 +
	cMenuItem16 + cMenuItem17 + cMenuItem18 + cMenuItem19
	;	if logging is on, add item to menu to turn off
	if nLogging then
		sMenuList = sMenuList + CMenuItem20
	endif
	IMenuItem = DlgSelectItemInList (sMenuList , "Choose item: ", 0, 1)
	
	if iMenuItem == 1 then
		PerformScriptByName( "UtilGetScreenInfo")
	elif iMenuItem == 2 then
		PerformScriptByName ("SayScreenFields")
		PerformScriptByName ("SayScreenFields")
	elif iMenuItem == 3 then
		PerformScriptByName ("SayAutoReadText")
		PerformScriptByName ("SayAutoReadText")
	elif iMenuItem == 4 then
		PerformScriptByName ("SayScreenTitleAndMessage")
		PerformScriptByName ("SayScreenTitleAndMessage")
	elif iMenuItem == 5 then
		PerformScriptByName("SayScreenPageNumber")
		PerformScriptByName("SayScreenPageNumber")
	elif iMenuItem == 6 then
		PerformScriptByName("SayCurrentPosition")
		PerformScriptByName("SayCurrentPosition")
	elif iMenuItem == 7 then
		PerformScriptByName("SayHelpKeys")
	elif iMenuItem == 8 then
		PerformScriptByName("SayTabField")
	elif iMenuItem == 9 then
		PerformScriptByName("CopyField3270")
	elif iMenuItem == 10 then
		PerformScriptByName("CopyLine3270")
	elif iMenuItem == 11 then
		PerformScriptByName("CopySelected3270")
	elif iMenuItem == 12 then
		PerformScriptByName("PasteField3270")
	elif iMenuItem == 13 then
		PerformScriptByName("NextColumn")
	elif iMenuItem == 14 then
		PerformScriptByName("PreviousColumn")
	elif iMenuItem == 15 then
		PerformScriptByName("SayNextLineInColumn")
	elif iMenuItem == 16 then
		PerformScriptByName("SayPreviousLineInColumn")
	elif iMenuItem == 17 then
		PerformScriptByName("MoveToTopOfColumn")
		PerformScriptByName("MoveToTopOfColumn")
	elif iMenuItem == 18 then
		PerformScriptByName("MoveToBottomOfColumn")
		PerformScriptByName("MoveToBottomOfColumn")
	elif iMenuItem == 19 then
		;	VerifyHotKeys not working so changed to rebuild hot keys
		UtilBuildHotkeys ()
		;	if logging is on, add item to menu to turn off
	elif iMenuItem == 20 then
		utilLogToggle(0)
	endif
	
EndScript

;******************************************************************
;	Added option to start and stop Talk3270 logging 
;	to invoke script use Alt+Ctrl+Windows+L
;******************************************************************
Script LoggingSelect ()
	Var int iSelectItem,
		string lSelectList,
		string lMsg
		
	;	default selection item
	if nLogging == 0 then 
		lMsg = cLogStopped
	elif nLogging == 1 then
		lMsg = cLogBasic
	elif nLogging == 2 then
		lMsg = cLogAdvanced
	elif nLogging == 3 then
		lMsg = cLogAdvancedCpy
	endif

	lSelectList = clogItem0 + clogItem1 + clogItem2 + clogItem3 
	iSelectItem = DlgSelectItemInList (lSelectList , lMsg, 0, 0)
	if iSelectItem then 
		iSelectItem-1
		utilLogToggle(iSelectItem-1) 
	endif 
 EndScript

;*********************** End of Scripts *********************
;

; End of Script file talk3270.JSS