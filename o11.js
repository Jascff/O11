async function setPlayer(e) {
	e.preventDefault();

	n = this.id.replace(/\D/g, "")
	
	if (document.getElementById('recstreamname' + n) != null) {
		src = document.getElementById('recstreamname' + n).href
	} else if (document.getElementById('name' + n).href.endsWith(".mp4")) {
		src = document.getElementById('name' + n).href
	} else {
		let master = "master";
		if (document.getElementById('forcedFormat').value == "fmp4") {
			master = "fmp4";
		} else if (document.getElementById('forcedFormat').value == "ts") {
			master = "master";
		} else if (document.getElementById('forcedFormat').value == "multi") {
			master = "multi";
		} else
		/*if ((player.canPlayType('application/vnd.apple.mpegurl') || Hls.isSupported())
			&& ((document.getElementById('fmphls' + n).value == "true" || document.getElementById('fmphls' + n).checked) && document.getElementById('fmp4hls').value == "true")) {
			master = "fmp4";
		} else */if ((document.getElementById('multitshls' + n).value == "true" || document.getElementById('multitshls' + n).checked) && document.getElementById('multitshls').value == "true") {
			master = "multi";
		}

		src = document.getElementsByTagName('base')[0].href + 'stream/' + document.getElementById('id' + n).value + '/' + master + '.m3u8';
	}

	document.getElementById('playerAudioSelect').style.display = 'none';
	document.getElementById('playerSubtitlesSelect').style.display = 'none';

	if (player.canPlayType('application/vnd.apple.mpegurl') || src.endsWith(".mp4")) {
		player.src = src;
		player.play()
	} else if (Hls.isSupported()) {
		if (hls) {
			hls.destroy()
		}

		hlsjsConfig = {"maxBufferSize": 0, "maxBufferLength": 30, "liveSyncDuration": 30, "liveMaxLatencyDuration": Infinity, "debug": true};
		hls = new Hls(hlsjsConfig);
		video = document.getElementById('player');
		hls.loadSource(src);
		hls.attachMedia(video);
		hls.on(Hls.Events.MANIFEST_PARSED,function() {
			video.play();
		});
		hls.on(Hls.Events.AUDIO_TRACKS_UPDATED,function() {
			if ($("#playerAudioSelect")) {
				$("#playerAudioSelect").empty();
			}
			for (i=0; i<hls.audioTracks.length; i++) {
				opt = document.createElement("option");
				opt.value = i;
				opt.text = hls.audioTracks[i].name
				document.getElementById('playerAudioSelect').add(opt, null)
			}
			if (hls.audioTracks.length > 1 && document.getElementById('playerAudioSelect')) {
				document.getElementById('playerAudioSelect').style.display = 'block';
			}
		});
		hls.on(Hls.Events.SUBTITLE_TRACKS_UPDATED,function() {
			if ($("#playerSubtitlesSelect")) {
				$("#playerSubtitlesSelect").empty();
			}
			for (i=0; i<hls.subtitleTracks.length; i++) {
				opt = document.createElement("option");
				opt.value = i;
				opt.text = hls.subtitleTracks[i].name
				document.getElementById('playerSubtitlesSelect').add(opt, null)
			}
			opt = document.createElement("option");
			opt.value = -1;
			opt.text = "none"
			document.getElementById('playerSubtitlesSelect').add(opt, null)
			if (hls.subtitleTracks.length > 0 && document.getElementById('playerSubtitlesSelect')) {
				document.getElementById('playerSubtitlesSelect').style.display = 'block';
			}
			hls.subtitleTrack  = document.getElementById('playerSubtitlesSelect').selectedIndex
		});
	}
}

async function playerAudioSelectOnchange(e) {
	hls.audioTrack  = document.getElementById('playerAudioSelect').selectedIndex
}

async function playerSubtitlesSelectOnchange(e) {
	hls.subtitleTrack  = document.getElementById('playerSubtitlesSelect').selectedIndex
}

