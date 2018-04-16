import axios from 'axios';

/* If client ID and Secret are needed due to rate limiting use:
const id = 'YOUR_CLIENT_ID';
const secret = 'YOUR_CLIENT_SECRET';
const params = `?client_id=${id}&client_secret=${secret}`; */


function getProfile(username) {
	// return axios.get(`https://api.github.com/users/${username}${params})
	return axios.get(`https://api.github.com/users/${username}`)
		.then(({data}) => data); // De-structure
}

function getRepos(username) {
	// return axios.get(`https://api.github.com/users/${username}/repos${params}&per_page=100`);
	return axios.get(`https://api.github.com/users/${username}/repos?page=1&per_page=100`);
}

function getStarCount(repos) {
	return repos.data.reduce((count, {stargazers_count}) => count + stargazers_count, 0); // De-structure
}

function calculateScore({followers}, repos) {
	return (followers * 3) + getStarCount(repos);
}

function handleError(error) {
	console.warn(error);
	return null;
}

// Need to include babel polyfill package in webpack config to pull in ES6 methods
function getUserData(player) {
	return Promise.all([
		getProfile(player),
		getRepos(player)
	]).then(([profile, repos]) => ({
		profile,
		score: calculateScore(profile, repos)
	}));
}

function sortPlayers(players) {
	return players.sort((a, b) => b.score - a.score);
}

export function battle(players) {
	return Promise.all(players.map(getUserData))
		.then(sortPlayers)
		.catch(handleError);
}

export function fetchPopularRepos(language) {
	const encodedURI = window.encodeURI(`https://api.github.com/search/repositories?q=stars:>1+language:${language}&sort=stars&order=desc&type=Repositories`);

	return axios.get(encodedURI).then(({data}) => data.items);
}