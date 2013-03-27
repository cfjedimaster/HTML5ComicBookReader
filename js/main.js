var images = [];
var done = 0;
var dir;
var curPanel;

//Generic error handler
function errorHandler(e) {
	console.log("*** ERROR ***");
	console.dir(e);
}

function init() {	
	window.webkitStorageInfo.requestQuota(window.TEMPORARY, 20*1024*1024, function(grantedBytes) {
		window.webkitRequestFileSystem(window.TEMPORARY, grantedBytes, onInitFs, errorHandler);
	}, errorHandler);

}

function onInitFs(fs) {
	dir = fs.root;
	$(document).on("dragover", dragOverHandler);

	$(document).on("drop", dropHandler);
	console.log('onInitFs done, new');
}

function dragOverHandler(e) {
	e.preventDefault();
}


function dropHandler(e) {
	e.stopPropagation();
	e.preventDefault();

	if(!e.originalEvent.dataTransfer.files) return;
	var files = e.originalEvent.dataTransfer.files;
	var count = files.length;
 
 	if(!count) return;

 	//Only one file allowed
 	if(count > 1) {
 		doError("You may only drop one file.");
 		return;
 	}

 	handleFile(files[0]);
 }

function doError(s) {
	var errorBlock = "<div class='alert alert-block alert-error'>";
	errorBlock += '<button class="close" data-dismiss="alert">&times;</button>';
	errorBlock += "<p>"+s+"</p>";
	errorBlock += "</div>";
	$("#alertArea").html(errorBlock);
}

function handleFile(file) {
	zip.workerScriptsPath = "js/";

	zip.createReader(new zip.BlobReader(file), function(reader) {
		console.log("did create reader");
	    reader.getEntries(function(entries) {
	    	console.log("got entries");
	    	
			$("#introText").hide();

	    	//Start a modal for our status
	    	var modalString = 'Parsed the CBZ - Saving Images. This takes a <b>long</b> time!';
	    	$("#statusModalText").html(modalString);
			$("#statusModal").modal({keyboard:false});

	        entries.forEach(function(entry) {
	        	if(!entry.directory && entry.filename.indexOf(".jpg") != -1) {
	        		//rewrite w/o a path
	        		var cleanName = entry.filename;
	        		if(cleanName.indexOf("/") >= 0) cleanName = cleanName.split("/").pop();
					dir.getFile(cleanName, {create:true}, function(file) {
						console.log("Yes, I opened "+file.fullPath);
		        		images.push({path:file.toURL(), loaded:false})
						entry.getData(new zip.FileWriter(file), function(e) {

							done++;
							//$("#statusModalText").html("Did "+done+" images out of "+images.length);
							var perc = Math.floor(done/images.length*100);
							var pString = 'Processing images.';
							pString += '<div class="progress progress-striped active">';
							pString += '<div class="bar" style="width: '+perc+'%;"></div>';
							pString += '</div>';
							$("#statusModalText").html(pString);

							for(var i=0; i<images.length; i++) {
								if(images[i].path == file.toURL()) {
									images[i].loaded = true; 
									break;
								}								
							}

							if(done == images.length) {
								$("#statusModal").modal("hide");
								//enable buttons
								$("#buttonArea").show();
								$("#prevBtn").on("click",prevPanel);
								$("#nextBtn").on("click",nextPanel);
								drawPanel(0);
							}
						});

					},errorHandler);

		        }
	        });
	    });
	}, function(err) {
		doError("Sorry, but unable to read this as a CBR file.");
	    console.dir(err);
	});

}

function drawPanel(num) {
	curPanel = num;
	$("#comicImg").attr("src",images[num].path);
	$("#panelCount").html("Panel "+(curPanel+1)+" out of "+images.length);
}

function prevPanel() {
	if(curPanel > 0) drawPanel(curPanel-1);
}

function nextPanel() {
	if(curPanel+1 < images.length) drawPanel(curPanel+1);
}