async function updateStream(e) {
	e.preventDefault();
	n = this.id.replace(/\D/g, "")
	name = document.getElementById('name' + n).innerText
	id = document.getElementById('id' + n).value

	vStreamId = $('#vStreamId' + n).val()
	aStreamId = ""
	$('#aStreamId' + n).val().forEach(function(id) {
		if (id == "all") {
			aStreamId = "all"
		}
		if (aStreamId != "all") {
			if (aStreamId.length != 0 ) {
				aStreamId += ","
			}
			aStreamId += id
		}
	});
	sStreamId = ""
	$('#sStreamId' + n).val().forEach(function(id) {
		if (id == "all") {
			sStreamId = "all"
		}
		if (sStreamId != "all") {
			if (sStreamId.length != 0 ) {
				sStreamId += ","
			}
			sStreamId += id
		}
	});

	prevParams = streamsPrevParams.get(id);
	if (!prevParams) {
		document.getElementById('actionStatus').innerText = 'internal error';
		document.getElementById('actionStatus').style.color = 'red';
	}

	prevKeys = ""
	if (prevParams.Keys) {
		for (let i = 0; i <  prevParams.Keys.length; i++) {
			prevKeys += prevParams.Keys[i]
			if ( i < prevParams.Keys.length-1) {
				prevKeys += "\n"
			}
		}
	}

	startTime = document.getElementById('rangeStartTime' + n).value
	endTime = document.getElementById('rangeEndTime' + n).value
	if (startTime == '') {
		startTime = "00:00"
	}
	if (endTime == '') {
		endTime = "00:00"
	}

	try {
		start = new Date(document.getElementById('rangeStartDate' + n).value + 'T' + startTime + ":00").toISOString()
	} catch (error) {
		start = ""
	}
	try {
		end = new Date(document.getElementById('rangeEndDate' + n).value + 'T' + endTime + ":00").toISOString()
	} catch (error) {
		end = ""
	}

	data = {
		Action : 'updatestream',
		Streams : [
			{
				Name : name,
				Id : id,
				ManifestUrl : document.getElementById('manifestUrl' + n).value,
				ManifestScript : document.getElementById('manifestScript' + n).value,
				Mode : document.getElementById('mode' + n).options[document.getElementById('mode' + n).selectedIndex].value,
				VStreamId: vStreamId,
				AStreamId: aStreamId,
				SStreamId: sStreamId,
				CdmType: document.getElementById('cdmtype' + n).options[document.getElementById('cdmtype' + n).selectedIndex].value,
				Cdm: document.getElementById('cdm' + n).value,
				Keys: document.getElementById('keys' + n).value,
				OnDemand: document.getElementById('ondemand' + n)?document.getElementById('ondemand' + n).checked: false,
				Autostart: document.getElementById('autostart' + n).checked,
				Autoreplay: document.getElementById('autoreplay' + n).checked,
				KeepFiles: document.getElementById('keepfiles' + n).checked,
				TsHls: document.getElementById('tshls' + n).checked,
				MultiTsHls: document.getElementById('multitshls' + n).checked,
				Fmp4Hls: document.getElementById('fmphls' + n).checked,
				SessionManifest: document.getElementById('sessionmanifest' + n).checked,
				SpeedUp: document.getElementById('speedup' + n)?document.getElementById('speedup' + n).checked:false,
				UseCdm: document.getElementById('usecdm' + n).checked,
				NetworkOverride: document.getElementById('network' + n).checked,
				IgnoreUpdate: document.getElementById('ignoreupdate' + n)?document.getElementById('ignoreupdate' + n).checked:false,
				FixIvSize: document.getElementById('fixivsize' + n)?document.getElementById('fixivsize' + n).checked:false,
				TimeRange: document.getElementById('timerange' + n)?document.getElementById('timerange' + n).checked:false,
				Bind: document.getElementById('bind' + n).value,
				Proxy: document.getElementById('proxy' + n).value,
				Doh: document.getElementById('doh' + n).value,
				MediaNetwork: document.getElementById('medianetwork' + n).checked,
				XForwardedFor: document.getElementById('xforwardedfor' + n).value,
				RangeStartTime: start,
				RangeEndTime: end
			}
		],

		PrevStreams : [
			{
				Name : name,
				Name : id,
				ManifestUrl: prevParams.Manifest,
				ManifestScript: prevParams.ManifestScript,
				Mode: prevParams.Mode,
				VStreamId: prevParams.Video,
				AStreamId: prevParams.Audio,
				SStreamId: prevParams.Subtitles,
				CdmType: prevParams.CdmType,
				Cdm: prevParams.Cdm,
				Keys: prevKeys,
				OnDemand : prevParams.OnDemand,
				Autostart: prevParams.Autostart,
				Autoreplay: prevParams.Autoreplay,
				KeepFiles: prevParams.KeepFiles,
				TsHls: prevParams.TsHls,
				MultiTsHls: prevParams.MultiTsHls,
				Fmp4Hls: prevParams.Fmp4Hls,
				SessionManifest: prevParams.SessionManifest,
				SpeedUp: prevParams.SpeedUp,
				UseCdm: prevParams.UseCdm,
				NetworkOverride: prevParams.NetworkOverride,
				IgnoreUpdate: prevParams.IgnoreUpdate,
				FixIvSize: prevParams.FixIvSize,
				TimeRange: prevParams.TimeRange,
				Bind: prevParams.Bind,
				Proxy: prevParams.Proxy,
				Doh: prevParams.Doh,
				MediaNetwork: prevParams.MediaNetwork,
				XForwardedFor: prevParams.XForwardedFor,
				RangeStartTime: prevParams.RangeStartTime,
				RangeEndTime: prevParams.RangeEndTime
			}
		]	
	}

	let response = await fetch(document.getElementsByTagName('base')[0].href+'api/action', {
		method: 'POST', // or 'PUT'
		headers: {
			'Content-Type': 'application/json',
		},
		body: JSON.stringify(data),
	})

	if (!response.ok) {
		document.getElementById('actionStatus').innerText = response.statusText;
		document.getElementById('actionStatus').style.color = 'red';
		return
	} else {
		document.getElementById('actionStatus').innerText == "";
		// Update prevparams
		prevParams.Manifest = data.Streams[0].ManifestUrl
		prevParams.ManifestScript = data.Streams[0].ManifestScript
		prevParams.Mode = data.Streams[0].Mode
		prevParams.Video = data.Streams[0].VStreamId
		prevParams.Audio = data.Streams[0].Audio
		prevParams.Subtitles = data.Streams[0].Subtitles
		prevParams.CdmType = data.Streams[0].CdmType
		prevParams.Cdm = data.Streams[0].Cdm
		prevParams.Keys = []
		if  (data.Streams[0].Keys) {
			data.Streams[0].Keys.split(",").forEach(function(id) {
				prevParams.Keys.push(id)
			});
		}
		prevParams.OnDemand = data.Streams[0].OnDemand 
		prevParams.Autostart = data.Streams[0].Autostart 
		prevParams.Autoreplay = data.Streams[0].Autoreplay 
		prevParams.KeepFiles = data.Streams[0].KeepFiles 
		prevParams.TsHls = data.Streams[0].TsHls 
		prevParams.MultiTsHls = data.Streams[0].MultiTsHls 
		prevParams.Fmp4TsHls = data.Streams[0].Fmp4Hls 
		prevParams.SessionManifest = data.Streams[0].SessionManifest 
		prevParams.SpeedUp = data.Streams[0].SpeedUp 
		prevParams.UseCdm = data.Streams[0].UseCdm 
		prevParams.NetworkOverride = data.Streams[0].NetworkOverride 
		prevParams.IgnoreUpdate = data.Streams[0].IgnoreUpdate 
		prevParams.FixIvSize = data.Streams[0].FixIvSize 
		prevParams.Bind = data.Streams[0].Bind
		prevParams.Proxy = data.Streams[0].Proxy
		prevParams.Doh = data.Streams[0].Doh
		prevParams.MediaNetwork = data.Streams[0].MediaNetwork
		prevParams.XForwardedFor = data.Streams[0].XForwardedFor
		prevParams.ManifestScriptParam = data.Streams[0].ManifestScriptParam
		prevParams.CdmParam = data.Streams[0].CdmParam

		streamsPrevParams.set(id, prevParams)
	}

	document.getElementById('save').removeAttribute("disabled");
};

async function updateUser(e) {
	e.preventDefault();
	n = this.id.replace(/\D/g, "")

	data = {
		Action : 'updateuser',
		Users : [
			{
				Username : document.getElementById('username' + n).innerText,
				Password : $('#password' + n).val(),
				Network : $('#network' + n).val(),
				IsAdmin: document.getElementById('isadmin' + n).checked,
			},
		]
	}

	let response = await fetch(document.getElementsByTagName('base')[0].href+'api/action', {
		method: 'POST', // or 'PUT'
		headers: {
			'Content-Type': 'application/json',
		},
		body: JSON.stringify(data),
	})

	if (!response.ok) {
		text = await response.text();
		document.getElementById('actionStatus').innerText = "[" + response.statusText + "] " + text ;
		document.getElementById('actionStatus').style.color = 'red';
		return
	} else {
		document.getElementById('actionStatus').innerText == "";
	}

	document.getElementById('save').removeAttribute("disabled");
};


