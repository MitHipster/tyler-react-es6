const React = require('react');
const PropTypes = require('prop-types');
const Link = require('react-router-dom').Link;
const queryString = require('query-string');
const api = require('../utils/api');
const PlayerPreview = require('./PlayerPreview');
const Loading = require('./Loading');

function Profile({info}) {
	const {login, avatar_url, name, location, company, followers, following, public_repos, blog} = info;

	return (
		<PlayerPreview username={login} avatar={avatar_url}>
			<ul className='space-list-items'>
				{name && <li>{name}</li>}
				{location && <li>{location}</li>}
				{company && <li>{company}</li>}
				<li>Followers: {followers}</li>
				<li>Following: {following}</li>
				<li>Public Repos: {public_repos}</li>
				{blog && <li><a href={blog}>{blog}</a></li>}
			</ul>
		</PlayerPreview>
	);
}

Profile.propTypes = {
	info: PropTypes.object.isRequired
};

function Player(props) {
	return (
		<div>
			<h1 className='header'>{props.label}</h1>
			<h3 className='header-score'>Score: {props.score}</h3>
			<Profile info={props.profile} />
		</div>
	);
}

Player.propTypes = {
	label: PropTypes.string.isRequired,
	score: PropTypes.number.isRequired,
	profile: PropTypes.object.isRequired
};

class Results extends React.Component {
	constructor(props) {
		super(props);

		this.state = {
			winner: null,
			loser: null,
			error: null,
			loading: true
		};
	}
	componentDidMount() {
		const {playerOneName, playerTwoName} = queryString.parse(this.props.location.search);

		api.battle([
			playerOneName,
			playerTwoName
		]).then(results => {
			if (!results) {
				return this.setState(() => ({
					error: 'Looks like there was an error. Check that both users exist on GitHub.',
					loading: false
				}));
			}
			this.setState(() => ({
				error: null,
				winner: results[0],
				loser: results[1],
				loading: false
			}));
		});
	}
	render() {
		const {error, winner, loser, loading} = this.state;
		
		if (loading) {
			return <Loading />;
		}

		if (error) {
			return (
				<div>
					<p>{error}</p>
					<Link to='/battle'>Reset</Link>
				</div>
			);
		}

		return (
			<div className='row'>
				<Player
					label='Winner'
					score={winner.score}
					profile={winner.profile}
				/>
				<Player
					label='Loser'
					score={loser.score}
					profile={loser.profile}
				/>
			</div>
		);
	}
}

Results.propTypes = {
	location: PropTypes.object.isRequired
};

module.exports = Results;