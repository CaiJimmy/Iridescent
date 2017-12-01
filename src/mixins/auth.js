import store from '@/store';
import * as firebase from 'firebase/app';
import 'firebase/firestore';
import 'firebase/auth';

export default {
	data() {
		return {
			isAdmin: false,
			firebaseReady: false,
			loggedIn: false
		}
	},
	methods: {
		validAccountCheck: function () {
			let user = firebase.auth().currentUser;

			return firestore.collection('users').doc(user.uid).set({
				'displayName': user.displayName,
				'email': user.email,
				'photoURL': user.photoURL
			}, {
				merge: true
			}).then(() => {
				this.loggedIn = true;
				return true;
			}).catch((err) => { // Not a while-listed domain
				console.log(err);
				this.loggedIn = false;
				return false;
			});
		},
		roleCheck: function () {
			let user = firebase.auth().currentUser;

			return firestore.collection('admins').get().then(() => {
				this.isAdmin = true;
				return true;
			}).catch((err) => { // The account is not in admin-list
				console.log(err);
				return false;
			});

		}
	}
}