async function updateGlobal(e) {
	e.preventDefault();

	data = {
		Action : 'updateglobal',
		Proxy: document.getElementById('proxy').value,
		Bind: document.getElementById('bind').value,
		Doh: document.getElementById('doh').value,
		MediaNetwork: document.getElementById('medianetwork').checked,
		XForwardedFor: document.getElementById('xforwardedfor').value,
		ManifestScriptParam: document.getElementById('manifestscriptparam').value,
		CdmParam: document.getElementById('cdmparam').value,
		EventsAutorefresh: document.getElementById('eventsautorefresh')?document.getElementById('eventsautorefresh').checked:false,
		EventsAutoremove: document.getElementById('eventsautoremove')?document.getElementById('eventsautoremove').checked:false,
		EventsScript: document.getElementById('eventsscript')?document.getElementById('eventsscript').value:"",
		ChannelsScript: document.getElementById('channelsscript')?document.getElementById('channelsscript').value:"",
		ChannelsAutoremove: document.getElementById('channelsautoremove')?document.getElementById('channelsautoremove').checked:false
	}

	let response = await fetch(document.getElementsByTagName('base')[0].href+'api/action', {
		method: 'POST', // or 'PUT'
		headers: {
			'Content-Type': 'application/json',
		},
		body: JSON.stringify(data),
	});

	if (!response.ok) {
		text = await response.text();
		document.getElementById('actionStatus').innerText = "[" + response.statusText + "] " + text ;
		document.getElementById('actionStatus').style.color = 'red';
		return
	} else {
		document.getElementById('actionStatus').style.innerText = "";
	}

	document.getElementById('save').removeAttribute("disabled");
};

// START/STOP stream
async function startStopSubmit(e) {
	e.preventDefault();
	if (this.id == 'startStopAllForm') {
		id = 'all'
		action = document.activeElement['name']
	} else {
		n = this.id.replace("startStopForm", "")
		id = document.getElementById('id' + n).value
		name = document.getElementById('name' + n).innerText
		action = document.getElementById('startStop' + n).name
	}

	data = {
		Action : action,
		Streams : [
			{
				Id : id,
				Name : name,
			}
		]	
	}

	let response = await fetch(document.getElementsByTagName('base')[0].href+'api/action', {
		method: 'POST', // or 'PUT'
		headers: {
			'Content-Type': 'application/json',
		},
		body: JSON.stringify(data),
	})

	if (!response.ok) {
		text = await response.text();
		document.getElementById('actionStatus').innerText = "[" + response.statusText + "] " + text ;
		document.getElementById('actionStatus').style.color = 'red';
	} else {
		document.getElementById('actionStatus').style.innerText = "";
	}
};

// Shutdown onCLick
async function shutdownFormSubmit(e) {
	e.preventDefault();

	var result = confirm("Are you sure you want to shutdown o11?");
        if (result != true) {
                return
        }

	data = {
		Action : "shutdown",
	};

	let response = await fetch(document.getElementsByTagName('base')[0].href+'api/action', {
		method: 'POST', // or 'PUT'
		headers: {
			'Content-Type': 'application/json',
		},
		body: JSON.stringify(data),
	});

	if (!response.ok) {
		text = await response.text();
		document.getElementById('actionStatus').innerText = "[" + response.statusText + "] " + text ;
		document.getElementById('actionStatus').style.color = 'red';
	} else {
		document.getElementById('actionStatus').style.innerText = "";
	}
};

// SAVE onCLick
async function saveFormSubmit(e) {
	e.preventDefault();

	data = {
		Action : "save",
	};

	let response = await fetch(document.getElementsByTagName('base')[0].href+'api/action', {
		method: 'POST', // or 'PUT'
		headers: {
			'Content-Type': 'application/json',
		},
		body: JSON.stringify(data),
	});

	if (!response.ok) {
		text = await response.text();
		document.getElementById('actionStatus').innerText = "[" + response.statusText + "] " + text ;
		document.getElementById('actionStatus').style.color = 'red';
	} else {
	  document.getElementById('save').setAttribute("disabled","disabled");
		document.getElementById('actionStatus').style.innerText = "";
	}
};


// ADD onCLick
async function addFormSubmit(e) {
	e.preventDefault();
	data = {
		Action : "add",
		Streams: [
			{
				Name : document.getElementById('addText').value,
			},
		]
	}

	let response = await fetch(document.getElementsByTagName('base')[0].href+'api/action', {
		method: 'POST', // or 'PUT'
		headers: {
			'Content-Type': 'application/json',
		},
		body: JSON.stringify(data),
	})

	if (!response.ok) {
		text = await response.text();
		document.getElementById('actionStatus').innerText = "[" + response.statusText + "] " + text ;
		document.getElementById('actionStatus').style.color = 'red';
	} else {
		location.reload();
	}
};

async function refreshConfigWithProvider(e) {
	e.preventDefault();
	window.location.href = "/config/" + document.getElementById('providerSelection').options[document.getElementById('providerSelection').selectedIndex].value
}

async function refreshStatusWithProvider(e) {
	e.preventDefault();
	window.location.href = "/mon/" + document.getElementById('providerSelection').options[document.getElementById('providerSelection').selectedIndex].value
}

async function eventsRefreshFormSubmit(e) {
	e.preventDefault();
	data = {
		Action : "eventsrefreshrequest",
	}

	let response = await fetch(document.getElementsByTagName('base')[0].href+'api/action', {
		method: 'POST', // or 'PUT'
		headers: {
			'Content-Type': 'application/json',
		},
		body: JSON.stringify(data),
	})

	let apply = false;

	text = await response.text();
	if (!response.ok)  {
		document.getElementById('actionStatus').innerText = "[" + response.statusText + "] " + text ;
		document.getElementById('actionStatus').style.color = 'red';
		return
	} else {
		if (text == "No change in events") {
			alert(text)
		} else {
			apply  = confirm(text)
		}
	}

	if (apply) {
		data = {
			Action : "eventsrefreshapply",
		}

		let response = await fetch(document.getElementsByTagName('base')[0].href+'api/action', {
			method: 'POST', // or 'PUT'
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify(data),
		})

		if (!response.ok) {
			text = await response.text();
			document.getElementById('actionStatus').innerText = "[" + response.statusText + "] " + text ;
			document.getElementById('actionStatus').style.color = 'red';
		} else {
			location.reload();
		}
	}

};

async function channelsUpdateFormSubmit(e) {
	e.preventDefault();
	data = {
		Action : "channelsupdaterequest",
	}

	let response = await fetch(document.getElementsByTagName('base')[0].href+'api/action', {
		method: 'POST', // or 'PUT'
		headers: {
			'Content-Type': 'application/json',
		},
		body: JSON.stringify(data),
	})

	let apply = false;

	text = await response.text();
	if (!response.ok) {
		document.getElementById('actionStatus').innerText = "[" + response.statusText + "] " + text ;
		document.getElementById('actionStatus').style.color = 'red';
	} else {
		if (text == "No change in channels") {
			alert(text)
		} else {
			apply  = confirm(text)
		}
	}

	if (apply) {
		data = {
			Action : "channelsupdateapply",
		}

		let response = await fetch(document.getElementsByTagName('base')[0].href+'api/action', {
			method: 'POST', // or 'PUT'
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify(data),
		})

		if (!response.ok) {
			text = await response.text();
			document.getElementById('actionStatus').innerText = "[" + response.statusText + "] " + text ;
			document.getElementById('actionStatus').style.color = 'red';
		} else {
			location.reload();
		}
	}

};


