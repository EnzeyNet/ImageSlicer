(function (angular, JSZip) {
    "use strict";

	function Region (x, y, height, width) {
		this.fileName = '';
		this.x = x ? +x : 30;
		this.y = y ? +y : 30;
		this.height = height ? +height : 30;
		this.width  = width ? +width : 30;
	};

	var module = angular.module('net.enzey.image-splicer.example', ['net.enzey.image-splicer']);

	module.controller('imageSplicerController', function ($scope, $document, PrimaryImage) {
		$scope.regions = [];

		$scope.addRegion = function() {
			$scope.regions.push(new Region());
		}

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