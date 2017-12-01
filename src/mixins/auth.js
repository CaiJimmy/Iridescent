import store from '@/store';
import * as firebase from 'firebase/app';
import 'firebase/firestore';
import 'firebase/auth';

export default {
	data() {
		return {
			isAdmin: false,
			firebaseReady: false
		}
	},
	methods: {
		roleCheck: function () {
			let user = firebase.auth().currentUser;

			if (!user) {
				return false;
			};

			return firestore.collection('users').doc(user.uid).set({
				'displayName': user.displayName,
				'email': user.email,
				'photoURL': user.photoURL
			}, {
				merge: true
			}).then(() => {
				return true;
			}).catch((err) => { // Not a while-listed domain
				console.log(err);
				return false;
			});
		}
	}
}