// ADD onCLick
async function addUserFormSubmit(e) {
	e.preventDefault();
	data = {
		Action : "adduser",
		Users : [
			{
				Username : document.getElementById('addUserText').value,
			},
		]
	}

	let response = await fetch(document.getElementsByTagName('base')[0].href+'api/action', {
		method: 'POST', // or 'PUT'
		headers: {
			'Content-Type': 'application/json',
		},
		body: JSON.stringify(data),
	})

	if (!response.ok) {
		text = await response.text();
		document.getElementById('actionStatus').innerText = "[" + response.statusText + "] " + text ;
		document.getElementById('actionStatus').style.color = 'red';
	} else {
		location.reload();
	}
};


// DELETE onCLick
async function deleteSubmit(e) {
	e.preventDefault();

	var rowArray = table.rows({ page: 'current' }).data().toArray();
	if (rowArray == null) {
		return
	}

	var idsList = ""
	var namesList = ""
	rowArray.forEach( function (row) {
		if (document.getElementById('checked' + /id="name(.*?)"/.exec(row[1])[1]).checked) {
			idsList += /value="(.*?)"/.exec(row[1])[1] + ","
			namesList +=  document.getElementById('name' + /id="name(.*?)"/.exec(row[1])[1]).innerText + "\n"
		}
	});

	namesList = namesList.slice(0, -1)

	idsList = idsList.slice(0, -1)
	if (idsList == "") {
		return;
	}

	var result = confirm("Are you sure you want to delete:\n\n" +  namesList);
        if (result != true) {
                return
        }

	data = {
		Action : "delete",
		Streams: [
			{
				Id : idsList
			},
		]
	}

	let response = await fetch(document.getElementsByTagName('base')[0].href+'api/action', {
		method: 'POST', // or 'PUT'
		headers: {
			'Content-Type': 'application/json',
		},
		body: JSON.stringify(data),
	})

	if (!response.ok) {
		text = await response.text();
		document.getElementById('actionStatus').innerText = "[" + response.statusText + "] " + text ;
		document.getElementById('actionStatus').style.color = 'red';
	} else {
		location.reload();
	}
};

// EXPORT onCLick
async function exportSubmit(e) {
	e.preventDefault();

	var rowArray = table.rows({ page: 'current' }).data().toArray();
	if (rowArray == null) {
		return
	}

	var idsList = ""
	rowArray.forEach( function (row) {
		if (document.getElementById('checked' + /id="name(.*?)"/.exec(row[1])[1]).checked) {
			idsList += /value="(.*?)"/.exec(row[1])[1] + ","
		}
	});

	idsList = idsList.slice(0, -1)
	if (idsList == "") {
		return;
	}

	data = {
		Action : "export",
		Streams: [
			{
				Id : idsList
			},
		]
	}

	let response = await fetch(document.getElementsByTagName('base')[0].href+'api/action', {
		method: 'POST', // or 'PUT'
		headers: {
			'Content-Type': 'application/json',
		},
		body: JSON.stringify(data),
	})

	text = await response.text();
	if (!response.ok) {
		document.getElementById('actionStatus').innerText = "[" + response.statusText + "] " + text ;
		document.getElementById('actionStatus').style.color = 'red';
	} else {
		var newWin = open('','Config','height=600,width=600,scrollbars=1');
		newWin.document.write("<pre>" +  text + "</pre>");
	}
};


// DELETE onCLick
async function deleteUserSubmit(e) {
	e.preventDefault();
	n = this.id.replace("deleteUserForm", "")
	data = {
		Action : "deleteuser",
		Users : [
			{
				Username : document.getElementById('username' + n).innerText,
			},
		]
	}

	let response = await fetch(document.getElementsByTagName('base')[0].href+'api/action', {
		method: 'POST', // or 'PUT'
		headers: {
			'Content-Type': 'application/json',
		},
		body: JSON.stringify(data),
	})

	if (!response.ok) {
		text = await response.text();
		document.getElementById('actionStatus').innerText = "[" + response.statusText + "] " + text ;
		document.getElementById('actionStatus').style.color = 'red';
	} else {
		location.reload();
	}
};


// REFRESH  onCLick
async function refreshSubmit(e) {
	e.preventDefault();
	n = this.id.replace("refreshForm", "")
	data = {
		Action : "refresh",
		Streams: [
			{
				Name : document.getElementById('name' + n).innerText,
				Id : document.getElementById('id' + n).value,
				ManifestUrl : document.getElementById('manifestUrl' + n).value,
				ManifestScript : document.getElementById('manifestScript' + n).value,
			},
		]
	}

	let response = await fetch(document.getElementsByTagName('base')[0].href+'api/action', {
		method: 'POST', // or 'PUT'
		headers: {
			'Content-Type': 'application/json',
		},
		body: JSON.stringify(data),
	})

	if (!response.ok) {
		text = await response.text();
		document.getElementById('actionStatus').innerText = "[" + response.statusText + "] " + text ;
		document.getElementById('actionStatus').style.color = 'red';
	} else {
		document.getElementById('actionStatus').innerText = "";
		document.getElementById('save').removeAttribute("disabled");
	}

};

async function refreshFormSubmit(e) {
	e.preventDefault();
	data = {
		Action : "refresh",
		Streams: [
			{
				Id : 'all'
			},
		]
	}

	let response = await fetch(document.getElementsByTagName('base')[0].href+'api/action', {
		method: 'POST', // or 'PUT'
		headers: {
			'Content-Type': 'application/json',
		},
		body: JSON.stringify(data),
	})

	if (!response.ok) {
		text = await response.text();
		document.getElementById('actionStatus').innerText = "[" + response.statusText + "] " + text ;
		document.getElementById('actionStatus').style.color = 'red';
	} else {
		document.getElementById('actionStatus').innerText = "";
		document.getElementById('save').removeAttribute("disabled");
	}
};


