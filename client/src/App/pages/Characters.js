import React, { Component } from 'react';
import queryString from 'query-string';
import { withRouter } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import BarChartFilterForm from './components/BarChartFilterForm';
import CharacterChart from './components/CharacterChart';
import getRealmList from './helper/getRealmList';
import Spinner from './components/Spinner';

class Characters extends Component {
  // Initialize the state
  constructor(props) {
    super(props);
    this.state = {
      realmOptions: null,
      query: null,
      characterStats: null,
      loading: false
    };
  }

  // Fetch the list on first mount
  componentDidMount() {
    const { location } = this.props;
    const query = queryString.parse(location.search);
    if (Object.entries(query).length !== 0) {
      this.getCharacterStats(query);
    }
    getRealmList(realms => {
      this.setState({
        realmOptions: realms
      });
    });
  }

  // Retrieves the list of items from the Express app
  getCharacterStats = (query, cb) => {
    this.setState({ loading: true });
    const qs = queryString.stringify(query);
    window
      .fetch(`/api/stats/characters?${qs}`)
      .then(res => res.json())
      .then(characterStats => {
        this.setState({
          characterStats,
          loading: false
        });
        if (cb) cb(characterStats);
      });
  };

  handleFilterChange = query => {
    const { history } = this.props;
    const qs = queryString.stringify(query);
    history.push({
      pathname: '/characters',
      search: qs
    });
    this.setState({ query });
    this.getCharacterStats(query);
  };

  render() {
    const { characterStats, realmOptions, query, loading } = this.state;

    let filterPanel;

    if (realmOptions !== null) {
      filterPanel = (
        <BarChartFilterForm realmOptions={realmOptions} onChange={this.handleFilterChange} />
      );
    }

    function LoadingPanel(props) {
      if (props.loading) return <Spinner width={400} height={400} />;
      return <div />;
    }

    const description =
      'Character statistics give an overview about the the class, race and level distribution accross all Wow Classic realms';
    const title =
      'Character statistics - Class / Race / Level distribution - Wow Classic population census project';

    return (
      <div className="App">
        <Helmet>
          <meta name="description" content={description} />
          <meta name="twitter:description" content={description} />
          <meta property="og:description" content={description} />
          <meta property="og:title" content={title} />
          <meta name="twitter:title" content={title} />
          <title>{title}</title>
        </Helmet>
        <h1>Characters</h1>
        {filterPanel}
        <LoadingPanel loading={loading} />
        {characterStats === null ? (
          <div />
        ) : (
          <div>
            <CharacterChart
              realmOptions={realmOptions}
              characterStats={characterStats}
              query={query}
            />
          </div>
        )}
        <p className="intro" style={{ marginTop: '10px' }}>
          The character charts can give you a good idea about the Wow Classic Population especially
          regarding to the balance of factions on a realm as well as about race, class and level
          distribution. Currently there is only census data from the Wow Classic beta and stress
          test realms, but as soon as Classic launches, we aim to cover all this new realms, too.
          You can use the filter options to get an even deeper insight if you wanna take a look into
          something more special. By the way you can also select multiple realms at once.
        </p>
      </div>
    );
  }
}

export default withRouter(Characters);
