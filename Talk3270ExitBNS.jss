
;************************Exit Routine for BNS ***********************************************
; Exit routines for ScotiaBank screens   *
;	This exit routine permits specific customization of the TALK3270 JAWS script, thus 
; allowing the scripts to be tailored to a particular site's needs. 
;
; *********************************** Revision log for exit routines for BNS ***********************
; updated by    Version     Description of change
; cfd 2006-04-29 Created Initial Version 1.0 from Scotiabank old PCSWS.JSS &
;                 BSN3270 scripts 
; cfd 2009-01-21 Changed ProcessAuthenticationScreens proc to use 
;                 dynamic calc instead of pixled movement 
;                 PI* remove use of const in calcs  
; cfd 2009-05-15 Changed ProcessAuthenticationScreens to use a different approach
;                 for positioning and moving the cursor
; cfd 2013-09-10 Added handling for screen SCO0210K406 (AGG, ABM & POS LIMITS)
; cfd 2013-09-29 rearranged find in bnsProcessAuthenticationScreens script to solve 
;	        			  issue with HDSCATH02D screen not reading. 
;					        - It appears that the max-line ptr was being set to what they should be - switch them around 
; cfd 2014-01-03 Changed in script bnsProcessAuthenticationScreens  check on down arrow to only check 
;								 for the text DownArrow instead of the full 	key name string 
; dyo 2014-06-03 Added handling for screen CTRP041D3 (COUNTRY & PROVINCE)
; cfd 2016-10-29 Added handling for screen HDDSATH02D 
; cfd 2019-01-06 - Mod script bnsProcessAuthenticationScreens HDSCATH02D & HDVSATH02D
;                          changed find for positioning cursor to use "Correct answers required"
; cfd 2024-01-31 - Mod script bnsProcessAuthenticationScreens HDSCATH02D & HDVSATH02D
;                          Change counter for positioning to top and bottom 
;2025-05-16 v3.7.1 added Logging mode to Admin INI and code for writing out talk3270-yymmdd.log
;                  Remove many logging message boxes   
;*********************************** Revision log **************************************
;
Globals Int nAAqPointer
;
;**********************************************************
; Move the cursor on the Authentication Screens 
; And sey the text as we move 
; Keys - Windows+Control+DownArrow or Windows+Alt+DownArrow
;        Windows+Control+UpArrow or indows+Alt+UpArrow
; cfd 2009-01-21 Change Horz cursor moving from using const 
;                 to calc nCharWidth 
; cfd 2013-09-03 Changed up/down keys per BNS issue 
; cfd 2016-10-29 Added handling for screen HDDSATH02D 
; cfd 2019-01-06 - Mod HDSCATH02D & HDVSATH02D
;                          changed find for positioning cursor to use "Correct answers required'
;**********************************************************
Script bnsProcessAuthenticationScreens ()
	var 	handle lhWin,
				int nTopList,
				int nLinePtr,
				int nAAQPtrMax
		if ! Is3270ScreenFocus() then 
			return 
		endif 
		if IsSameScript () then 
			return
		endif 
		let sScreenID = GetScreenID()
	    if  sScreenID == "HDVSATH02D"
		 || sScreenID == "HDSCATH02D" 
		 || sScreenID == "HDDSATH02D" Then 
			let lHwin = GetAppMainWindow (GetFocus ())
		else 
			return 
	  EndIf
		
;	cfd 2025-05-16 logging 	
	if nLogging then 
		utilLogWrite("bnsProcessAuthenticationScreens - ScrnId:" + sScreenID + " KeyPressed:" + GetCurrentScriptKeyName ())
	endif 
		
		RouteInvisibleToPc ()
		InvisibleCursor()
	  ; cfd expanded if/else 
	  ; cfd 2024-01-31 changed nAAQPtrMax from 10 to 9 / change find from SIN to Birth Date
 		if  sScreenID == "HDSCATH02D" then 
			let nAAQPtrMax = 9
			FindString (lHwin, "Correct answers required", S_TOP, S_RESTRICTED) 
		   	FindString (lHwin, "Birth Date", S_Next, S_RESTRICTED) 
		elif sScreenID == "HDVSATH02D" then 
			let nAAQPtrMax = 9
			FindString (lHwin, "Correct answers required", S_TOP, S_RESTRICTED) 
		   	FindString (lHwin, "Birth Date", S_Next, S_RESTRICTED) 
		elif sScreenID == "HDDSATH02D" then 
			let nAAQPtrMax = 9
		   	FindString (lHwin, "Birth Date", S_Next, S_RESTRICTED) 
		endif

		If StringContains (GetCurrentScriptKeyName (),"DownArrow") then 
			let nAAqPointer = nAAqPointer + 1
		else
			let nAAqPointer = nAAqPointer - 1
		endif
		if nAAqPointer == 0 
		  || nAAqPointer > nAAQPtrMax then
			let nAAqPointer = 0
			let nTopList = 1
		elif NAAqPointer > 1 then 
			let nLinePtr = 1
			While nLinePtr < nAAQPointer
				NextLine()
				let nLinePtr = nLinePtr  + 1
			endwhile 			
		endif 
	;	cfd 2025-05-16 logging 	
		if nLogging then 
			utilLogwrite("bnsProcessAuthenticationScreens - AAQ Ptr:" + IntToString(nAAqPointer))
		endif 
		RouteJawsToInvisible()
		JawsCursor()