async function getStream(row, n) {
	var name = />(.*?)</.exec(row[1])[1]
	var id = /value="(.*?)"/.exec(row[1])[1]
	let response = await fetch(document.getElementsByTagName('base')[0].href+'api/action', {
		method: 'POST', // or 'PUT'
		headers: {
			'Content-Type': 'application/json',
		},
		body: JSON.stringify({ Action : "getstream", Streams: [  { "Name": name, "Id" : id} ] }),
	})

	let item = "";

	text = await response.text();
	if (!response.ok) {	
		document.getElementById('actionStatus').innerText = "[" + response.statusText + "] " + text ;
		document.getElementById('actionStatus').style.color = 'red';
		return
	} else {
		document.getElementById('actionStatus').innerText = "";
	}

	item = JSON.parse(text);

	// Store value
	streamsPrevParams.set(item.Id, item)

	// Link
	nameId = /id="(.*?)"/.exec(row[1])[1]
	if (!document.getElementById(nameId)) {
		return
	}
	document.getElementById(nameId).href = document.getElementsByTagName('base')[0].href + 'stream/' + id + '/master.m3u8'
	if (item.Mode == "vod") {
		document.getElementById(nameId).href = document.getElementsByTagName('base')[0].href + 'stream/' + id + ".mp4"
	}

	// Mode
	mode = /id="(.*?)"/.exec(row[5])[1]

	for (i=0; i<document.getElementById(mode).length; i++) {
		if (document.getElementById(mode).options[i].value == item.Mode) {
			document.getElementById(mode).selectedIndex = i;
			break
		}
	}


	// MPD
	el = [...row[6].matchAll(/id="(.*?)"/g)]
	document.getElementById(el[2][1]).value = ""
	if (item.Headers.Manifest) {
		Object.keys(item.Headers.Manifest).forEach(key => {
			document.getElementById(el[2][1]).value += key + ': ' + item.Headers.Manifest[key] + '\n';
		});
	}
	document.getElementById(el[3][1]).value = ""
	if (item.Headers.Media) {
		Object.keys(item.Headers.Media).forEach(key => {
			document.getElementById(el[3][1]).value += key + ': ' + item.Headers.Media[key] + '\n';
		});
	}

	document.getElementById(el[4][1]).value = item.ManifestScript;
	document.getElementById(el[5][1]).value = item.Manifest;

	// Network
	document.getElementById(el[8][1]).value = item.Proxy;
	document.getElementById(el[9][1]).value = item.Bind;
	document.getElementById(el[10][1]).value = item.Doh;
	document.getElementById(el[11][1]).value = item.XForwardedFor;
	document.getElementById(el[12][1]).checked = item.MediaNetwork;

	repIds = [...row[7].matchAll(/id="(.*?)"/g)]

	// Video
	var vStreamId = repIds[4][1]
	$('#' + vStreamId).empty();

	sel = ""
	if (item.VideoList != null && item.VideoList.length > 0 && item.VideoList[0].Id == "best") {
		sel = "selected"
	}
	$('#' + vStreamId).append('<option ' + sel + ' value="best">Best quality</option>');

	sel = ""
	if (item.VideoList != null) {
		for (i=0; i<item.VideoList.length; i++) {
			sel = ""
			if (item.VideoList[i].Id == item.Video) {
				sel = "selected"
			}

			$('#' + vStreamId).append('<option ' + sel + ' value="'+item.VideoList[i].Id+'">'+item.VideoList[i].Desc+'</option>');
		}
	}
	$('#' + vStreamId).selectpicker("refresh");

	// Audio
	var aStreamId = repIds[6][1]
	$('#' + aStreamId).empty();
	if (item.Audio == "all") {
		sel = "selected"
	} else {
		sel = ""
	}
	$('#' + aStreamId).append('<option ' + sel + ' value="all">All</option>');
	if (item.AudioList != null) {
		for (i=0; i<item.AudioList.length; i++) {
			sel = ""
			item.Audio.split(',').forEach(function(id) {
				if (item.AudioList[i].Id == id || id == "all") {
					sel = "selected"
				}
			});

			$('#' + aStreamId).append('<option ' + sel + ' value="'+item.AudioList[i].Id+'">'+item.AudioList[i].Desc+'</option>');
		}
	}
	$('#' + aStreamId).selectpicker("refresh");

	// Subtitles
	var sStreamId = repIds[8][1]
	$('#' + sStreamId).empty();
	if (item.Subtitles == "all") {
		sel = "selected"
	} else {
		sel = ""
	}
	$('#' + sStreamId).append('<option ' + sel + ' value="all">All</option>');
	if (item.SubtitlesList != null) {
		for (i=0; i<item.SubtitlesList.length; i++) {
			sel = ""
			item.Subtitles.split(',').forEach(function(id) {
				if (item.SubtitlesList[i].Id == id || id == "all") {
					sel = "selected"
				}
			});

			$('#' + sStreamId).append('<option ' + sel + ' value="'+item.SubtitlesList[i].Id+'">'+item.SubtitlesList[i].Desc+'</option>');
		}
	}
	$('#' + sStreamId).selectpicker("refresh");

	vStreamIdDiv = repIds[3][1]
	aStreamIdDiv = repIds[5][1]
	sStreamIdDiv = repIds[7][1]
	if ( item.VideoList != null && item.VideoList.length > 0 ) {
		document.getElementById(vStreamIdDiv).style.display = 'block';
	} else {
		document.getElementById(vStreamIdDiv).style.display = 'none';
	}
	if ( item.AudioList != null && item.AudioList.length > 0 ) {
		document.getElementById(aStreamIdDiv).style.display = 'block';
	} else {
		document.getElementById(aStreamIdDiv).style.display = 'none';
	}
	if ( item.SubtitlesList != null && item.SubtitlesList.length > 0 ) {
		document.getElementById(sStreamIdDiv).style.display = 'block';
	} else {
		document.getElementById(sStreamIdDiv).style.display = 'none';
	}

	startDate = repIds[11][1]
	startTime = repIds[12][1]
	endDate = repIds[13][1]
	endTime = repIds[14][1]

	localStart = new Date(item.RangeStartTime);
	localEnd = new Date(item.RangeEndTime);

	document.getElementById(startDate).value = localStart.toLocaleString('fr-CA').substr(0, 10).replace('/',':');
	document.getElementById(endDate).value = localEnd.toLocaleString('fr-CA').substr(0, 10).replace('/',':');
	document.getElementById(startTime).value = localStart.toLocaleString().substr(12,5);
	document.getElementById(endTime).value = localEnd.toLocaleString().substr(12,5);


	// CDM Type
	cdmtype = 'cdmtype' + /id="cdmtype([0-9]*?)"/.exec(row[8])[1]

	for (i=0; i<document.getElementById(cdmtype).length; i++) {
		if (document.getElementById(cdmtype).options[i].value == item.CdmType) {
			document.getElementById(cdmtype).selectedIndex = i;
			break
		}
	}

	// Cdm
	cdm = 'cdm' + /id="cdm([0-9]*?)"/.exec(row[8])[1]
	document.getElementById(cdm).value = item.Cdm

	checkBox = [...row[8].matchAll(/id="(.*?)"/g)]

	// Keys
	keys = 'keys' + /id="keys(.*?)"/.exec(row[8])[1]
	document.getElementById(keys).value = ""
	if (item.Keys != null) {
		for (i=0; i<item.Keys.length; i++) {
			document.getElementById(keys).value += item.Keys[i] + '\n';
		}
	}

	checkBox = [...row[9].matchAll(/id="(.*?)"/g)]

	// Checkboxes
	var i = 0;
	document.getElementById(checkBox[i++][1]).checked = item.Autostart;
	document.getElementById(checkBox[i++][1]).checked = item.Autoreplay;
	if (document.getElementById('ondemand' + n)) {
		document.getElementById(checkBox[i++][1]).checked = item.OnDemand;
	}
	document.getElementById(checkBox[i++][1]).checked = item.KeepFiles;
	document.getElementById(checkBox[i++][1]).checked = item.SessionManifest;
	if (document.getElementById('speedup' + n)) {
		document.getElementById(checkBox[i++][1]).checked = item.SpeedUp;
	}
	document.getElementById(checkBox[i++][1]).checked = item.UseCdm;
	document.getElementById(checkBox[i++][1]).checked = item.NetworkOverride;
	if (document.getElementById('ignoreupdate' + n)) {
		document.getElementById(checkBox[i++][1]).checked = item.IgnoreUpdate;
	}
	if (document.getElementById('fixivsize' + n)) {
		document.getElementById(checkBox[i++][1]).checked = item.FixIvSize;
	}
	if (document.getElementById('timerange' + n)) {
		document.getElementById(checkBox[i++][1]).checked = item.TimeRange;
	}

	document.getElementById(checkBox[i][1]).checked = item.TsHls;
	i += 2
	document.getElementById(checkBox[i][1]).checked = item.MultiTsHls;
	i += 2
	document.getElementById(checkBox[i][1]).checked = item.Fmp4Hls;
}

