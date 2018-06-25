import ImageCompressor from 'image-compressor.js';

export default function (file, width) {
	return new Promise((resolve, reject) => {
		new ImageCompressor(file, {
			quality: .1,
			maxWidth: width,
			success(result) {
				resolve(result);
			},
			error(e) {
				console.log(e.message);
			},
		});
	});
};
