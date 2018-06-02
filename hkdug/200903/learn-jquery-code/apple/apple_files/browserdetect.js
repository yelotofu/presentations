/**
 * Same logic as before. Have removed some detection capabilities in an effort
 * to reduce reliance on browser detection in general.
 * 
 * If there is a particualr detection you feel you need please file a ticket
 * with the request or add the detection yourself with the exact reason you
 * need said detection. Hopefully we'll be able to keep the number of
 * detection utility functions to a minimum in favor of behavioral testing.
 * 
 * This may also be the place for very common behavioral functions.
 * 
 */

if (typeof(AC) == "undefined") { AC = {}; }

AC.Detector = {

	getAgent: function() {
		return navigator.userAgent.toLowerCase();
	},
	
	// detect platform
	isMac: function(userAgent) {
		var agent = userAgent || this.getAgent();
		return agent.match(/mac/i);
	},
	
	isWin: function(userAgent) {
		var agent = userAgent || this.getAgent();
		return agent.match(/win/i);
	},
	
	isWin2k: function(userAgent) {
		var agent = userAgent || this.getAgent();
		return this.isWin(agent) && (agent.match(/nt\s*5/i));
	},
	
	isWinVista: function(userAgent) {
		var agent = userAgent || this.getAgent();
		return this.isWin(agent) && (agent.match(/nt\s*6/i));
	},
	
	// detect browser
	isWebKit: function(userAgent) {
		var agent = userAgent || this.getAgent();
		return agent.match(/AppleWebKit/i);
	},
	
	isOpera: function(userAgent) {
		var agent = userAgent || this.getAgent();
		return agent.match(/opera/i);
	},
	
	isIE: function(userAgent) {
		var agent = userAgent || this.getAgent();
		return agent.match(/msie/i);
	},
	
	isIEStrict: function(userAgent) {
		var agent = userAgent || this.getAgent();
		return agent.match(/msie/i) && !this.isOpera(agent);
	},
	
	isFirefox: function(userAgent) {
		var agent = userAgent || this.getAgent();
		return agent.match(/firefox/i);
	},

	isiPhone: function(userAgent) {
		var agent = userAgent || this.getAgent();
		return agent.match(/iPhone/i);
	},
	
	// itunes compabibility
	isiTunesOK: function(userAgent) {
		var agent = userAgent || this.getAgent();
		return this.isMac(agent) || this.isWin2k(agent);
	},
	
	isQTInstalled: function() {
		
		var qtInstalled = false;
		
		if(navigator.plugins && navigator.plugins.length) {
			
			for(var i=0; i < navigator.plugins.length; i++ ) {
				
				var plugin = navigator.plugins[i];
				
				if(plugin.name.indexOf("QuickTime") > -1) { 
					qtInstalled = true; 
				}
			}
		} else {
			qtObj = false; //global variable written to by vbscript for ie
			execScript('on error resume next: qtObj = IsObject(CreateObject("QuickTimeCheckObject.QuickTimeCheck.1"))','VBScript');
			qtInstalled = qtObj;
		}
		
		return qtInstalled;
	},
	
	getQTVersion: function() {
		
		var version = "0";
		
		if (navigator.plugins && navigator.plugins.length) {
			for (var i = 0; i < navigator.plugins.length; i++) {
				
				var plugin = navigator.plugins[i];
				
				//Match: QuickTime Plugin X.Y.Z
				var match = plugin.name.match(/quicktime\D*([\.\d]*)/i);
				if (match && match[1]) {
					version = match[1];
				}
			}
		} else {
			ieQTVersion = null; //global for vbscript to write to
			
			execScript('on error resume next: ieQTVersion = (Hex(CreateObject("QuickTimeCheckObject.QuickTimeCheck.1").QuickTimeVersion)/1000000)','VBScript');

			if (ieQTVersion) {
				//only grab the major version:  7.xyz => 7
				version = (ieQTVersion +"").split(/\./)[0];
			}
		}
		
		return version;
	},
	
	isQTCompatible: function(required, actual) {
		
		function areCompatible(required, actual) {
			
			var requiredValue = parseInt(required[0])
			if (isNaN(requiredValue)) {
				requiredValue = 0;
			}
			
			var actualValue = parseInt(actual[0])
			if (isNaN(actualValue)) {
				actualValue = 0;
			}
			
			if (requiredValue == actualValue) {
				if (required.length > 1) {
					return areCompatible(required.slice(1), actual.slice(1));
				} else {
					return true;
				}
			} else if (requiredValue < actualValue) {
				return true;
			} else {
				return false;
			}
		}

		var expectedVersion = required.split(/\./);
		var actualVersion = actual ? actual.split(/\./) : this.getQTVersion().split(/\./);
		
		return areCompatible(expectedVersion, actualVersion);
		
	},
	
	isValidQTAvailable: function(required) {
		return this.isQTInstalled() && this.isQTCompatible(required)
	}
	
};
