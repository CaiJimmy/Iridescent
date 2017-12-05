export default function (file, perferedWidth) {
	return new Promise((resolve, reject) => {
		let reader = new FileReader();

		reader.onload = function (e) {
			var img = new Image();
			img.onload = async function () {
				let blob = await resizeInCanvas(img);
				resolve(blob)
			};
			img.src = e.target.result;
		};

		reader.readAsDataURL(file);

		function resizeInCanvas(img) {
			var canvas = document.createElement('canvas');
			var perferedWidth = perferedWidth | 1500;
			var ratio = perferedWidth / img.width;
			canvas.width = img.width * ratio;
			canvas.height = img.height * ratio;
			var ctx = canvas.getContext("2d");
			ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

			function getCanvasBlob(canvas) { /// Promisify it
				return new Promise((resolve, reject) => {
					canvas.toBlob(function (blob) {
						resolve(blob)
					})
				})
			};

			return getCanvasBlob(canvas)
		}
	});
};
