const { forwardTo } = require('prisma-binding');
const axios = require('axios');
const { transformEvents } = require('../utils');

const Query = {
	users: forwardTo('db'),
	events: forwardTo('db'),
	currentUser(parent, args, { db, request }, info) {
		// check if there is a current user ID
		if (!request.userId) {
			return null;
		}
		return db.query.user(
			{
				where: { id: request.userId },
			},
			info,
		);
	},
	user(parent, args, { db }, info) {
		// finds a user based on the args provided in the mutation
		return db.query.user(
			{
				...args,
			},
			info,
		);
	},
	async getEvents(parent, { location, page, ...args }, ctx, info) {
		// searches for events based on the genre provided
		let categories = args.categories.toString() || 'music,comedy,performing_arts,sports';
		let dates = args.dates.toString() || 'all';
		console.log(categories, dates, page, location);
		const { data } = await axios.get(
			`https://api.eventful.com/json/events/search?location=${location}&category=${categories}&date=${dates}&page_number=${page}&page_size=15&app_key=${process
				.env.API_KEY}`,
		);

		// shapes return object into sveldt, beautiful object with whimsical designs
		let events = transformEvents(data.events);

		return {
			events: events,
			total_items: data.total_items,
			page_count: data.page_count,
			page_number: data.page_number,
		};
	},
	async getEvent(parent, args, ctx, info) {
		// find specific event
		const event = await axios.get(
			`http://api.eventful.com/json/events/get?&id=${args.id}&app_key=${process.env.API_KEY}`,
		);
		// gonna make another helper to shape this bad boy too
		return {
			title: event.data.title,
			id: event.data.id,
			// url: event.data.url,
			location: {
				venue: event.data.venue_name,
			},
			details: {
				tags: event.data.tags.tag,
			},
		};
	},
	async getLocation(parent, { latitude, longitude }, ctx, info) {
		const location = await axios.get(
			`https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude}, ${longitude}&key=${process
				.env.GOOGLE_API_KEY}`,
		);
		let city = location.data.results[0].address_components[3].long_name;
		let state = location.data.results[0].address_components[5].short_name;
		console.log(city, state);
		return {
			location: `${city}, ${state}`,
		};
	},
};

module.exports = Query;

// const search_categories = [
// 	{
// 		name: 'Concerts &amp; Tour Dates',
// 		event_count: null,
// 		id: 'music'
// 	},
// 	{
// 		name: 'Conferences &amp; Tradeshows',
// 		event_count: null,
// 		id: 'conference'
// 	},
// 	{
// 		name: 'Comedy',
// 		event_count: null,
// 		id: 'comedy'
// 	},
// 	{
// 		name: 'Education',
// 		event_count: null,
// 		id: 'learning_education'
// 	},
// 	{
// 		name: 'Kids &amp; Family',
// 		event_count: null,
// 		id: 'family_fun_kids'
// 	},
// 	{
// 		name: 'Festivals',
// 		event_count: null,
// 		id: 'festivals_parades'
// 	},
// 	{
// 		name: 'Film',
// 		event_count: null,
// 		id: 'movies_film'
// 	},
// 	{
// 		name: 'Food &amp; Wine',
// 		event_count: null,
// 		id: 'food'
// 	},
// 	{
// 		name: 'Fundraising &amp; Charity',
// 		event_count: null,
// 		id: 'fundraisers'
// 	},
// 	{
// 		name: 'Art Galleries &amp; Exhibits',
// 		event_count: null,
// 		id: 'art'
// 	},
// 	{
// 		name: 'Health &amp; Wellness',
// 		event_count: null,
// 		id: 'support'
// 	},
// 	{
// 		name: 'Holiday',
// 		event_count: null,
// 		id: 'holiday'
// 	},
// 	{
// 		name: 'Literary &amp; Books',
// 		event_count: null,
// 		id: 'books'
// 	},
// 	{
// 		name: 'Museums &amp; Attractions',
// 		event_count: null,
// 		id: 'attractions'
// 	},
// 	{
// 		name: 'Neighborhood',
// 		event_count: null,
// 		id: 'community'
// 	},
// 	{
// 		name: 'Business &amp; Networking',
// 		event_count: null,
// 		id: 'business'
// 	},
// 	{
// 		name: 'Nightlife &amp; Singles',
// 		event_count: null,
// 		id: 'singles_social'
// 	},
// 	{
// 		name: 'University &amp; Alumni',
// 		event_count: null,
// 		id: 'schools_alumni'
// 	},
// 	{
// 		name: 'Organizations &amp; Meetups',
// 		event_count: null,
// 		id: 'clubs_associations'
// 	},
// 	{
// 		name: 'Outdoors &amp; Recreation',
// 		event_count: null,
// 		id: 'outdoors_recreation'
// 	},
// 	{
// 		name: 'Performing Arts',
// 		event_count: null,
// 		id: 'performing_arts'
// 	},
// 	{
// 		name: 'Pets',
// 		event_count: null,
// 		id: 'animals'
// 	},
// 	{
// 		name: 'Politics &amp; Activism',
// 		event_count: null,
// 		id: 'politics_activism'
// 	},
// 	{
// 		name: 'Sales &amp; Retail',
// 		event_count: null,
// 		id: 'sales'
// 	},
// 	{
// 		name: 'Science',
// 		event_count: null,
// 		id: 'science'
// 	},
// 	{
// 		name: 'Religion &amp; Spirituality',
// 		event_count: null,
// 		id: 'religion_spirituality'
// 	},
// 	{
// 		name: 'Sports',
// 		event_count: null,
// 		id: 'sports'
// 	},
// 	{
// 		name: 'Technology',
// 		event_count: null,
// 		id: 'technology'
// 	},
// 	{
// 		name: 'Other &amp; Miscellaneous',
// 		event_count: null,
// 		id: 'other'
// 	}
// ];
