var images = [];
var done = 0;
var curPanel;

//Generic error handler
function errorHandler(e) {
	console.log("*** ERROR ***");
	console.dir(e);
}

function init() {	

	$("#prevBtn").on("click",prevPanel);
	$("#nextBtn").on("click",nextPanel);

	loadArchiveFormats(['rar', 'zip'], function() {
		$(document).on("dragover", dragOverHandler);
		$(document).on("drop", dropHandler);
		console.log('init done');
	});

}

function dragOverHandler(e) {
	e.originalEvent.preventDefault();
	e.originalEvent.dataTransfer.dropEffect = "move";
}

function dropHandler(e) {
	e.preventDefault();
	e.stopPropagation();

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
	var errorBlock = `
	<div class='alert alert-block alert-error'>
	<button class="close" data-dismiss="alert">&times;</button>
	<p>${s}</p>
	</div>
	`;
	$("#alertArea").html(errorBlock);
}

function handleFile(file) {
	console.log('try to parse '+file.name);

	images = []; 
	curPanel = 0;
	$("#comicImg").attr("src","");
	$("#buttonArea").hide();

	archiveOpenFile(file, null, function(archive, err) {
		if (archive) {

	    	var modalString = 'Parsed the CBZ - Saving Images. This takes a <b>long</b> time!';
	    	$("#statusModalText").html(modalString);
			$("#statusModal").modal({keyboard:false});

			console.info('Uncompressing ' + archive.archive_type + ' ...');
			// filter archive entries to files
			let imageArchive = archive.entries.filter(e => {
				return e.is_file;
			});

			imageArchive.forEach(entry => {

				entry.readData(function(data, err) {
					let url = URL.createObjectURL(new Blob([data]));
					images.push(url);

					var perc = Math.floor(images.length/archive.entries.length*100);
					var pString = `
						Processing images.
						<div class="progress progress-striped active">
						<div class="bar" style="width: ${perc}%;"></div>
						</div>
					`;
					$("#statusModalText").html(pString);
					if(imageArchive.length === images.length) {
						$("#statusModal").modal("hide");
						$("#buttonArea").show();
						drawPanel(0);
					}					
				});
			});


		} else {
			console.error(err);
			doError(err);
		}
	});

}

function drawPanel(num) {
	curPanel = num;
	$("#comicImg").attr("src",images[num]);
	$("#panelCount").html("Panel "+(curPanel+1)+" out of "+images.length);
}

function prevPanel() {
	if(curPanel > 0) drawPanel(curPanel-1);
}

function nextPanel() {
	if(curPanel+1 < images.length) drawPanel(curPanel+1);
}