function startInterval(table) {
	document.getElementById('playerAudioSelect').style.display = 'none';
	document.getElementById('playerSubtitlesSelect').style.display = 'none';
	if (!ImageExist("logo2.png") && !ImageExist("logo3.png") && !ImageExist("logo4.png")) {
		var yourImg = document.getElementById('logo1');
		if(yourImg && yourImg.style) {
			yourImg.style.width = '200px';
		}
		for (i=2; i<=4; i++) {
			var yourImg = document.getElementById('logo'+i);
			if(yourImg && yourImg.style) {
				    yourImg.style.height = '0px';
				    yourImg.style.width = '0px';
			}
		}
	}
	intervalId=setInterval("updateStreams(table);",1000);
}

function ImageExist(url)  {
	var img = new Image();
	img.src = url;
	return img.height != 0;
}

function isInViewport(element) {
	    const rect = element.getBoundingClientRect();
	    return (
		            rect.top >= 0 &&
		            rect.left >= 0 &&
		            rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
		            rect.right <= (window.innerWidth || document.documentElement.clientWidth)
		        );
}

async function updateStreams(table) {

	var rowArray = table.rows({ page: 'current' }).data().toArray();
	if (rowArray == null) {
		return
	}

	var idsList = ""
	rowArray.forEach( function (row) {
		if (	document.getElementById('startStop' +  /id="name(.*?)"/.exec(row[1])[1]).value == "WAIT" || 
			isInViewport(document.getElementById('name' + /id="name(.*?)"/.exec(row[1])[1]))
		) {
			idsList += /value="(.*?)"/.exec(row[1])[1] + ","
		}
	});

	idsList = idsList.slice(0, -1)

	let response = await fetch(document.getElementsByTagName('base')[0].href+'api/action', {
		method: 'POST', // or 'PUT'
		headers: {
			'Content-Type': 'application/json',
		},
		body: JSON.stringify({ Action : "getstreams", Streams: [  { "Id" : idsList, }, ] }),
	}).catch(error => { document.getElementById('actionStatus').innerText = "remote server unreachable"; document.getElementById('actionStatus').style.color = 'red';});

	let data = "";

	text = await response.text();
	if (!response.ok) {	
		document.getElementById('actionStatus').innerText = "[" + response.statusText + "] " + text ;
		document.getElementById('actionStatus').style.color = 'red';
		return
	} else {
		document.getElementById('actionStatus').innerText = "";
	}

	data = JSON.parse(text);

	document.getElementById('actionStatus').innerText = ""

	// CHECK ADD/DELETE
	if (table.rows().count() != data.TotalStreamsCount){
		clearInterval(intervalId);
		location.reload();
	}

	if (data.GlobalChangeCounter > GlobalChangeCounter ) {
		GlobalChangeCounter = data.GlobalChangeCounter;
		document.getElementById('proxy').value = data.Proxy;
		document.getElementById('bind').value = data.Bind;
		document.getElementById('doh').value = data.Doh;
		document.getElementById('medianetwork').checked = data.MediaNetwork;
		document.getElementById('xforwardedfor').value = data.XForwardedFor;
		document.getElementById('manifestscriptparam').value = data.ManifestScriptParam;
		document.getElementById('cdmparam').value = data.CdmParam;
		if (document.getElementById('eventsautorefresh')) {
			document.getElementById('eventsautorefresh').checked = data.EventsAutorefresh;
		}
		if (document.getElementById('eventsautoremove')) {
			document.getElementById('eventsautoremove').checked = data.EventsAutoremove;
		}
		if (document.getElementById('eventsscript')) {
			document.getElementById('eventsscript').value = data.EventsScript;
		}
		if (document.getElementById('channelsscript')) {
			document.getElementById('channelsscript').value = data.ChannelsScript;
		}
		if (document.getElementById('channelsautoremove')) {
			document.getElementById('channelsautoremove').checked = data.ChannelsAutoremove;
		}
	}

	if (idsList.length == 0 ) {
		return
	}

	if (data.Stream == null || data.Stream.length == 0 || data == null){
		location.reload()
	}

	var rowArray = table.rows({ page: 'current' }).data().toArray();
	if (rowArray == null) {
		location.reload();
	}
	rowArray.forEach( function (row) {
		if (	document.getElementById('startStop' + /id="name(.*?)"/.exec(row[1])[1]).value == "WAIT" ||
			isInViewport(document.getElementById('name' + /id="name(.*?)"/.exec(row[1])[1]))
		) {
			var id = /value="(.*?)"/.exec(row[1])[1]
	
			let found = false
			data.Stream.forEach(function(item){
				if (item.Id == id)  {
	
					found = true
	
					n = /id="name(.*?)"/.exec(row[1])[1]

	
					if (PChangeCounter[item.Id] == undefined) {
						PChangeCounter[item.Id] = -1;
					}
	
					if (item.PChangeCounter > PChangeCounter[item.Id] ) {
						PChangeCounter[item.Id] = item.PChangeCounter
						getStream(row, n)
					}
	
					if ( item.Running == true ) {
						document.getElementById('startStop' + n).name = "stop";
						document.getElementById('startStop' + n).value = "STOP";
						document.getElementById('startStop' + n).innerText = "STOP";
					} else {
						document.getElementById('startStop' + n).name = "start";
						document.getElementById('startStop' + n).value = "START";
						document.getElementById('startStop' + n).innerText = "START";
					}
					document.getElementById('tdstatus' + n).style.verticalAlign="middle";
	
					document.getElementById('status' + n).textContent = item.Status;
					document.getElementById('status' + n).style.color = item.StatusColor;
					document.getElementById('status' + n).title = item.StreamInfo;
					document.getElementById('bw' + n).textContent = item.Bw;
					document.getElementById('bw' + n).style.color = item.BwColor;
					document.getElementById('tdbw' + n).style.verticalAlign="middle";
					if (item.CurrentVideo == '') {
						document.getElementById('qualitylogo' + n).src = document.getElementsByTagName('base')[0].href + "static/na.jpg";
					} else	if (item.CurrentVideo.includes("2160p")) {
						document.getElementById('qualitylogo' + n).src = document.getElementsByTagName('base')[0].href + "static/4k.jpg";
					} else if (item.CurrentVideo.includes("1440p")) {
						document.getElementById('qualitylogo' + n).src = document.getElementsByTagName('base')[0].href + "static/2k.jpg";
					} else if (item.CurrentVideo.includes("1080p")) {
						document.getElementById('qualitylogo' + n).src = document.getElementsByTagName('base')[0].href + "static/1080p.jpg";
					} else if (item.CurrentVideo.includes("720p")) {
						document.getElementById('qualitylogo' + n).src = document.getElementsByTagName('base')[0].href + "static/720p.jpg";
					} else  {
						document.getElementById('qualitylogo' + n).src = document.getElementsByTagName('base')[0].href + "static/sd.jpg";
					}

					document.getElementById('autostart' + n).removeAttribute("disabled");
					document.getElementById('autoreplay' + n).removeAttribute("disabled");

					if ( item.Running == true ) {
						if (document.getElementById('ondemand' + n)) {
							document.getElementById('ondemand' + n).setAttribute("disabled","disabled");
						}
						document.getElementById('keepfiles' + n).setAttribute("disabled","disabled");
						document.getElementById('mode' + n).setAttribute("disabled","disabled");
						document.getElementById('manifestUrl' + n).setAttribute("disabled","disabled");
						document.getElementById('manifestScript' + n).setAttribute("disabled","disabled");
						document.getElementById('proxy' + n).setAttribute("disabled","disabled");
						document.getElementById('bind' + n).setAttribute("disabled","disabled");
						document.getElementById('doh' + n).setAttribute("disabled","disabled");
						document.getElementById('xforwardedfor' + n).setAttribute("disabled","disabled");
						document.getElementById('medianetwork' + n).setAttribute("disabled","disabled");
						document.getElementById('refresh' + n).setAttribute("disabled","disabled");
						document.getElementById('vStreamId' + n).setAttribute("disabled","disabled");
						document.getElementById('aStreamId' + n).setAttribute("disabled","disabled");
						document.getElementById('sStreamId' + n).setAttribute("disabled","disabled");
						document.getElementById('keys' + n).setAttribute("disabled","disabled");
						document.getElementById('cdmtype' + n).setAttribute("disabled","disabled");
						document.getElementById('cdm' + n).setAttribute("disabled","disabled");
						document.getElementById('tshls' + n).setAttribute("disabled","disabled");
						document.getElementById('multitshls' + n).setAttribute("disabled","disabled");
						document.getElementById('fmphls' + n).setAttribute("disabled","disabled");
						document.getElementById('sessionmanifest' + n).setAttribute("disabled","disabled");
						if (document.getElementById('speedup' + n)) {
							document.getElementById('speedup' + n).setAttribute("disabled","disabled");
						}
						document.getElementById('usecdm' + n).setAttribute("disabled","disabled");
						document.getElementById('network' + n).setAttribute("disabled","disabled");
						if (document.getElementById('fixivsize' + n)) {
							document.getElementById('fixivsize' + n).setAttribute("disabled","disabled");
						}
						if (document.getElementById('timerange' + n)) {
							document.getElementById('timerange' + n).setAttribute("disabled","disabled");
						}
					} else {
						if (document.getElementById('ondemand' + n)) {
							document.getElementById('ondemand' + n).removeAttribute("disabled");
						}
						document.getElementById('keepfiles' + n).removeAttribute("disabled");
						document.getElementById('mode' + n).removeAttribute("disabled");
						document.getElementById('manifestUrl' + n).removeAttribute("disabled");
						document.getElementById('manifestScript' + n).removeAttribute("disabled");
						document.getElementById('proxy' + n).removeAttribute("disabled");
						document.getElementById('bind' + n).removeAttribute("disabled");
						document.getElementById('doh' + n).removeAttribute("disabled");
						document.getElementById('xforwardedfor' + n).removeAttribute("disabled");
						document.getElementById('medianetwork' + n).removeAttribute("disabled");
						document.getElementById('refresh' + n).removeAttribute("disabled");
						document.getElementById('vStreamId' + n).removeAttribute("disabled");
						document.getElementById('aStreamId' + n).removeAttribute("disabled");
						document.getElementById('sStreamId' + n).removeAttribute("disabled");
						document.getElementById('keys' + n).removeAttribute("disabled");
						document.getElementById('cdmtype' + n).removeAttribute("disabled");
						document.getElementById('cdm' + n).removeAttribute("disabled");
						document.getElementById('tshls' + n).removeAttribute("disabled");
						document.getElementById('multitshls' + n).removeAttribute("disabled");
						document.getElementById('fmphls' + n).removeAttribute("disabled");
						document.getElementById('sessionmanifest' + n).removeAttribute("disabled");
						if (document.getElementById('speedup' + n)) {
							document.getElementById('speedup' + n).removeAttribute("disabled");
						}
						document.getElementById('usecdm' + n).removeAttribute("disabled");
						document.getElementById('network' + n).removeAttribute("disabled");
						if (document.getElementById('fixivsize' + n)) {
							document.getElementById('fixivsize' + n).removeAttribute("disabled");
						}
						if (document.getElementById('ondemand' + n)) {
							document.getElementById('ondemand' + n).removeAttribute("disabled");
						}
					}

					if (item.Mode == "vod" || item.Mode == "replay" ) {
						document.getElementById('autostart' + n).setAttribute("disabled","disabled");
						document.getElementById('autoreplay' + n).setAttribute("disabled","disabled");
						if (document.getElementById('ondemand' + n)) {
							document.getElementById('ondemand' + n).setAttribute("disabled","disabled");
						}
						document.getElementById('keepfiles' + n).setAttribute("disabled","disabled");
						if (item.Mode == "vod") {
							if (document.getElementById('speedup' + n)) {
								document.getElementById('speedup' + n).setAttribute("disabled","disabled");
							}
							document.getElementById('tshls' + n).setAttribute("disabled","disabled");
							document.getElementById('multitshls' + n).setAttribute("disabled","disabled");
							document.getElementById('fmphls' + n).setAttribute("disabled","disabled");
						}
					} else {
						if (document.getElementById('ondemand' + n) && document.getElementById('ondemand' + n).checked == true) {
							document.getElementById('autostart' + n).setAttribute("disabled","disabled");
							document.getElementById('autoreplay' + n).setAttribute("disabled","disabled");
						}
						if (document.getElementById('keepfiles' + n).checked == true) {
							document.getElementById('autoreplay' + n).setAttribute("disabled","disabled");
						}
					}

					if (item.HasHeaders) {
						document.getElementById('headers' + n).style.display = 'table';
						document.getElementById('headers' + n).style.marginLeft = 'auto';
						document.getElementById('headers' + n).style.marginRight = 'auto';
					} else {
						document.getElementById('headers' + n).style.display = 'none';
						document.getElementById("headersmanifest" + n).style.display = 'none';
						document.getElementById("headersmedia" + n).style.display = 'none';
					}


					if ( document.getElementById('tshls').value == "false" ) {
						document.getElementById('tshls' + n).style.display = 'none';
						document.getElementById('ltshls' + n).style.display = 'none';
					}
					if ( document.getElementById('multitshls').value == "false" ) {
						document.getElementById('multitshls' + n).style.display = 'none';
						document.getElementById('lmultitshls' + n).style.display = 'none';
					}
					if ( document.getElementById('fmp4hls').value == "false" ) {
						document.getElementById('fmphls' + n).style.display = 'none';
						document.getElementById('lfmphls' + n).style.display = 'none';
					}
	
					if (item.UseCdm) {
						document.getElementById('cdm' + n).style.display = 'block';
					} else {
						document.getElementById('cdm' + n).style.display = 'none';
					}

					if (item.SessionManifest) {
						document.getElementById('manifestScript' + n).style.display = 'block';
					} else {
						document.getElementById('manifestScript' + n).style.display = 'none';
					}

					document.getElementById('networkInfoDiv' + n).style.display = 'none';
					if (item.NetworkOverride) {
						document.getElementById('networkDiv' + n).style.display = 'block';
					} else {
						document.getElementById('networkDiv' + n).style.display = 'none';
						if (item.Running && (item.Bind || item.Proxy || item.Doh)) {
							document.getElementById('networkInfoDiv' + n).style.display = 'block';
							var text = "";
							if (item.Bind) {
								text += "Bind: " + item.Bind + "\n";
							}
							if (item.Proxy) {
								text += "Proxy: " + item.Proxy + "\n";
							}
							if (item.Doh) {
								text += "Doh: " + item.Doh + "\n";
							}
							if (item.MediaNetwork) {
								text += "Media: " + item.MediaNetwork + "\n";
							}
							document.getElementById('networkInfo'+ n).innerText = text;
						}
					}

					if (document.getElementById('timerange' + n) && item.Mode != "vod" && item.Mode != "replay" ) {
						document.getElementById('timerange' + n).setAttribute("disabled","disabled");
					}

					if ((item.Mode == "vod" || item.Mode == "replay" ) && document.getElementById('timerange' + n) && document.getElementById('timerange' + n).checked) {
						document.getElementById('timeRangeRangeDiv' + n).style.display = 'block';
					} else {
						document.getElementById('timeRangeRangeDiv' + n).style.display = 'none';
					}

					$('#vStreamId' + n).selectpicker("refresh");
					$('#aStreamId' + n).selectpicker("refresh");
					$('#sStreamId' + n).selectpicker("refresh");

					if (item.ManifestInfo != '') {
						document.getElementById('manifestInfo'+ n).innerText = item.ManifestInfo;
					} else {
						document.getElementById('manifestInfo'+ n).innerText = 'Please refresh for more info';
					}
				}
			});
	
			if (!found) {
	//			location.reload();
			}
		}

	});


}

