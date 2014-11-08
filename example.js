(function (angular, JSZip) {
    "use strict";

	function Region (x, y, height, width, color) {
		this.fileName = '';
		this.x = x ? +x : 60;
		this.y = y ? +y : 60;
		this.height = height ? +height : 120;
		this.width  = width ? +width : 120;
		this.color = color ? color : '#FF0000'
	};

	var module = angular.module('net.enzey.image-splicer.example', ['net.enzey.image-splicer']);

	module.controller('imageSplicerController', function ($scope, $document, PrimaryImage, $window) {
		$scope.regions = [];

		$scope.addRegion = function() {
			$scope.regions.push(new Region());
		}

		var renderCanvas = function(canvasElem, region) {
			var windowHeight = $document[0].body.clientHeight;
			var windowWidth = $document[0].body.clientWidth;
			var aspectRatio = region.height / region.width;

			canvasElem[0].width  = $window.innerWidth;
			canvasElem[0].height   = $window.innerHeight;
			var canvas = canvasElem[0].getContext('2d');

			var canvasHeight = windowHeight;
			var canvasWidth  = windowHeight * aspectRatio;
			if (canvasHeight > windowWidth) {
				canvasHeight = windowWidth / aspectRatio;
				canvasWidth  = windowWidth;
			}
			canvasHeight = Math.min(region.height, canvasHeight);
			canvasWidth =  Math.min(region.width, canvasWidth);

			canvas.clearRect(0, 0, windowWidth, windowHeight);

			var centerPosX = (windowWidth - canvasWidth) / 2;
			var centerPosY = (windowHeight - canvasHeight) / 2;
			canvas.drawImage(PrimaryImage.get(),
						region.x,   region.y,   region.width, region.height,
						centerPosX, centerPosY, canvasWidth,  canvasHeight);
		};

		$scope.editRegion = function(region) {
			var regionEditor = angular.element('<div class="regionEditor"></div>');

			var canvasElem = angular.element('<canvas></canvas>');
			regionEditor.append(canvasElem);
			var canvas = canvasElem[0].getContext('2d');

			angular.element($document[0].body).append(regionEditor);

			renderCanvas(canvasElem, region);

			var origMouseEvent;
			var origRegion = angular.copy(region);
			canvasElem[0].addEventListener('mousedown', function(event) {
				origMouseEvent = event;
				origRegion = angular.copy(region);
			});
			canvasElem[0].addEventListener('mouseup', function(event) {
				origMouseEvent = null;
			});
			canvasElem[0].addEventListener('mousemove', function(event) {
				if (origMouseEvent) {
					var offsetX = origMouseEvent.clientX - event.clientX;
					var offsetY = origMouseEvent.clientY - event.clientY;

					region.x = Math.max(0, origRegion.x + offsetX);
					region.x = Math.min(region.x, PrimaryImage.get().width - region.width);

					region.y = Math.max(0, origRegion.y + offsetY);
					region.y = Math.min(region.y, PrimaryImage.get().height - region.height);

					$scope.$apply();
					renderCanvas(canvasElem, region);
				}
			});

			canvasElem[0].addEventListener('dblclick', function(event) {
				regionEditor.remove();
			});
		};

		$scope.exportRegions = function(regions) {
			var zip = new JSZip();

			regions.forEach(function(region) {
				var canvasElem = angular.element('<canvas></canvas>');

				canvasElem[0].setAttribute('width', region.width);
				canvasElem[0].setAttribute('height', region.height);

				var canvas = canvasElem[0].getContext('2d');
				canvas.drawImage(PrimaryImage.get(), region.x, region.y, region.width, region.height, 0, 0, region.width, region.height);

				var imageData = canvasElem[0].toDataURL("image/png");
				var image = new Image();
				image.src = imageData;

				imageData = imageData.replace(/^data:image\/(png|jpg);base64,/, "");
				zip.file(region.fileName + '.png', imageData, {base64: true});
			});

			var content = zip.generate();

			var downloader = angular.element('<a>download</a>');
			downloader.attr('href', "data:application/zip;base64," + content);
			downloader.attr('download', 'my.zip')

            var ev = $document[0].createEvent("MouseEvent");
            ev.initMouseEvent(
                "click",
                true /* bubble */, true /* cancelable */,
                window, null,
                0, 0, 0, 0, /* coordinates */
                false, false, false, false, /* modifier keys */
                0 /*left*/, null
            );
            downloader[0].dispatchEvent(ev);
		};
	});

})(angular, JSZip);