;		MessageBox("AAQ Ptr - " + IntToString(nAAqPointer))
		LeftMouseButton ()
		{space}  ; needed to uncheck after moving mouse pointer 
		SayLine ()
		RoutePcToJaws() 
		PCCursor ()
		Let nTopList = 0
EndScript

;Pops Up the AGG Selections screen on Screen ID SCO0210K406 
;  -  centralized Maintenance  - Small Business ScotiaCard - Maintenance
Script AggPopup ()
		var	handle lhWin
		if ! Is3270ScreenFocus() then 
			return 
		endif 
		if IsSameScript () then 
			return
		endif 
		let sScreenID = GetScreenID()
	    if sScreenID == "SCO0210K406"
			let lHwin = GetAppMainWindow (GetFocus ())
			InvisibleCursor()
			FindString (lHwin, "AGG", S_TOP, S_RESTRICTED) 
		  	RouteJawsToInvisible()
			SayWord ()
			LeftMouseButton ()
;			LeftMouseButton ()
	    	PCCursor ()
		EndIf
EndScript

;Pops Up the ABM Selections screen on Screen ID SCO0210K406 
;  -  centralized Maintenance  - Small Business ScotiaCard - Maintenance
Script AbmPopup ()
		var	handle lhWin
		if ! Is3270ScreenFocus() then 
			return 
		endif 
		if IsSameScript () then 
			return
		endif 
		let sScreenID = GetScreenID()
	   if sScreenID == "SCO0210K406"
			let lHwin = GetAppMainWindow (GetFocus ())
			InvisibleCursor()
			FindString (lHwin, "ABM ", S_TOP, S_RESTRICTED) 
			FindString (lHwin, "ABM ", S_NEXT, S_RESTRICTED) 
		  	RouteJawsToInvisible()
			SayWord ()
			LeftMouseButton ()
;			LeftMouseButton ()
	    	PCCursor ()
		EndIf
EndScript

;Pops Up the POS Selections screen on Screen ID SCO0210K406 
;  -  centralized Maintenance  - Small Business ScotiaCard - Maintenance
Script POSPopup ()
		var	handle lhWin
		if ! Is3270ScreenFocus() then 
			return 
		endif 
		if IsSameScript () then 
			return
		endif 
		let sScreenID = GetScreenID()
	   if sScreenID == "SCO0210K406"
			let lHwin = GetAppMainWindow (GetFocus ())
			InvisibleCursor()
			FindString (lHwin, "POS ", S_TOP, S_RESTRICTED) 
			FindString (lHwin, "POS ", S_NEXT, S_RESTRICTED) 
		  	RouteJawsToInvisible()
			SayWord ()
			LeftMouseButton ()
;			LeftMouseButton ()
	    	PCCursor ()
		EndIf
EndScript

;Pops Up the COUNTRY CODE Selection screen on Screen ID CTRP041D3 
;  -  Centralized Scotiacard Issuance - Emergency VISA Debit Card Request 
; added 2014-06-03 by dyo
Script CountryCodePopup ()
		var	handle lhWin
		if ! Is3270ScreenFocus() then 
			return 
		endif 
		if IsSameScript () then 
			return
		endif 
		let sScreenID = GetScreenID()
	   if sScreenID == "CTRP041D3"
			let lHwin = GetAppMainWindow (GetFocus ())
			InvisibleCursor()
			FindString (lHwin, "TRY: ", S_TOP, S_RESTRICTED) 
			FindString (lHwin, "TRY: ", S_NEXT, S_RESTRICTED) 
		  	RouteJawsToInvisible()
			SayWord ()
			LeftMouseButton ()
;			LeftMouseButton ()
	    	PCCursor ()
		EndIf
EndScript

