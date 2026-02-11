;Message file  for talk3270
;
;	File Name : TALK3270.JSM
;***************************************************************************************
;
; ****************************** Revision log **************************************
; cfd 10/29/05    1.0    Created Initial Version 1.0
; cfd 04/15/09             added column msgs and Admin file 
; cfd 10/10/09             Added messages for Default and terminal Attributes
;                                 Corrected spelling 
; cfd  11-05-25 - added help for copy line and copy selected text 
; cfd  2014-07-27 - Add vars for last modifyed date handling
; cfd  2016-06-18 - added msg for admin ini errors 
; cfd 2017-10-13 - added new hotkeys for menu 
; cfd 2021-07-06 - added msgSI25 for jaws setting display 
;                        msgSI26 for running JAWS serial no
; cfd 2022-02-06 - removed help messages to new talk3270help.jsm
;                        Created help files .jsm one for BNS and one standard 
;                        BNS has additional hotkeys 
; ****************************** Revision log **************************************
CONST
; Global Messages 
msgCloseWindow="Press Escape to close this window.",
msgErrorTotal="A total of ",
msgWinClassErr=" <-- ERROR WinClass Do Not Match",
msgErrorChanges=" Frames will require updating",
msgAuth="  Authorized ",
msgAuthErrHd="  *** Authorization Error ***" ,
msgAuth1="Talk3270 is NOT authorized for the current JAWS Serial Number!",
msgAuth2="The Talk3270 Speech Scripts are licensed to : ",
msgAuth2a=" For JAWS S/N : ",
msgAuth3="This PC is running JAWS S/N: ",
msgAuth4="S/N Authenticated: ",
msgTalk3270="Talk3270 Speech Scripts",
msgKeyUpdatedOk="Talk3270 hot keys updated Successfully!",
msgSI1 = "           License To: ",
msgSI2 = "           License No: ",
msgSI3 = "                Terminal Screen Attributes :",
msgSI4 = "        Application = ",
msgSI5 = "   Real WinClass = ", 
msgSI6 = "     INI WinClass = ", 
msgSI7 = "      screen name = ",
msgSI8 = "        Screen Title = ",
msgSI9 = "     Screen Delay = ", 
msgSI10 = "AutoRead Delay = ", 
msgSI11 = "    Top of Screen = ",
msgSI12 = "        Left Margin = ",
msgSI13 = "        Line Height = ",
msgSI14 = "       Char Width = ",
msgSI15 = "         PC Cursor:",
msgSI16 = "       JAWS Cursor:", 
msgSI17 = "*** Using default Attributes From Talk3270Admin.INI ***",
msgSI18 = "     Using Terminal Attributes",
msgSI20 = " INI files last modified  ",
msgSI21 = "	Screens - ",
msgSI22 = "	Fields - ",
msgSI23 = "	Columns - ",
msgSI24 = "Error Talk3270Admin.in file is missing or has invalid data",
msgSI25 = "JAWS setting Directory = ..",
MSGSI26 = "            Running JAWS Serial # : ",
msgsI27 = "column ",
msgsI28 = " line ",
msgsI29n = " Auto Max Term Windows = No", ; cfd 2025-05-04 v3.7 #2 
msgsI29y = " Auto Max Term Windows = Yes", ; cfd 2025-05-04 v3.7 #2 
msgsI30 = "		   Date ", ; 2025-05-17 added for info box to display date 
msgColFirst = "First Column",
msgColLast = "Last Column",
msgColTop = "Top of Column",
msgColBtm = "Bottom of Column",
msgColPos = "Column",
msgColNone = "No Columns defined for this screen!",
msgDataCopied = "Copied ",
msgNoDataCopied = "No data copied",
msgNoClipboard = "No data on Clipboard",
msgDataPasted = "Pasting ", 
msgPleaseWait="Verifying Talk3270 Hot Keys, Please wait!",
msgKeyUpdated="HotKeys updated Successfully!",
msgHotKeysOK="Hot Keys OK"

Messages 	

@msgKeayAssignError 

 IMPORTANT Notice Please Read

The following Frames had key assignments that are used by the
Talk3270 Script and have been removed, so therefore will no 
longer work. You must use the frame manager to add new 
Hot Keys to these frames.

Press INSERT+9 to activate the frame manager

Frame HotKeys have been re-assigned. Old assignments are listed below.

@@

@msgErrorCopy

This information has also been copied to the clipboard 
so you can paste it into Word or NotePad for a more detailed review
Press Escape to close this window " + cScBufferNewLine.

Press ESCAPE to exit the help window.
@@

@msgAuthErr
The talk3270 speech scripts are not authorized for JAWS Serial Number : 

@@
 @msgAuthTP
						The Talk3270 Scripts will expire and stop working  on  - 
@@


@msgAuthX

            The talk3270 Speech Scripts demo mode has ended!!

@@

@msgAuthErrTS

		>>>> The Talk3270 Scripts are running in Demo mode <<<<

@@

@msgSudata
For Technical help Contact:
       SuData Consulting
       Tel: (416)696-9590
       Mobile: (416)419-1416
       Email: sudata@rogers.com 
@@

EndMessages

