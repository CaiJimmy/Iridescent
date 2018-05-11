import * as firebase from "firebase/app";
import 'firebase/storage';

export default function uploadFile(file, path) {
	let storageRef = firebase.storage().ref(),
		metadata = {
			contentType: file.type
        };
        
	return firebase
		.storage()
		.ref(path || "coverImage/" + file.name)
		.put(file, metadata)
		.then(function (snapshot) {
			console.log("Uploaded", snapshot.totalBytes, "bytes.");
			console.log(snapshot.metadata);
			var url = snapshot.downloadURL;
			console.log("File available at", url);

			return snapshot;
		})
		.catch(function (error) {
			console.error("Upload failed:", error);
		});
}