;Pops Up the PROV/STATES Selection screen on Screen ID CTRP041D3 
;  -  Centralized Scotiacard Issuance - Emergency VISA Debit Card Request 
; added 2014-06-03 by dyo
Script ProvPopup ()
		var	handle lhWin
		if ! Is3270ScreenFocus() then 
			return 
		endif 
		if IsSameScript () then 
			return
		endif 
		let sScreenID = GetScreenID()
	   if sScreenID == "CTRP041D3"
			let lHwin = GetAppMainWindow (GetFocus ())
			InvisibleCursor()
			FindString (lHwin, "PROV: ", S_TOP, S_RESTRICTED) 
			FindString (lHwin, "PROV: ", S_NEXT, S_RESTRICTED) 
		  	RouteJawsToInvisible()
			SayWord ()
			LeftMouseButton ()
;			LeftMouseButton ()
	    	PCCursor ()
		EndIf
EndScript

Void Function exitAutoReadNewText()
var int lLineNum,
	string lText
	; reset the AAQ pointyer if not AAQ screen
  if  sScreenID == "HDVSATH02D"
   || sScreenID == "HDSCATH02D" 
   || sScreenID == "HDDSATH02D" Then 
	else
			let  naaqPointer = 0 
	endif
EndFunction

Void Function exitVerifyHotKeys ()
	var string sKey,
		string sScriptName
	;check to see if  Authentication Screens keys exist
; saystring("inside BNS hot key")
	let sScriptName = "BNSProcessAuthenticationScreens "
	let sKey = "Windows+Control+DownArrow"
	utilAddHotKey (sKey, sScriptName)
	let sKey = "Windows+Control+UpArrow"
	utilAddHotKey (sKey, sScriptName)
	let sKey = "Windows+Alt+DownArrow"
	utilAddHotKey (sKey, sScriptName)
	let sKey = "Windows+Alt+UpArrow"
	utilAddHotKey (sKey, sScriptName)
; Check keys for screen SCO0210K406 
	let sScriptName = "AggPopup "
	let sKey = "Windows+Control+j"
	utilAddHotKey (sKey, sScriptName)
	let sScriptName = "AbmPopup "
	let sKey = "Windows+Control+k"
	utilAddHotKey (sKey, sScriptName)
	let sScriptName = "POSPopup "
	let sKey = "Windows+Control+l"
	utilAddHotKey (sKey, sScriptName)
	let sScriptName = "CountryCodePopup "
	let sKey = "Windows+Control+p"
	utilAddHotKey (sKey, sScriptName)
	let sScriptName = "ProvPopup "
	let sKey = "Windows+Control+o"
	utilAddHotKey (sKey, sScriptName)
EndFunction  
   
;****************************************************************************
; Figure out which screen is being displayed then perform 
; function to read required data 
;****************************************************************************
Void Function exitGetScreenFields ()
	if sScreenID == "TCSPLAS" then 	
		BNSvsSayPlastics()
	endif 	
EndFunction


; Screen ID - TCSPLAS
;
Void Function BNSvsSayPlastics()
	var string lText,
		int lLineNum,
		int lMoreData
;	MessageBox("Visa Say Plastics") ;debug
    ;
    ; Loop through the 11 lines of repeating text 
    ; if the Plastic number is not blank then say the line 
    ;
	let lLineNum = 7 ; starting line on screen 
	While (lLineNum < 20)
		; get type 
		let lText = GetTextFromScreen(lLineNum,8,1)
		if lText == "P" then 
			AddTextToBuffer("Primary",cLF)
		elif lText == "S" then 
			AddTextToBuffer("Secondary",cLF)
		elif lText == "A" then 
			AddTextToBuffer("Additional",cLF)
		else 
			AddTextToBuffer("unknown",cLF)
		endif 
        ;
		;  Plastic #	
		let lText = GetTextFromScreen(lLineNum,4,3)
		AddTextToBuffer(lText,cNoLF)
        ;
        ;  Name	
		let lText = GetTextFromScreen(lLineNum,10,26)
		AddTextToBuffer(lText,cNoLF)
        ;
		;  Last Issue 	
		AddTextToBuffer("Last Issue",cNoLF)
		let lText = GetTextFromScreen(lLineNum,36,8)
		AddTextToBuffer(lText,cNoLF)
        ;
		;  Status 	
		AddTextToBuffer("Status",cNoLF)
		let lText = GetTextFromScreen(lLineNum,49,1)
		AddTextToBuffer(lText,cLF)
        ;
		;  Current Stat Date	
		AddTextToBuffer("Current Stat Date ",cNoLF)
		let lText = GetTextFromScreen(lLineNum,51,8)
		AddTextToBuffer(lText,cLF)
        ;
		let lLineNum = lLineNum + 1
		if lLineNum <= 19 then 
			; does the next line have a plastic # ?
 			let lText = GetTextFromScreen(lLineNum,4,3)
			if StringIsBlank (lText) then 
				; no more lines to display so exit 
				let lLineNum = 99
			endif 
		endif 
	endwhile
EndFunction
