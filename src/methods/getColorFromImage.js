import * as Vibrant from 'node-vibrant'

export default function (imageURL) {
	return Vibrant.from(imageURL).getPalette()
		.then((palette) => {
			if (palette.Muted) {
				return palette.Muted.getRgb()
			} else if (palette.Vibrant) {
				return palette.Vibrant.getRgb()
			} else {
				return [0, 191, 165] /// Return tea green as color in case Vibrant fails
			}
		});
}
