;	File Name : ltrOneHelpbns.jsm
;***************************************************************************************
; cfd 2022-02-06 - Created help files .jsm one for BNS and one standard 
;                        BNS has additional hotkeys 
;***************************************************************************************
Messages
@msgltrOneHelp
                ltrOne Hot Keys
 
If any of the Following reading keys are pressed twice quickly the information 
        will be placed in the virtual viewer for ease of reading. 

                  Genral Reading Hot Keys
Control+slash says predefined data from the current screen.
Windows+Control+/ Re-say automatically spoken text
Windows+Control+I Says current Screen name and any messages.
Windows+Control+N Says page or Screen Number, example Screen 1 of 3.
Windows+Shift + A through X,  move the active cursor to a given line on 
        the screen. A = 1, B = 2 ... X = 24.
Control+Delete Says the active cursor position Row and Column. 
Windows+TAB Says current Field data and Label.

                 Navigation Hot Keys 
Tab Move to next Field and Speak it.
Shift+TAB move to prior fields and Speak it. 
Control+RightArrow Move to next word and Speak it.
Control+LeftArrow Move to Prior word and Speak it.
Windows+Control+UpArrrow moves up 1 line on the Process Authentication Screens 
Windows+Control+DownArrow moves down 1 line on the Process Authentication Screens 
Windows+control+Comma Activates AGG popup selections 
Windows+control+Comma Activates ABM popup selections 
Windows+control+Comma Activates POS popup selections 

                Copy and Paste
Windows-C Copies field data at current cursor location on the 3270 screen.
Windows-Alt-C Copies the line from the 3270 screen where the active cursor is located 
Windows-Control-C Copies pre-selected text at from the 3270 screen .
Windows-V Paste text back to the 3270 screen 

                Column processing hot keys 
Alt+Control+RightArrow Move to next column
Alt+Control+LeftArrow Move to Previous column
Alt+Control+DownArrow Say next line in current column
Alt+Control+UpArrow Say previous line in current column
Alt+Control+Home Move to First line in current column. If pressed twice
	    the entire Column is placed in the virtual viewer. 
Alt+Control+End Move to last line in current column. If pressed twice 
	    the entire Column is placed in the virtual viewer. 

						ltrOne specific Keys 
Alt+Control+K Rebuilds the ltrOne Hotkeys 
Windows+ALT+S Display ltrOne Information. 
` (Grave Accent Key) Show Menu of ltrOne  hotkeys 
@@ 
EndMessages
