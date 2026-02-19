Void Function AutoStartEvent  ()
	var string sAppDirectory 
	let sAppDirectory = GetJawsSettingsDirectory ()+"\\"
   SwitchToScriptFile (sAppDirectory + "ltrOne", sAppDirectory + "Default")
EndFunction

