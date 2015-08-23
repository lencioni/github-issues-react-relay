const truncateString = require('../lib/truncateString');

class Issue extends React.Component {
  render() {
    return (
      <div>
        <div>
          #{this.props.issue.number}
          {' '}
          {this.props.issue.title}
        </div>

        <div>
          by {this.props.issue.user.login}
        </div>

        <div>
          {truncateString(this.props.issue.body, 140)}
        </div>

        <ul>
          {this.props.issue.labels.map(label =>
            <li>{label}</li>
          )}
        </ul>
      </div>
    );
  }
}

export default Relay.createContainer(Issue, {
  fragments: {
    issue: () => Relay.QL`
      fragment on Issue {
        id,
        body,
        labels,
        number,
        title,
        user {
          id,
          login,
        }
      }
    `,
  },
});
