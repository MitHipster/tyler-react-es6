/* If client ID and Secret are needed due to rate limiting use:
const id = 'YOUR_CLIENT_ID';
const secret = 'YOUR_CLIENT_SECRET';
const params = `?client_id=${id}&client_secret=${secret}`; */


async function getProfile(username) {
	// return axios.get(`https://api.github.com/users/${username}${params})
	const response = await fetch(`https://api.github.com/users/${username}`);
	
	return response.json();
}

async function getRepos(username) {
	// return axios.get(`https://api.github.com/users/${username}/repos${params}&per_page=100`);
	const response =  await fetch(`https://api.github.com/users/${username}/repos?page=1&per_page=100`);

	return response.json();
}

function getStarCount(repos) {
	return repos.reduce((count, {stargazers_count}) => count + stargazers_count, 0); // De-structure
}

function calculateScore({followers}, repos) {
	return (followers * 3) + getStarCount(repos);
}

function handleError(error) {
	console.warn(error);
	return null;
}

// Need to include babel polyfill package in webpack config to pull in ES6 methods
async function getUserData(player) {
	const [profile, repos] = await Promise.all([getProfile(player), getRepos(player)]);
	return {
		profile,
		score: calculateScore(profile, repos)
	};
}

function sortPlayers(players) {
	return players.sort((a, b) => b.score - a.score);
}

export async function battle(players) {
	const results =  await Promise.all(players.map(getUserData))
		.catch(handleError);

	return !results ? results : sortPlayers(results);
}

export async function fetchPopularRepos(language) {
	const encodedURI = window.encodeURI(`https://api.github.com/search/repositories?q=stars:>1+language:${language}&sort=stars&order=desc&type=Repositories`);

	const response = await fetch(encodedURI)
		.catch(handleError);

	const repos = await response.json();
	
	return repos.items;
}