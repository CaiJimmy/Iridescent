require('dotenv').config();

module.exports = {
	FIREBASE_API_KEY: JSON.stringify(process.env.FIREBASE_API_KEY),
	FIREBASE_AUTH_DOMAIN: JSON.stringify(process.env.FIREBASE_AUTH_DOMAIN),
	FIREBASE_DATABASE_URL: JSON.stringify(process.env.FIREBASE_DATABASE_URL),
	FIREBASE_PROJECT_ID: JSON.stringify(process.env.FIREBASE_PROJECT_ID),
	FIREBASE_STORAGE_BUCKET: JSON.stringify(process.env.FIREBASE_STORAGE_BUCKET),
	SENTRY_API: JSON.stringify(process.env.SENTRY_API),
	GA_TRACKINGID: JSON.stringify(process.env.GA_TRACKINGID)
};