function makeid(length) {
    var result           = '';
    var characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    var charactersLength = characters.length;
    for ( var i = 0; i < length; i++ ) {
      result += characters.charAt(Math.floor(Math.random() * 
 charactersLength));
   }
   return result;
}

// ADD REC onCLick
async function addRecFormSubmit(e) {
	e.preventDefault();

	startTime = document.getElementById('recStartTime').value
	endTime = document.getElementById('recEndTime').value
	if (startTime == '') {
		startTime = "00:00"
	}
	if (endTime == '') {
		endTime = "00:00"
	}

        try {
                start = new Date(document.getElementById('recStartDate').value + 'T' + startTime + ":00").toISOString()
        } catch (error) {
                start = ""
        }
        try {
                end = new Date(document.getElementById('recEndDate').value + 'T' + endTime + ":00").toISOString()
        } catch (error) {
                end = ""
        }

	data = {
		Action : "addrec",
		Recordings: [
			{
				Id: makeid(15),
				StreamName : document.getElementById('addRecChan').options[document.getElementById('addRecChan').selectedIndex].innerText,
				StreamId : document.getElementById('addRecChan').options[document.getElementById('addRecChan').selectedIndex].value,
				Start: start,
				End: end,
			},
		]
	}

	let response = await fetch(document.getElementsByTagName('base')[0].href+'api/action', {
		method: 'POST', // or 'PUT'
		headers: {
			'Content-Type': 'application/json',
		},
		body: JSON.stringify(data),
	})

	if (!response.ok) {
		text = await response.text();
		document.getElementById('recActionStatus').innerText = "[" + response.statusText + "] " + text ;
		document.getElementById('recActionStatus').style.color = 'red';
	} else {
		location.reload();
	}
};

