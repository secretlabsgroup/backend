module.exports = {
	async getSharedEvents(parent, args, { user, query }, info) {
		if (!user) throw new Error('You must be logged in to use this feature!');

		const userToMatch = await query.users({
			where: {
				id: args.userToMatchId
			}
		});
		if (!userToMatch) throw new Error('Cannot find the User To Macth!');

		return (sharedEvent = await query.events(
			{
				where: {
					AND: [
						{
							attending_some: {
								id: user.id
							}
						},
						{
							attending_some: {
								id: args.userToMatchId
							}
						}
					]
				}
			},
			info
		));
	},
	async getMatchUsers(parent, args, { user, query }, info) {
		if (!user) throw new Error('You must be logged in to use this feature!');

		const userEventId = user.events.map(event => event.id);

		const matches = await query.users({
			where: {
				AND: [
					{ id_not: user.id },
					{ age_lte: user.maxAgePref },
					{ age_gte: user.minAgePref },
					{ gender_in: user.genderPrefs },
					{
						events_some: {
							id_in: userEventId
						}
					}
				]
			}
		});

		const getScore = async userId => {
			const sharedEvent = await query.events({
				where: {
					AND: [
						{
							attending_some: {
								id: user.id
							}
						},
						{
							attending_some: {
								id: userId
							}
						}
					]
				}
			});
			return sharedEvent.length;
		};

		return matches.map(match => ({
			user: match,
			score: getScore(match.id)
		}));
	},

	async getLikedByList(parent, args, { user, query }, info) {
		if (!user) throw new Error('You must be logged in to use this feature!');

		return query.users(
			{
				where: {
					liked_some: {
						id: user.id
					}
				}
			},
			info
		);
	}
};
