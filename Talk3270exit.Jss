;********************************************
;   Generic Exit Routines File              *
;********************************************
;
;Scripts for 3270 terminal emulator 
;
;	File Name : TALK3270exit.jss
;
;****************************************************************************************
;	This exit routine permits specific customization of the TALK3270 JAWS script, thus 
;	allowing the scripts to be tailored to the needs of a particular site. 
;
;************************************ Revision log **************************************
;	2026-1-31	DY: Removed name and address.
;	Updated by	Version		Description of change
;	cfd			4/15/09		Empty exit file 
;
;************************************ Revision log **************************************
;
Void Function exitAutoReadNewText()
var  int lLineNum,
		string lText
	;
EndFunction

Void Function exitVerifyHotKeys ()
	var string sKey,
		string sScriptName
EndFunction  
   
;****************************************************************************
;	Figure out which screen is being displayed then perform 
;	function to read required data 
;****************************************************************************
Void Function exitGetScreenFields ()

EndFunction