// DELETE onCLick
async function recDeleteSubmit(e) {
	e.preventDefault();

	var rowArray = table.rows({ page: 'current' }).data().toArray();
	if (rowArray == null) {
		return
	}

	var idsList = ""
	var namesList = ""
	rowArray.forEach( function (row) {
		if (document.getElementById('recchecked' + /id="recstreamname(.*?)"/.exec(row[1])[1]).checked) {
			idsList += /value="(.*?)"/.exec(row[1])[1] + ","
			namesList +=  document.getElementById('recstreamname' + /id="recstreamname(.*?)"/.exec(row[1])[1]).innerText + "\n"
		}
	});

	namesList = namesList.slice(0, -1)

	idsList = idsList.slice(0, -1)
	if (idsList == "") {
		return;
	}

	var result = confirm("Are you sure you want to delete:\n\n" +  namesList);
        if (result != true) {
                return
        }

	data = {
		Action : "deleterec",
		Recordings: [
			{
				Id : idsList
			},
		]
	}

	let response = await fetch(document.getElementsByTagName('base')[0].href+'api/action', {
		method: 'POST', // or 'PUT'
		headers: {
			'Content-Type': 'application/json',
		},
		body: JSON.stringify(data),
	})

	if (!response.ok) {
		text = await response.text();
		document.getElementById('recActionStatus').innerText = "[" + response.statusText + "] " + text ;
		document.getElementById('recActionStatus').style.color = 'red';
	} else {
		location.reload();
	}
};

function showHideHeaders(e) {
	e.preventDefault();
	n = this.id.replace("headers", "")

	var x = document.getElementById("headersmanifest" + n);
	var y = document.getElementById("headersmedia" + n);
	if (x.style.display === "none") {
		x.style.display = "block";
		document.getElementById("headers" + n).value='hide headers';
	} else {
		x.style.display = "none";
		document.getElementById("headers" + n).value='show headers';
	}
	if (y.style.display === "none") {
		y.style.display = "block";
	} else {
		y.style.display = "none";
	}
}

